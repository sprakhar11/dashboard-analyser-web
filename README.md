# Dashboard Analyser Web

A product analytics dashboard built with React, Vite, and Recharts. Visualize feature usage data through interactive bar and line charts, filter by date range, age, and gender, and track user interactions in real time.

## Live Demo

[https://sprakhar11.github.io/dashboard-analyser-web/](https://sprakhar11.github.io/dashboard-analyser-web/)

## Features

- Interactive bar chart (feature totals) and line chart (daily/hourly trends)
- Date range presets (All, Today, 30 Days, FY, 1Y, 2Y, 3Y) with custom date + time selection
- Age and gender filters
- Day/hour toggle for trend granularity
- Cookie-based filter persistence
- Fire-and-forget event tracking
- Auth flow with login, registration (name, email, password, age, gender), and logout
- Public route guard (redirects logged-in users away from login/register)
- Protected route guard (redirects unauthenticated users to login)
- Global backend health check with loading animation

## Tech Stack

- React 19, React Router 7, Recharts 3
- Vite 8 (build + dev server)
- Vitest + React Testing Library + fast-check (property-based testing)

## Run Locally

### Prerequisites

- Node.js 18+
- npm
- Backend server running (ask the author for backend setup details)

### 1. Clone the repo

```bash
git clone https://github.com/sprakhar11/dashboard-analyser-web.git
cd dashboard-analyser-web
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create the environment file

Create a `.env` file in the project root:

```bash
touch .env
```

Add the following content:

```
VITE_BASE_URL=http://localhost:8080
```

> For the production/deployed environment variables, please contact the author.

### 4. Start the dev server

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or the port Vite assigns).

### 5. Run tests

```bash
npm run test
```

### 6. Lint

```bash
npm run lint
```

### 7. Build for production

```bash
npm run build
```

The output will be in the `dist/` folder.

## Project Structure

```
src/
├── components/       # Reusable UI components (charts, filters, forms, route guards)
├── context/          # AuthContext (authentication state)
├── hooks/            # Custom hooks (useDashboard, usePing)
├── pages/            # Page components (Dashboard, Login, Register, Profile)
├── services/         # API clients (analytics, tracking, auth, health)
├── utils/            # Utilities (cookie storage, token storage, browser ID)
└── App.jsx           # Root component with routing and global health check
```
