import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../context/AuthContext.jsx', () => ({
  useAuth: vi.fn(),
}));

import RegisterPage from '../RegisterPage.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const mockRegister = vi.fn();
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderRegisterPage() {
  return render(
    <MemoryRouter initialEntries={['/register']}>
      <RegisterPage />
    </MemoryRouter>
  );
}

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ register: mockRegister });
  });

  it('should render RegisterForm with name, email, password, age, and gender fields', () => {
    renderRegisterPage();

    expect(screen.getByLabelText(/name/i)).not.toBeNull();
    expect(screen.getByLabelText(/email/i)).not.toBeNull();
    expect(screen.getByLabelText(/password/i)).not.toBeNull();
    expect(screen.getByLabelText(/age/i)).not.toBeNull();
    expect(screen.getByLabelText(/gender/i)).not.toBeNull();
    expect(screen.getByRole('button', { name: /register/i })).not.toBeNull();
  });

  it('should call register with all fields including age and genderId on form submit', async () => {
    mockRegister.mockResolvedValue({ userId: 1, email: 'test@example.com', message: 'User registered successfully' });
    renderRegisterPage();

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/age/i), { target: { value: '25' } });
    fireEvent.change(screen.getByLabelText(/gender/i), { target: { value: '1' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /register/i }));
    });

    expect(mockRegister).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      age: 25,
      genderId: 1,
    });
  });

  it('should navigate to /login with success message on successful registration', async () => {
    mockRegister.mockResolvedValue({ userId: 1, email: 'john@example.com', message: 'User registered successfully' });
    renderRegisterPage();

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/age/i), { target: { value: '25' } });
    fireEvent.change(screen.getByLabelText(/gender/i), { target: { value: '1' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /register/i }));
    });

    expect(mockNavigate).toHaveBeenCalledWith('/login', { state: { message: 'Account created! Please log in.' } });
  });

  it('should show error for EMAIL_ALREADY_EXISTS', async () => {
    const err = new Error('Email is already registered');
    err.code = 'EMAIL_ALREADY_EXISTS';
    mockRegister.mockRejectedValue(err);
    renderRegisterPage();

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/age/i), { target: { value: '25' } });
    fireEvent.change(screen.getByLabelText(/gender/i), { target: { value: '1' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /register/i }));
    });

    const alert = screen.getByRole('alert');
    expect(alert.textContent).toContain('This email is already registered');
  });

  it('should show error message for VALIDATION_ERROR', async () => {
    const err = new Error('Name is required');
    err.code = 'VALIDATION_ERROR';
    mockRegister.mockRejectedValue(err);
    renderRegisterPage();

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/age/i), { target: { value: '25' } });
    fireEvent.change(screen.getByLabelText(/gender/i), { target: { value: '1' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /register/i }));
    });

    const alert = screen.getByRole('alert');
    expect(alert.textContent).toContain('Name is required');
  });

  it('should show a link to /login', () => {
    renderRegisterPage();

    const loginLink = screen.getByRole('link', { name: /log in/i });
    expect(loginLink).not.toBeNull();
    expect(loginLink.getAttribute('href')).toBe('/login');
  });
});
