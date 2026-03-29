import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RegisterForm from '../RegisterForm.jsx';

describe('RegisterForm - Unit Tests', () => {
  /**
   * Validates: Requirements 6.2
   */
  it('should contain name, email, and password inputs and a Register button', () => {
    render(<RegisterForm onSubmit={() => {}} />);

    expect(screen.getByLabelText(/name/i)).toBeDefined();
    expect(screen.getByLabelText(/name/i).type).toBe('text');

    expect(screen.getByLabelText(/email/i)).toBeDefined();
    expect(screen.getByLabelText(/email/i).type).toBe('email');

    expect(screen.getByLabelText(/password/i)).toBeDefined();
    expect(screen.getByLabelText(/password/i).type).toBe('password');

    expect(screen.getByRole('button', { name: /register/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /register/i }).type).toBe('submit');
  });

  /**
   * Validates: Requirements 6.2
   */
  it('should call onSubmit with name, email, and password on form submission', () => {
    const handleSubmit = vi.fn();
    render(<RegisterForm onSubmit={handleSubmit} />);

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'Jane Doe' },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'jane@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'securepass' },
    });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    expect(handleSubmit).toHaveBeenCalledTimes(1);
    expect(handleSubmit).toHaveBeenCalledWith('Jane Doe', 'jane@example.com', 'securepass');
  });
});
