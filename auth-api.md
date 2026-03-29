# Authentication API Documentation

## Overview

The Authentication API provides user registration, login with browser-aware session management, logout, and authenticated user profile retrieval. Authentication is token-based — tokens are stored in the database (not JWT). Every protected request must include the token in the `auth-token` HTTP header.

**Base URL:** `http://localhost:8080`

**Content-Type:** All request bodies must be `application/json`

---

## Authentication

All endpoints under `/api/auth/me` and `/api/auth/logout` require authentication. Include the token received from the login response in the `auth-token` header:

```
auth-token: <your-token-value>
```

Public endpoints (no authentication required):
- `POST /api/auth/register`
- `POST /api/auth/login`

---

## Endpoints

---

### 1. Register User

Creates a new user account. No authentication token is created during registration — the user must call the login endpoint separately after registering.

**URL:** `POST /api/auth/register`

**Authentication:** Not required

#### Request Body

| Field      | Type   | Required | Description                        |
|------------|--------|----------|------------------------------------|
| `name`     | string | Yes      | User's display name (max 100 chars)|
| `email`    | string | Yes      | User's email address (max 255 chars, must be unique among active users) |
| `password` | string | Yes      | User's plaintext password (will be hashed server-side using SHA-256) |

#### Success Response

**Status:** `200 OK`

| Field     | Type   | Description                          |
|-----------|--------|--------------------------------------|
| `userId`  | number | The newly created user's ID          |
| `email`   | string | The registered email address         |
| `message` | string | Confirmation message                 |

#### Error Responses

| Status | Error Code              | Condition                                      |
|--------|-------------------------|-------------------------------------------------|
| 409    | `EMAIL_ALREADY_EXISTS`  | An active user with this email already exists   |
| 400    | `VALIDATION_ERROR`      | Missing or invalid request body fields          |
| 500    | `INTERNAL_ERROR`        | Unexpected server error                         |

#### Example

**Request:**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "mypassword123"
  }'
```

**Success Response (200):**
```json
{
  "userId": 1,
  "email": "john@example.com",
  "message": "User registered successfully"
}
```

**Error Response — Duplicate Email (409):**
```json
{
  "error": "EMAIL_ALREADY_EXISTS",
  "message": "Email is already registered"
}
```

---

### 2. Login

Authenticates a user and returns a session token. The token is tied to a `browserId` which enables browser-aware session management.

**URL:** `POST /api/auth/login`

**Authentication:** Not required

#### Request Body

| Field       | Type   | Required | Description                                                                 |
|-------------|--------|----------|-----------------------------------------------------------------------------|
| `email`     | string | Yes      | Registered email address                                                    |
| `password`  | string | Yes      | User's plaintext password                                                   |
| `browserId` | string | Yes      | A client-generated identifier for the browser/device (e.g., UUID, fingerprint) |

#### Success Response

**Status:** `200 OK`

| Field              | Type    | Description                                                                 |
|--------------------|---------|-----------------------------------------------------------------------------|
| `userId`           | number  | The authenticated user's ID                                                 |
| `email`            | string  | The user's email address                                                    |
| `token`            | string  | The authentication token (UUID format). Use this in the `auth-token` header for protected endpoints |
| `expiryDate`       | string  | Token expiry timestamp in ISO 8601 format (e.g., `2026-03-29T19:44:42.168`) |
| `sameBrowserReuse` | boolean | `true` if an existing active token for the same `browserId` was reused; `false` if a new token was created |

#### Session Management Behavior

The login endpoint implements browser-aware session management:

| Scenario | Behavior | `sameBrowserReuse` |
|----------|----------|--------------------|
| No active token exists for the user | Creates a new token | `false` |
| Active token exists for the **same** `browserId` | Returns the existing token (no new token created) | `true` |
| Active token exists for a **different** `browserId` and user has `multipleSessionAllowed = true` | Creates a new token (both sessions coexist) | `false` |
| Active token exists for a **different** `browserId` and user has `multipleSessionAllowed = false` | Rejects login with 403 error | N/A |
| Previous token for same `browserId` is expired or logged out | Creates a new token | `false` |

#### Error Responses

| Status | Error Code                                | Condition                                                        |
|--------|-------------------------------------------|------------------------------------------------------------------|
| 401    | `INVALID_CREDENTIALS`                     | Email not found, user is soft-deleted, or password is incorrect  |
| 403    | `USER_ALREADY_LOGGED_IN_ANOTHER_BROWSER`  | User has an active session in another browser and `multipleSessionAllowed` is `false` |
| 400    | `VALIDATION_ERROR`                        | Missing or invalid request body fields                           |
| 500    | `INTERNAL_ERROR`                          | Unexpected server error                                          |

> **Security note:** The API intentionally returns the same `INVALID_CREDENTIALS` error for both "email not found" and "wrong password" to avoid leaking whether an email is registered.

#### Examples

**Request:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "mypassword123",
    "browserId": "browser-abc-123"
  }'
```

**Success Response — New Token (200):**
```json
{
  "userId": 1,
  "email": "john@example.com",
  "token": "503b8b97-76d7-4e26-8726-0b5ab0ba9af7",
  "expiryDate": "2026-03-29T19:44:42.16867",
  "sameBrowserReuse": false
}
```

**Success Response — Reused Token from Same Browser (200):**
```json
{
  "userId": 1,
  "email": "john@example.com",
  "token": "503b8b97-76d7-4e26-8726-0b5ab0ba9af7",
  "expiryDate": "2026-03-29T19:44:42.16867",
  "sameBrowserReuse": true
}
```

**Error Response — Wrong Password (401):**
```json
{
  "error": "INVALID_CREDENTIALS",
  "message": "Invalid email or password"
}
```

**Error Response — Already Logged In from Another Browser (403):**
```json
{
  "error": "USER_ALREADY_LOGGED_IN_ANOTHER_BROWSER",
  "message": "User is already logged in from another browser"
}
```

---

### 3. Get Current User Profile

Returns the authenticated user's profile information.

**URL:** `GET /api/auth/me`

**Authentication:** Required

#### Request Headers

| Header       | Type   | Required | Description                    |
|--------------|--------|----------|--------------------------------|
| `auth-token` | string | Yes      | Active authentication token    |

#### Success Response

**Status:** `200 OK`

| Field    | Type   | Description              |
|----------|--------|--------------------------|
| `userId` | number | The user's ID            |
| `name`   | string | The user's display name  |
| `email`  | string | The user's email address |

#### Error Responses

| Status | Error Code     | Condition                                                    |
|--------|----------------|--------------------------------------------------------------|
| 401    | `UNAUTHORIZED` | Missing `auth-token` header, invalid token, expired token, or logged-out token |

#### Example

**Request:**
```bash
curl http://localhost:8080/api/auth/me \
  -H "auth-token: 503b8b97-76d7-4e26-8726-0b5ab0ba9af7"
```

**Success Response (200):**
```json
{
  "userId": 1,
  "name": "John Doe",
  "email": "john@example.com"
}
```

**Error Response — Invalid/Missing Token (401):**
```json
{
  "error": "UNAUTHORIZED",
  "message": "Authentication required"
}
```

---

### 4. Logout

Invalidates the current authentication token by setting a logout timestamp. The token cannot be used for any further requests after logout.

**URL:** `POST /api/auth/logout`

**Authentication:** Required

#### Request Headers

| Header       | Type   | Required | Description                    |
|--------------|--------|----------|--------------------------------|
| `auth-token` | string | Yes      | Active authentication token    |

#### Success Response

**Status:** `200 OK`

| Field     | Type   | Description          |
|-----------|--------|----------------------|
| `message` | string | Confirmation message |

#### Error Responses

| Status | Error Code     | Condition                                                    |
|--------|----------------|--------------------------------------------------------------|
| 401    | `UNAUTHORIZED` | Missing `auth-token` header, invalid token, expired token, or already logged-out token |

#### Example

**Request:**
```bash
curl -X POST http://localhost:8080/api/auth/logout \
  -H "auth-token: 503b8b97-76d7-4e26-8726-0b5ab0ba9af7"
```

**Success Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

## Error Response Format

All error responses follow a consistent JSON structure:

```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable description"
}
```

### Complete Error Code Reference

| HTTP Status | Error Code                                | Description                                              |
|-------------|-------------------------------------------|----------------------------------------------------------|
| 400         | `VALIDATION_ERROR`                        | Request body is missing required fields or has invalid values |
| 401         | `INVALID_CREDENTIALS`                     | Email not found or password is incorrect                 |
| 401         | `UNAUTHORIZED`                            | Missing, invalid, expired, or logged-out auth token      |
| 403         | `USER_ALREADY_LOGGED_IN_ANOTHER_BROWSER`  | Single-session user already has an active session in a different browser |
| 409         | `EMAIL_ALREADY_EXISTS`                    | Registration attempted with an email that is already in use |
| 500         | `INTERNAL_ERROR`                          | Unexpected server error                                  |

---

## Token Lifecycle

```
Register ──→ Login ──→ Use Token ──→ Logout
                │                       │
                │                       ▼
                │               Token Invalidated
                │               (log_out_date set)
                │
                ▼
         Token Expires
         (after 24 hours by default)
```

1. **Creation:** Tokens are created during login. Each token is a UUID string.
2. **Expiry:** Tokens expire after 24 hours (configurable). Expired tokens are automatically rejected.
3. **Invalidation:** Calling `/api/auth/logout` sets a logout timestamp on the token, making it immediately invalid.
4. **Reuse:** If a user logs in again with the same `browserId` while their token is still active, the existing token is returned instead of creating a new one.

---

## Complete Flow Example

### Step 1: Register
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Jane Smith", "email": "jane@example.com", "password": "securepass456"}'
```
```json
{"userId": 3, "email": "jane@example.com", "message": "User registered successfully"}
```

### Step 2: Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "jane@example.com", "password": "securepass456", "browserId": "chrome-main"}'
```
```json
{"userId": 3, "email": "jane@example.com", "token": "a1b2c3d4-e5f6-7890-abcd-ef1234567890", "expiryDate": "2026-03-29T14:30:00.000", "sameBrowserReuse": false}
```

### Step 3: Access Protected Endpoint
```bash
curl http://localhost:8080/api/auth/me \
  -H "auth-token: a1b2c3d4-e5f6-7890-abcd-ef1234567890"
```
```json
{"userId": 3, "name": "Jane Smith", "email": "jane@example.com"}
```

### Step 4: Login Again from Same Browser (Token Reused)
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "jane@example.com", "password": "securepass456", "browserId": "chrome-main"}'
```
```json
{"userId": 3, "email": "jane@example.com", "token": "a1b2c3d4-e5f6-7890-abcd-ef1234567890", "expiryDate": "2026-03-29T14:30:00.000", "sameBrowserReuse": true}
```

### Step 5: Logout
```bash
curl -X POST http://localhost:8080/api/auth/logout \
  -H "auth-token: a1b2c3d4-e5f6-7890-abcd-ef1234567890"
```
```json
{"message": "Logged out successfully"}
```

### Step 6: Verify Token is Invalidated
```bash
curl http://localhost:8080/api/auth/me \
  -H "auth-token: a1b2c3d4-e5f6-7890-abcd-ef1234567890"
```
```json
{"error": "UNAUTHORIZED", "message": "Authentication required"}
```

---

## Frontend Integration Notes

- **Storing the token:** After a successful login, store the `token` value (e.g., in `localStorage` or a cookie). Include it in the `auth-token` header for all subsequent API calls to protected endpoints.
- **Generating `browserId`:** Generate a unique identifier per browser instance. A UUID stored in `localStorage` works well. This enables the server to detect same-browser re-logins and reuse tokens.
- **Handling 401 responses:** Any `401 UNAUTHORIZED` response means the token is invalid, expired, or logged out. Redirect the user to the login page.
- **Handling 403 responses:** A `403` with error code `USER_ALREADY_LOGGED_IN_ANOTHER_BROWSER` means the user has an active session elsewhere. Display an appropriate message to the user.
- **Token expiry:** The `expiryDate` field in the login response tells you when the token will expire. You can use this to proactively refresh the session or warn the user before expiry.
- **No token on register:** Registration does not return a token. The frontend must call the login endpoint after successful registration to obtain a token.
