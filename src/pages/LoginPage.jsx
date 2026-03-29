import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { usePing } from '../hooks/usePing.js';
import { useAuth } from '../context/AuthContext.jsx';
import LoginForm from '../components/LoginForm.jsx';
import HealthStatusDisplay from '../components/HealthStatusDisplay.jsx';

function getErrorMessage(err) {
  switch (err.code) {
    case 'INVALID_CREDENTIALS':
      return 'Invalid email or password';
    case 'USER_ALREADY_LOGGED_IN_ANOTHER_BROWSER':
      return 'You are already logged in from another browser';
    case 'VALIDATION_ERROR':
    case 'INTERNAL_ERROR':
      return err.message;
    default:
      return err.message || 'An unexpected error occurred';
  }
}

export default function LoginPage() {
  const { status, databaseStatus, error } = usePing();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loginError, setLoginError] = useState(null);

  const successMessage = location.state?.message;

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  if (status === 'error') {
    return <p role="status">Connecting to backend...</p>;
  }

  if (status === 'disconnected') {
    return <HealthStatusDisplay databaseStatus={databaseStatus} />;
  }

  // status === 'connected'
  return (
    <>
      {successMessage && <p role="status">{successMessage}</p>}
      {loginError && <p role="alert">{loginError}</p>}
      <LoginForm
        onSubmit={async (email, password) => {
          setLoginError(null);
          try {
            await login(email, password);
            navigate('/');
          } catch (err) {
            setLoginError(getErrorMessage(err));
          }
        }}
      />
      <p>
        Don&apos;t have an account? <Link to="/register">Register</Link>
      </p>
    </>
  );
}
