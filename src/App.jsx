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

function AppRoutes() {
  const { status, databaseStatus } = usePing();
  const hasConnected = useRef(false);

  if (status === 'connected') {
    hasConnected.current = true;
  }

  if (!hasConnected.current) {
    if (status === 'loading') {
      return <div style={centerStyle}><p>Loading...</p></div>;
    }
    if (status === 'error') {
      return <div style={centerStyle}><p role="status">Connecting to backend...</p></div>;
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
