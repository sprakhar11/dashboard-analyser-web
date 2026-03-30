import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import LoginForm from '../components/LoginForm.jsx';

const pageStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#f8f8fa',
  colorScheme: 'light',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const cardStyle = {
  width: '100%',
  maxWidth: '400px',
  background: '#fff',
  border: '1px solid #e5e4e7',
  borderRadius: '12px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  padding: '32px',
  boxSizing: 'border-box',
};

const titleStyle = {
  fontSize: '22px',
  fontWeight: 700,
  color: '#08060d',
  margin: '0 0 4px 0',
  textAlign: 'center',
};

const subtitleStyle = {
  fontSize: '14px',
  color: '#888',
  margin: '0 0 24px 0',
  textAlign: 'center',
};

const msgStyle = {
  padding: '8px 12px',
  borderRadius: '6px',
  fontSize: '13px',
  marginBottom: '16px',
  textAlign: 'center',
};

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
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loginError, setLoginError] = useState(null);

  const successMessage = location.state?.message;

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Welcome back</h1>
        <p style={subtitleStyle}>Sign in to your account</p>
        {successMessage && (
          <div role="status" style={{ ...msgStyle, background: '#e8f5e9', color: '#2e7d32' }}>
            {successMessage}
          </div>
        )}
        {loginError && (
          <div role="alert" style={{ ...msgStyle, background: '#ffeef0', color: '#d32f2f' }}>
            {loginError}
          </div>
        )}
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
        <p style={{ fontSize: '13px', color: '#555', textAlign: 'center', marginTop: '20px' }}>
          Don&apos;t have an account?{' '}
          <Link to="/register" style={{ color: '#4f8df5', textDecoration: 'none', fontWeight: 500 }}>Register</Link>
        </p>
      </div>
    </div>
  );
}
