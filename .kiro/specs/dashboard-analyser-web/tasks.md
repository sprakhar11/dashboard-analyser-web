# Implementation Plan: dashboard-analyser-web

## Overview

Incrementally build a Vite + React SPA with a login page that verifies backend health via a ping endpoint. Each task builds on the previous, starting with project scaffolding, then services, hooks, components, routing, and finally integration wiring. Testing tasks use Vitest, React Testing Library, and fast-check.

## Tasks

- [x] 1. Scaffold Vite + React project and configure environment
  - [x] 1.1 Initialize a new Vite project with the React template, install dependencies (`react-router-dom`, `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`, `fast-check`), and configure Vitest in `vite.config.js`
    - Set up `vitest` with `jsdom` environment in `vite.config.js`
    - _Requirements: 1.1_
  - [x] 1.2 Create `.env` with `VITE_BASE_URL=http://localhost:3000` and `.env.example` documenting the required variable
    - _Requirements: 1.4, 6.1, 6.3_
  - [x] 1.3 Create the directory structure: `src/pages/`, `src/services/`, `src/components/`, and ensure `src/main.jsx` and `src/App.jsx` exist as minimal stubs
    - _Requirements: 1.1, 1.3_

- [x] 2. Implement PingService
  - [x] 2.1 Create `src/services/health.js` exporting an async `ping()` function that sends `GET {VITE_BASE_URL}/api/ping`, throws on non-2xx responses, and returns the parsed JSON `{ appName, appVersion, timestamp, databaseStatus }`
    - Read `VITE_BASE_URL` from `import.meta.env`
    - _Requirements: 3.1, 3.2, 6.1, 6.2_
  - [x] 2.2 Write property test: Ping response parsing preserves all fields
    - **Property 1: Ping response parsing preserves all fields**
    - Generate random `{ appName, appVersion, timestamp, databaseStatus }` objects with `fc.record`. Mock `fetch` to return serialized JSON. Call `ping()` and assert the returned object matches the generated input.
    - **Validates: Requirement 3.2**
  - [x] 2.3 Write property test: Non-success responses produce error state
    - **Property 2: Non-success responses produce error state**
    - Generate random HTTP status codes in 400–599 range with `fc.integer`. Mock `fetch` to return that status. Call `ping()` and assert it throws. Also test with `fetch` rejecting (network error) using `fc.string` for error messages.
    - **Validates: Requirement 3.4**
  - [x] 2.4 Write unit tests for PingService
    - Test `ping()` returns parsed response on 200
    - Test `ping()` throws on 500
    - Test `ping()` throws on network error
    - _Requirements: 3.1, 3.2, 3.4_

- [x] 3. Checkpoint - Verify PingService
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement usePing hook and LoginPage
  - [x] 4.1 Create the `usePing` custom hook (in `src/hooks/usePing.js` or inline in `src/pages/LoginPage.jsx`) that calls `ping()` on mount, manages state (`loading`, `connected`, `disconnected`, `error`), polls every 10 seconds when disconnected or error, and cleans up the interval on unmount or when connected
    - Return `{ status, databaseStatus, error }`
    - _Requirements: 3.1, 3.3, 3.4, 5.2, 5.3_
  - [x] 4.2 Create `src/pages/LoginPage.jsx` that uses `usePing` and conditionally renders: a loading indicator when `status === 'loading'`, `LoginForm` when `status === 'connected'`, `HealthStatusDisplay` when `status === 'disconnected'`, and an error message when `status === 'error'`
    - _Requirements: 3.3, 4.1, 5.1_
  - [x] 4.3 Write property test: Non-connected status is displayed to the user
    - **Property 3: Non-connected status is displayed to the user**
    - Generate random strings not equal to `"connected"` using `fc.string().filter(s => s !== 'connected')`. Mock ping response with that `databaseStatus`. Render `LoginPage` and assert the rendered output contains the generated status string and does not contain the login form.
    - **Validates: Requirements 5.1, 5.4**
  - [x] 4.4 Write unit tests for LoginPage
    - Test loading indicator shown while ping is pending
    - Test `LoginForm` rendered when `databaseStatus` is `"connected"`
    - Test `HealthStatusDisplay` rendered when `databaseStatus` is not `"connected"`
    - Test error message shown and retry on ping failure
    - Test transition from disconnected to connected on subsequent poll
    - Test polling interval cleared on unmount
    - _Requirements: 3.3, 3.4, 4.1, 5.1, 5.2, 5.3_

- [x] 5. Implement presentational components
  - [x] 5.1 Create `src/components/LoginForm.jsx` accepting an `onSubmit` prop, rendering an email input, password input, and submit button. On submit, call `onSubmit(email, password)`
    - _Requirements: 4.1, 4.2, 4.3_
  - [x] 5.2 Create `src/components/HealthStatusDisplay.jsx` accepting a `databaseStatus` prop and rendering the status text clearly to the user
    - _Requirements: 5.1, 5.4_
  - [x] 5.3 Write unit tests for LoginForm and HealthStatusDisplay
    - Test LoginForm contains email input, password input, and submit button
    - Test HealthStatusDisplay renders the provided status text
    - _Requirements: 4.2, 4.3, 5.4_

- [x] 6. Wire up routing and App shell
  - [x] 6.1 Configure React Router in `src/App.jsx` with a route mapping `/login` to `LoginPage`
    - _Requirements: 2.1, 2.2_
  - [x] 6.2 Update `src/main.jsx` to render `<App />` into the DOM root
    - _Requirements: 1.1_
  - [x] 6.3 Write unit test verifying `/login` route renders LoginPage
    - _Requirements: 2.2_

- [x] 7. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
