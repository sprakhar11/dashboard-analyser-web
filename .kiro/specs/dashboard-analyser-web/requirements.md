# Requirements Document

## Introduction

This document defines the requirements for the "dashboard-analyser-web" React frontend application. The application provides a login page that first verifies backend health by calling a ping endpoint. Based on the database connectivity status returned by the ping API, the application either displays a login form or shows the current backend status and polls until the database becomes connected. The project follows a structured layout with pages, services, and reusable components, and uses React Router for navigation.

## Glossary

- **App**: The dashboard-analyser-web React single-page application
- **Login_Page**: The route-level page component rendered at the `/login` route
- **Ping_Service**: The API service module responsible for calling the backend health check endpoint
- **Health_Status_Display**: The UI component that shows the current database status when the backend is not fully connected
- **Login_Form**: The UI component containing email and password input fields for user authentication
- **Backend**: The external API server that the App communicates with, running separately from this repository
- **BASE_URL**: The backend server base URL, stored as an environment variable in the `.env` file

## Requirements

### Requirement 1: Project Scaffolding

**User Story:** As a developer, I want the React project scaffolded with a standard folder structure, so that I can develop features in an organized and maintainable codebase.

#### Acceptance Criteria

1. THE App SHALL be a React single-page application with an entry point at `src/main.jsx` and a root component at `src/App.jsx`.
2. THE App SHALL store the backend base URL in a `.env` file at the project root using the appropriate environment variable prefix for the chosen build tool.
3. THE App SHALL organize page components in `src/pages/`, API service functions in `src/services/`, and reusable UI components in `src/components/`.
4. THE App SHALL include a `.env` entry (e.g., `VITE_BASE_URL`) that holds the Backend base URL.

### Requirement 2: Client-Side Routing

**User Story:** As a user, I want the application to use client-side routing, so that I can navigate to the login page via the `/login` route.

#### Acceptance Criteria

1. THE App SHALL use React Router to handle client-side routing.
2. WHEN a user navigates to the `/login` route, THE App SHALL render the Login_Page component.

### Requirement 3: Backend Health Check on Login Page Load

**User Story:** As a user, I want the application to check backend health when the login page loads, so that I know the system is ready before I attempt to log in.

#### Acceptance Criteria

1. WHEN the Login_Page loads, THE Ping_Service SHALL send a GET request to `{BASE_URL}/api/ping`.
2. THE Ping_Service SHALL parse the JSON response containing `appName`, `appVersion`, `timestamp`, and `databaseStatus` fields.
3. WHILE the Ping_Service is awaiting a response from the ping endpoint, THE Login_Page SHALL display a loading indicator to the user.
4. IF the GET request to the ping endpoint fails due to a network error or non-success HTTP status, THEN THE Login_Page SHALL display an error message describing the failure and retry the ping request after 10 seconds.

### Requirement 4: Login Form Display on Healthy Backend

**User Story:** As a user, I want to see the login form when the backend database is connected, so that I can enter my credentials and log in.

#### Acceptance Criteria

1. WHEN the Ping_Service returns a response where `databaseStatus` is `"connected"`, THE Login_Page SHALL display the Login_Form.
2. THE Login_Form SHALL contain an email input field and a password input field.
3. THE Login_Form SHALL contain a submit button for initiating the login action.

### Requirement 5: Database Status Display and Polling on Unhealthy Backend

**User Story:** As a user, I want to see the current database status and have the app automatically retry when the backend is not ready, so that I am informed and do not need to manually refresh.

#### Acceptance Criteria

1. WHEN the Ping_Service returns a response where `databaseStatus` is not `"connected"`, THE Login_Page SHALL display the Health_Status_Display showing the current `databaseStatus` value.
2. WHILE `databaseStatus` is not `"connected"`, THE Ping_Service SHALL poll the `{BASE_URL}/api/ping` endpoint every 10 seconds.
3. WHEN a subsequent poll returns `databaseStatus` as `"connected"`, THE Login_Page SHALL hide the Health_Status_Display and display the Login_Form.
4. THE Health_Status_Display SHALL clearly present the current `databaseStatus` text so the user understands the backend state.

### Requirement 6: Environment Variable Configuration

**User Story:** As a developer, I want the backend base URL configured via an environment variable, so that I can easily switch between environments without code changes.

#### Acceptance Criteria

1. THE Ping_Service SHALL read the backend base URL from the environment variable defined in the `.env` file.
2. THE App SHALL not hardcode the Backend base URL anywhere in the source code.
3. THE App SHALL include a `.env.example` file documenting the required environment variables for developer onboarding.
