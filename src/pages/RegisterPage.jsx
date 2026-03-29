import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import RegisterForm from '../components/RegisterForm.jsx';

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
    <>
      {error && <p role="alert">{error}</p>}
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
      <p>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </>
  );
}
