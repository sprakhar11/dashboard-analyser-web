import { useState } from 'react';

const styles = {
  form: { display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: 500, color: '#555' },
  input: { padding: '10px 12px', border: '1px solid #e5e4e7', borderRadius: '6px', fontSize: '14px', color: '#08060d', backgroundColor: '#fff', outline: 'none' },
  inputError: { padding: '10px 12px', border: '1px solid #d32f2f', borderRadius: '6px', fontSize: '14px', color: '#08060d', backgroundColor: '#fff', outline: 'none' },
  error: { fontSize: '12px', color: '#d32f2f', margin: 0 },
  button: { padding: '10px 0', border: 'none', borderRadius: '6px', backgroundColor: '#4f8df5', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer', marginTop: '4px' },
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(email, password) {
  const errors = {};
  if (!email.trim()) errors.email = 'Email is required';
  else if (!EMAIL_RE.test(email)) errors.email = 'Enter a valid email address';
  if (!password) errors.password = 'Password is required';
  else if (password.length < 6) errors.password = 'Password must be at least 6 characters';
  return errors;
}

export default function LoginForm({ onSubmit }) {
  const [errors, setErrors] = useState({});

  function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const email = form.elements.email.value;
    const password = form.elements.password.value;
    const errs = validate(email, password);
    setErrors(errs);
    if (Object.keys(errs).length === 0) onSubmit(email, password);
  }

  return (
    <form style={styles.form} onSubmit={handleSubmit} noValidate>
      <div style={styles.fieldGroup}>
        <label htmlFor="login-email" style={styles.label}>Email</label>
        <input id="login-email" type="email" name="email" required placeholder="you@example.com" style={errors.email ? styles.inputError : styles.input} onChange={() => setErrors((e) => ({ ...e, email: undefined }))} />
        {errors.email && <p style={styles.error}>{errors.email}</p>}
      </div>
      <div style={styles.fieldGroup}>
        <label htmlFor="login-password" style={styles.label}>Password</label>
        <input id="login-password" type="password" name="password" required placeholder="••••••••" style={errors.password ? styles.inputError : styles.input} onChange={() => setErrors((e) => ({ ...e, password: undefined }))} />
        {errors.password && <p style={styles.error}>{errors.password}</p>}
      </div>
      <button type="submit" style={styles.button}>Log in</button>
    </form>
  );
}
