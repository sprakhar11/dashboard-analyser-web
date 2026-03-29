# Implementation Plan: auth-integration

## Overview

Integrate the Authentication API into the existing Vite + React frontend. Tasks proceed from environment config, through utility modules and auth service, to React context, protected routes, page components, and routing wiring.

## Tasks

- [x] 1. Environment configuration
  - [x] 1.1 Add `VITE_AUTH_BASE_URL=http://localhost:8080` to `.env` and update `.env.example` with a descriptive comment
    - Do not modify the existing `VITE_BASE_URL` entry
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 2. Utility modules (no dependencies)
  - [x] 2.1 Create `src/utils/browserId.js` exporting `getBrowserId()` — returns the existing `browser_id` from localStorage or generates a new UUID via `crypto.randomUUID()` and stores it
    - _Requirements: 2.1, 2.2_
  - [x] 2.2 Create `src/utils/tokenStorage.js` exporting `getToken()`, `setToken(token)`, and `removeToken()` — thin wrappers around localStorage for the `auth_token` key
    - _Requirements: 3.1, 3.2, 3.3_

- [x] 3. Auth service module
  - [x] 3.1 Create `src/services/auth.js` exporting `register(name, email, password)`, `login(email, password, browserId)`, `getProfile(token)`, and `logout(token)` — each calls the corresponding Auth API endpoint using `VITE_AUTH_BASE_URL` from `import.meta.env`, with shared error handling that throws `{ code, message, status }` on non-success responses
    - Follow the same pattern as `src/services/health.js`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [x] 4. Checkpoint — Verify service and utility modules
  - Ensure all modules export correctly and have no syntax/type issues.

- [x] 5. AuthContext provider
  - [x] 5.1 Create `src/context/AuthContext.jsx` exporting `AuthProvider` and `useAuth` hook — manages `user`, `isAuthenticated`, `loading` state; on mount checks `getToken()` and calls `getProfile` to restore session; exposes `login`, `register`, `logout`, `fetchProfile` functions; handles 401 by clearing token and user state
    - `login(email, password)` calls `getBrowserId()`, then `authService.login()`, stores token via `setToken()`, fetches profile, updates user state
    - `register(name, email, password)` calls `authService.register()` and returns the result without auto-login
    - `logout()` calls `authService.logout(token)`, then `removeToken()`, sets user to null
    - 401 handling: if `getProfile` or `logout` throws with `status === 401`, call `removeToken()` and set user to null
    - _Requirements: 3.4, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 8.1, 8.2_

- [x] 6. ProtectedRoute component
  - [x] 6.1 Create `src/components/ProtectedRoute.jsx` — uses `useAuth()` to read `loading` and `isAuthenticated`; shows loading indicator while loading, redirects to `/login` via `<Navigate>` when unauthenticated, renders children when authenticated
    - _Requirements: 7.1, 7.2, 7.3_

- [x] 7. Update LoginPage to wire auth
  - [x] 7.1 Update `src/pages/LoginPage.jsx` — import `useAuth` and `useNavigate`; wire `onSubmit` to call `login(email, password)`; on success navigate to `/`; display error messages based on error code (`INVALID_CREDENTIALS`, `USER_ALREADY_LOGGED_IN_ANOTHER_BROWSER`, etc.); add a link to `/register`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [x] 8. RegisterPage and RegisterForm
  - [x] 8.1 Create `src/components/RegisterForm.jsx` — presentational form with name, email, and password fields; calls `onSubmit(name, email, password)` on submit
    - _Requirements: 6.2_
  - [x] 8.2 Create `src/pages/RegisterPage.jsx` — renders `RegisterForm`; on submit calls `useAuth().register(name, email, password)`; on success navigates to `/login` with a success message; displays errors for `EMAIL_ALREADY_EXISTS`, `VALIDATION_ERROR`, `INTERNAL_ERROR`; includes link to `/login`
    - _Requirements: 6.1, 6.3, 6.4, 6.5, 6.6, 6.7_

- [x] 9. ProfilePage
  - [x] 9.1 Create `src/pages/ProfilePage.jsx` — uses `useAuth()` to read `user` and `logout`; displays `user.name` and `user.email`; logout button calls `logout()` then navigates to `/login`
    - _Requirements: 10.1, 10.2, 10.3_

- [x] 10. Update App.jsx routing
  - [x] 10.1 Update `src/App.jsx` — wrap `BrowserRouter` with `AuthProvider`; add routes for `/register` → `RegisterPage`, `/profile` → `ProtectedRoute` → `ProfilePage`, `/` → `ProtectedRoute` → placeholder home
    - Keep existing `/login` route
    - _Requirements: 6.1, 7.1, 7.3, 10.4_

- [x] 11. Final checkpoint — Verify build and no errors
  - Ensure the project builds without errors and all modules are wired correctly.

## Notes

- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Test tasks have been excluded per user request and can be added later
