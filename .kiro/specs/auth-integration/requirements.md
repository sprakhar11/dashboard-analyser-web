# Requirements Document

## Introduction

This document defines the requirements for integrating the Authentication API (#[[file:auth-api.md]]) into the existing Vite + React frontend application. The integration covers user registration, login with browser-aware session management, authenticated user profile retrieval, logout, and global auth state management. The auth API runs at a separate base URL (`http://localhost:8080`) from the existing health-check backend (`http://localhost:3000`). Token-based authentication uses the `auth-token` HTTP header, and a client-generated `browserId` (UUID stored in localStorage) enables session reuse per browser.

## Glossary

- **App**: The Vite + React single-page application
- **Auth_Service**: The API service module (`src/services/auth.js`) responsible for calling the authentication endpoints
- **Auth_Context**: The React context provider that holds the current authentication state (token, user profile, loading status) and exposes login, register, logout, and profile-fetch functions to the component tree
- **Login_Page**: The route-level page component rendered at `/login`
- **Register_Page**: The route-level page component rendered at `/register`
- **Login_Form**: The existing UI component containing email and password input fields
- **Register_Form**: The UI component containing name, email, and password input fields for user registration
- **Protected_Route**: A route wrapper component that redirects unauthenticated users to the Login_Page
- **Auth_API**: The external authentication API server described in #[[file:auth-api.md]], running at `http://localhost:8080`
- **Token**: A UUID string returned by the Auth_API login endpoint, stored in localStorage and sent via the `auth-token` HTTP header
- **Browser_ID**: A client-generated UUID stored in localStorage, sent with every login request to enable browser-aware session management
- **AUTH_BASE_URL**: The environment variable (`VITE_AUTH_BASE_URL`) holding the Auth_API base URL

## Requirements

### Requirement 1: Auth Service Module

**User Story:** As a developer, I want a dedicated service module for all authentication API calls, so that API logic is centralized and reusable across components.

#### Acceptance Criteria

1. THE Auth_Service SHALL expose a `register` function that sends a POST request to `{AUTH_BASE_URL}/api/auth/register` with `name`, `email`, and `password` in the JSON body.
2. THE Auth_Service SHALL expose a `login` function that sends a POST request to `{AUTH_BASE_URL}/api/auth/login` with `email`, `password`, and `browserId` in the JSON body.
3. THE Auth_Service SHALL expose a `getProfile` function that sends a GET request to `{AUTH_BASE_URL}/api/auth/me` with the Token in the `auth-token` header.
4. THE Auth_Service SHALL expose a `logout` function that sends a POST request to `{AUTH_BASE_URL}/api/auth/logout` with the Token in the `auth-token` header.
5. THE Auth_Service SHALL read the Auth_API base URL from the `VITE_AUTH_BASE_URL` environment variable.
6. IF any Auth_Service function receives a non-success HTTP response, THEN THE Auth_Service SHALL throw an error containing the `error` code and `message` from the response body.

### Requirement 2: Browser ID Management

**User Story:** As a developer, I want a stable browser identifier generated and persisted per browser instance, so that the Auth_API can manage sessions per browser.

#### Acceptance Criteria

1. WHEN the App loads and no Browser_ID exists in localStorage, THE App SHALL generate a new UUID and store it in localStorage under a consistent key.
2. WHEN the App loads and a Browser_ID already exists in localStorage, THE App SHALL reuse the existing Browser_ID.
3. THE Auth_Service login function SHALL include the Browser_ID from localStorage in every login request.

### Requirement 3: Token Storage and Retrieval

**User Story:** As a developer, I want the auth token persisted in localStorage, so that the user remains authenticated across page reloads.

#### Acceptance Criteria

1. WHEN the Auth_Service login function receives a successful response, THE App SHALL store the returned Token in localStorage.
2. WHEN the Auth_Service logout function receives a successful response, THE App SHALL remove the Token from localStorage.
3. THE Auth_Service SHALL read the Token from localStorage when making authenticated requests (getProfile, logout).
4. WHEN the App loads, THE Auth_Context SHALL check localStorage for an existing Token and attempt to restore the session by calling getProfile.

### Requirement 4: Auth Context and State Management

**User Story:** As a developer, I want a centralized auth context, so that any component in the tree can access the current user and auth actions.

#### Acceptance Criteria

1. THE Auth_Context SHALL provide the current user profile (userId, name, email) or `null` when unauthenticated.
2. THE Auth_Context SHALL provide an `isAuthenticated` boolean derived from the presence of a valid user profile.
3. THE Auth_Context SHALL provide a `loading` boolean that is `true` while the initial session restoration is in progress.
4. THE Auth_Context SHALL expose `login`, `register`, `logout`, and `fetchProfile` functions to consuming components.
5. WHEN the `login` function succeeds, THE Auth_Context SHALL store the Token, fetch the user profile via getProfile, and update the user state.
6. WHEN the `logout` function succeeds, THE Auth_Context SHALL clear the Token and set the user state to `null`.
7. WHEN the `register` function succeeds, THE Auth_Context SHALL NOT automatically log the user in, because the Auth_API does not return a Token on registration.

### Requirement 5: Login Page Integration

**User Story:** As a user, I want to log in with my email and password on the login page, so that I can access protected areas of the application.

#### Acceptance Criteria

1. WHEN the user submits the Login_Form with valid credentials, THE Login_Page SHALL call the Auth_Context login function with the provided email and password.
2. WHEN login succeeds, THE Login_Page SHALL redirect the user to the root route (`/`).
3. IF login fails with an `INVALID_CREDENTIALS` error, THEN THE Login_Page SHALL display a message stating that the email or password is incorrect.
4. IF login fails with a `USER_ALREADY_LOGGED_IN_ANOTHER_BROWSER` error, THEN THE Login_Page SHALL display a message informing the user that an active session exists in another browser.
5. IF login fails with a `VALIDATION_ERROR` or `INTERNAL_ERROR`, THEN THE Login_Page SHALL display the error message from the response.
6. THE Login_Page SHALL provide a link to the Register_Page for users who do not have an account.

### Requirement 6: Registration Page

**User Story:** As a new user, I want to register an account with my name, email, and password, so that I can then log in to the application.

#### Acceptance Criteria

1. WHEN a user navigates to `/register`, THE App SHALL render the Register_Page.
2. THE Register_Form SHALL contain input fields for name, email, and password.
3. WHEN the user submits the Register_Form with valid data, THE Register_Page SHALL call the Auth_Service register function.
4. WHEN registration succeeds, THE Register_Page SHALL redirect the user to the Login_Page with a success message indicating that the account was created and the user should log in.
5. IF registration fails with an `EMAIL_ALREADY_EXISTS` error, THEN THE Register_Page SHALL display a message stating that the email is already registered.
6. IF registration fails with a `VALIDATION_ERROR` or `INTERNAL_ERROR`, THEN THE Register_Page SHALL display the error message from the response.
7. THE Register_Page SHALL provide a link to the Login_Page for users who already have an account.

### Requirement 7: Protected Routes

**User Story:** As a developer, I want route-level protection, so that unauthenticated users are redirected to the login page when accessing protected content.

#### Acceptance Criteria

1. WHEN an unauthenticated user navigates to a route wrapped by Protected_Route, THE App SHALL redirect the user to `/login`.
2. WHILE the Auth_Context `loading` state is `true`, THE Protected_Route SHALL display a loading indicator instead of redirecting.
3. WHEN an authenticated user navigates to a route wrapped by Protected_Route, THE Protected_Route SHALL render the child route component.

### Requirement 8: Unauthorized Response Handling

**User Story:** As a user, I want to be redirected to the login page when my session expires or becomes invalid, so that I can re-authenticate.

#### Acceptance Criteria

1. WHEN any authenticated Auth_Service request receives a 401 HTTP response, THE App SHALL remove the Token from localStorage, clear the user state in Auth_Context, and redirect the user to `/login`.
2. THE App SHALL handle 401 responses consistently across all authenticated endpoints (getProfile, logout).

### Requirement 9: Environment Variable Configuration

**User Story:** As a developer, I want the auth API base URL configured via a separate environment variable, so that the auth backend and health-check backend can run on different hosts.

#### Acceptance Criteria

1. THE Auth_Service SHALL read the auth API base URL from the `VITE_AUTH_BASE_URL` environment variable.
2. THE App SHALL include `VITE_AUTH_BASE_URL` in the `.env.example` file with a descriptive comment.
3. THE App SHALL not hardcode the Auth_API base URL anywhere in the source code.
4. THE existing `VITE_BASE_URL` variable used by the Ping_Service SHALL remain unchanged.

### Requirement 10: User Profile Page

**User Story:** As an authenticated user, I want to view my profile information, so that I can verify my account details and log out.

#### Acceptance Criteria

1. WHEN an authenticated user navigates to `/profile`, THE App SHALL render a profile page displaying the user's name and email from Auth_Context.
2. THE profile page SHALL include a logout button.
3. WHEN the user clicks the logout button, THE App SHALL call the Auth_Context logout function and redirect the user to `/login`.
4. THE `/profile` route SHALL be wrapped by Protected_Route.
