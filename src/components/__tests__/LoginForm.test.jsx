import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LoginForm from '../LoginForm.jsx';

describe('LoginForm - Unit Tests', () => {
  /**
   * Validates: Requirements 4.2, 4.3
   */
  it('should contain an email input, password input, and submit button', () => {
    render(<LoginForm onSubmit={() => {}} />);

    expect(screen.getByLabelText(/email/i)).toBeDefined();
    expect(screen.getByLabelText(/email/i).type).toBe('email');

    expect(screen.getByLabelText(/password/i)).toBeDefined();
    expect(screen.getByLabelText(/password/i).type).toBe('password');

    expect(screen.getByRole('button', { name: /log in/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /log in/i }).type).toBe('submit');
  });

  /**
   * Validates: Requirements 4.2, 4.3
   */
  it('should call onSubmit with email and password values on form submission', () => {
    const handleSubmit = vi.fn();
    render(<LoginForm onSubmit={handleSubmit} />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'secret123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    expect(handleSubmit).toHaveBeenCalledTimes(1);
    expect(handleSubmit).toHaveBeenCalledWith('user@example.com', 'secret123');
  });
});
