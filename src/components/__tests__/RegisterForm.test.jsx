import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RegisterForm from '../RegisterForm.jsx';

describe('RegisterForm - Unit Tests', () => {
  it('should contain name, email, password, age, and gender inputs and a Register button', () => {
    render(<RegisterForm onSubmit={() => {}} />);

    expect(screen.getByLabelText(/name/i)).toBeDefined();
    expect(screen.getByLabelText(/email/i)).toBeDefined();
    expect(screen.getByLabelText(/password/i)).toBeDefined();
    expect(screen.getByLabelText(/age/i)).toBeDefined();
    expect(screen.getByLabelText(/gender/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /register/i })).toBeDefined();
  });

  it('should call onSubmit with all fields including age and genderId on form submission', () => {
    const handleSubmit = vi.fn();
    render(<RegisterForm onSubmit={handleSubmit} />);

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'securepass' } });
    fireEvent.change(screen.getByLabelText(/age/i), { target: { value: '25' } });
    fireEvent.change(screen.getByLabelText(/gender/i), { target: { value: '2' } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    expect(handleSubmit).toHaveBeenCalledTimes(1);
    expect(handleSubmit).toHaveBeenCalledWith({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'securepass',
      age: 25,
      genderId: 2,
    });
  });
});
