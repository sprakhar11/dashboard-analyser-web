import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import RegisterForm from '../components/RegisterForm.jsx';

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
  maxWidth: '420px',
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

const errorStyle = {
  padding: '8px 12px',
  borderRadius: '6px',
  fontSize: '13px',
  marginBottom: '16px',
  textAlign: 'center',
  background: '#ffeef0',
  color: '#d32f2f',
};

function getErrorMessage(err) {
  switch (err.code) {
    case 'EMAIL_ALREADY_EXISTS':
      return 'This email is already registered';
    case 'VALIDATION_ERROR':
    case 'REGISTRATION_VALIDATION_ERROR':
    case 'INTERNAL_ERROR':
      return err.message;
    default:
      return err.message || 'An unexpected error occurred';
  }
}

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Create account</h1>
        <p style={subtitleStyle}>Get started with your analytics dashboard</p>
        {error && (
          <div role="alert" style={errorStyle}>
            {error}
          </div>
        )}
        <RegisterForm
          onSubmit={async ({ name, email, password, genderId, age }) => {
            setError(null);
            try {
              await register({ name, email, password, genderId, age });
              navigate('/login', { state: { message: 'Account created! Please log in.' } });
            } catch (err) {
              setError(getErrorMessage(err));
            }
          }}
        />
        <p style={{ fontSize: '13px', color: '#555', textAlign: 'center', marginTop: '20px' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#4f8df5', textDecoration: 'none', fontWeight: 500 }}>Log in</Link>
        </p>
      </div>
    </div>
  );
}
