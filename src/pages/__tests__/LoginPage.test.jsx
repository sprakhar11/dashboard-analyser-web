import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../context/AuthContext.jsx', () => ({
  useAuth: vi.fn(),
}));

import LoginPage from '../LoginPage.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const mockLogin = vi.fn();
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderLoginPage(initialEntries = ['/login']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <LoginPage />
    </MemoryRouter>
  );
}

describe('LoginPage - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ login: mockLogin });
  });

  it('should render LoginForm with email and password fields', () => {
    renderLoginPage();
    expect(screen.getByLabelText(/email/i)).not.toBeNull();
    expect(screen.getByLabelText(/password/i)).not.toBeNull();
    expect(screen.getByRole('button', { name: /log in/i })).not.toBeNull();
  });

  it('should call login with email and password on form submit', async () => {
    mockLogin.mockResolvedValue(undefined);
    renderLoginPage();

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@test.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secret123' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    });

    expect(mockLogin).toHaveBeenCalledWith('user@test.com', 'secret123');
  });

  it('should navigate to / on successful login', async () => {
    mockLogin.mockResolvedValue(undefined);
    renderLoginPage();

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    });

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('should show error for INVALID_CREDENTIALS', async () => {
    const err = new Error('Invalid email or password');
    err.code = 'INVALID_CREDENTIALS';
    mockLogin.mockRejectedValue(err);
    renderLoginPage();

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpass' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    });

    expect(screen.getByRole('alert').textContent).toContain('Invalid email or password');
  });

  it('should show error for USER_ALREADY_LOGGED_IN_ANOTHER_BROWSER', async () => {
    const err = new Error('User is already logged in from another browser');
    err.code = 'USER_ALREADY_LOGGED_IN_ANOTHER_BROWSER';
    mockLogin.mockRejectedValue(err);
    renderLoginPage();

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    });

    expect(screen.getByRole('alert').textContent).toContain('You are already logged in from another browser');
  });

  it('should show a link to /register', () => {
    renderLoginPage();
    const registerLink = screen.getByRole('link', { name: /register/i });
    expect(registerLink).not.toBeNull();
    expect(registerLink.getAttribute('href')).toBe('/register');
  });

  it('should show success message from location state', () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/login', state: { message: 'Account created! Please log in.' } }]}>
        <LoginPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('status').textContent).toContain('Account created! Please log in.');
  });
});
