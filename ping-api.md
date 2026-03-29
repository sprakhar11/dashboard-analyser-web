# Ping API Documentation

## Overview

The Ping API is a health check endpoint that returns the application status and database connectivity. Use it to verify the backend is running and the database connection is healthy.

**Base URL:** `http://localhost:8080`

---

## Endpoint

### GET /api/ping

Returns application info and database connection status.

**Authentication:** Not required (public endpoint)

#### Request

No request body or parameters required.

#### Success Response

**Status:** `200 OK`

| Field            | Type   | Description                                                        |
|------------------|--------|--------------------------------------------------------------------|
| `appName`        | string | Application name (configured via `app.name` property)              |
| `appVersion`     | string | Application version (configured via `app.version` property)        |
| `timestamp`      | string | Current server time in ISO 8601 UTC format (e.g., `2026-03-28T14:22:56.228065Z`) |
| `databaseStatus` | string | `"connected"` if the database is reachable, `"disconnected"` otherwise |

#### Example

**Request:**
```bash
curl http://localhost:8080/api/ping
```

**Response — Database Connected (200):**
```json
{
  "appName": "ping-service",
  "appVersion": "1.0.0",
  "timestamp": "2026-03-28T14:22:56.228065Z",
  "databaseStatus": "connected"
}
```

**Response — Database Disconnected (200):**
```json
{
  "appName": "ping-service",
  "appVersion": "1.0.0",
  "timestamp": "2026-03-28T14:22:56.228065Z",
  "databaseStatus": "disconnected"
}
```

if any other response is returned then keep polling 

> Note: The endpoint always returns `200 OK` even when the database is disconnected. Check the `databaseStatus` field to determine connectivity.

---

## Frontend Integration Notes

- Use this endpoint as a health check before showing the login page to verify the backend is reachable.
- The `databaseStatus` field can be used to show a maintenance banner if the database is down.
- No `auth-token` header is needed — this endpoint is publicly accessible.
