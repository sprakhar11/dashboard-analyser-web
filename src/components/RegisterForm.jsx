import { useState } from 'react';

const styles = {
  form: { display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  row: { display: 'flex', gap: '12px' },
  label: { fontSize: '13px', fontWeight: 500, color: '#555' },
  input: { padding: '10px 12px', border: '1px solid #e5e4e7', borderRadius: '6px', fontSize: '14px', color: '#08060d', backgroundColor: '#fff', outline: 'none', width: '100%', boxSizing: 'border-box' },
  inputError: { padding: '10px 12px', border: '1px solid #d32f2f', borderRadius: '6px', fontSize: '14px', color: '#08060d', backgroundColor: '#fff', outline: 'none', width: '100%', boxSizing: 'border-box' },
  select: { padding: '10px 12px', border: '1px solid #e5e4e7', borderRadius: '6px', fontSize: '14px', color: '#08060d', backgroundColor: '#fff', outline: 'none', width: '100%', boxSizing: 'border-box', cursor: 'pointer' },
  error: { fontSize: '12px', color: '#d32f2f', margin: 0 },
  button: { padding: '10px 0', border: 'none', borderRadius: '6px', backgroundColor: '#4f8df5', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer', marginTop: '4px' },
};

const NAME_RE = /^[A-Za-z\s]+$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(name, email, password, age) {
  const errors = {};
  if (!name.trim()) errors.name = 'Name is required';
  else if (!NAME_RE.test(name)) errors.name = 'Name must contain only letters and spaces';
  else if (name.trim().length > 100) errors.name = 'Name must be 100 characters or less';
  if (!email.trim()) errors.email = 'Email is required';
  else if (!EMAIL_RE.test(email)) errors.email = 'Enter a valid email address';
  if (!password) errors.password = 'Password is required';
  else if (password.length < 6) errors.password = 'Password must be at least 6 characters';
  else if (password.length > 100) errors.password = 'Password must be 100 characters or less';
  if (!age) errors.age = 'Age is required';
  else if (Number(age) < 1 || Number(age) > 150) errors.age = 'Age must be between 1 and 150';
  return errors;
}

export default function RegisterForm({ onSubmit }) {
  const [errors, setErrors] = useState({});

  function clearError(field) {
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const name = form.elements.name.value;
    const email = form.elements.email.value;
    const password = form.elements.password.value;
    const age = form.elements.age.value;
    const genderId = Number(form.elements.genderId.value);
    const errs = validate(name, email, password, age);
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      onSubmit({ name: name.trim(), email, password, age: Number(age), genderId });
    }
  }

  return (
    <form style={styles.form} onSubmit={handleSubmit} noValidate>
      <div style={styles.fieldGroup}>
        <label htmlFor="register-name" style={styles.label}>Name</label>
        <input id="register-name" type="text" name="name" placeholder="John Smith" style={errors.name ? styles.inputError : styles.input} onChange={() => clearError('name')} />
        {errors.name && <p style={styles.error}>{errors.name}</p>}
      </div>
      <div style={styles.fieldGroup}>
        <label htmlFor="register-email" style={styles.label}>Email</label>
        <input id="register-email" type="email" name="email" placeholder="you@example.com" style={errors.email ? styles.inputError : styles.input} onChange={() => clearError('email')} />
        {errors.email && <p style={styles.error}>{errors.email}</p>}
      </div>
      <div style={styles.fieldGroup}>
        <label htmlFor="register-password" style={styles.label}>Password</label>
        <input id="register-password" type="password" name="password" placeholder="••••••••" style={errors.password ? styles.inputError : styles.input} onChange={() => clearError('password')} />
        {errors.password && <p style={styles.error}>{errors.password}</p>}
      </div>
      <div style={styles.row}>
        <div style={{ ...styles.fieldGroup, flex: 1 }}>
          <label htmlFor="register-age" style={styles.label}>Age</label>
          <input id="register-age" type="number" name="age" min="1" max="150" placeholder="25" style={errors.age ? styles.inputError : styles.input} onChange={() => clearError('age')} />
          {errors.age && <p style={styles.error}>{errors.age}</p>}
        </div>
        <div style={{ ...styles.fieldGroup, flex: 1 }}>
          <label htmlFor="register-gender" style={styles.label}>Gender</label>
          <select id="register-gender" name="genderId" style={styles.select}>
            <option value="1">Male</option>
            <option value="2">Female</option>
            <option value="3">Other</option>
          </select>
        </div>
      </div>
      <button type="submit" style={styles.button}>Create account</button>
    </form>
  );
}
