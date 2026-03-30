import { useRef } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { usePing } from './hooks/usePing.js';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import PublicRoute from './components/PublicRoute.jsx';
import HealthStatusDisplay from './components/HealthStatusDisplay.jsx';
import DashboardPage from './pages/DashboardPage.jsx';

const centerStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#f8f8fa',
  colorScheme: 'light',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  color: '#555',
};

const spinnerKeyframes = `
  @keyframes app-spin {
    to { transform: rotate(360deg); }
  }
`;

const spinnerStyle = {
  width: '36px',
  height: '36px',
  border: '3px solid #e5e4e7',
  borderTop: '3px solid #4f8df5',
  borderRadius: '50%',
  animation: 'app-spin 0.8s linear infinite',
};

function ConnectingScreen() {
  return (
    <div style={{ ...centerStyle, flexDirection: 'column', gap: '16px' }}>
      <style>{spinnerKeyframes}</style>
      <div style={spinnerStyle} />
      <p role="status" style={{ margin: 0, fontSize: '15px', color: '#08060d', fontWeight: 500 }}>Connecting to server...</p>
      <p style={{ margin: 0, fontSize: '13px', color: '#888' }}>If this takes more than 3–5 minutes, check that the backend is running.</p>
    </div>
  );
}

function AppRoutes() {
  const { status, databaseStatus } = usePing();
  const hasConnected = useRef(false);

  if (status === 'connected') {
    hasConnected.current = true;
  }

  if (!hasConnected.current) {
    if (status === 'loading' || status === 'error') {
      return <ConnectingScreen />;
    }
    if (status === 'disconnected') {
      return <HealthStatusDisplay databaseStatus={databaseStatus} />;
    }
  }

  return (
    <Routes>
      <Route path="/login" element={
        <PublicRoute><LoginPage /></PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute><RegisterPage /></PublicRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute><ProfilePage /></ProtectedRoute>
      } />
      <Route path="/" element={
        <ProtectedRoute><DashboardPage /></ProtectedRoute>
      } />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
