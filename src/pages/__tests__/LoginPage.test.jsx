import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../services/health.js', () => ({
  ping: vi.fn(),
}));

vi.mock('../../context/AuthContext.jsx', () => ({
  useAuth: vi.fn(),
}));

import LoginPage from '../LoginPage.jsx';
import { ping } from '../../services/health.js';
import { useAuth } from '../../context/AuthContext.jsx';

const mockLogin = vi.fn();
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderLoginPage(initialEntries = ['/login']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <LoginPage />
    </MemoryRouter>
  );
}

function connectedPing() {
  ping.mockResolvedValue({
    appName: 'app',
    appVersion: '1.0',
    timestamp: '2024-01-01',
    databaseStatus: 'connected',
  });
}

describe('LoginPage - Unit Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    useAuth.mockReturnValue({ login: mockLogin });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should show loading indicator while ping is pending', () => {
    ping.mockReturnValue(new Promise(() => {}));
    const { container } = renderLoginPage();
    expect(container.textContent).toContain('Loading...');
  });

  it('should show "Connecting to backend..." when ping fails', async () => {
    ping.mockRejectedValue(new Error('Network error'));
    renderLoginPage();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(screen.getByRole('status').textContent).toContain('Connecting to backend...');
  });

  it('should render LoginForm when databaseStatus is "connected"', async () => {
    connectedPing();
    const { container } = renderLoginPage();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(container.querySelector('form')).not.toBeNull();
    expect(container.querySelector('input[type="email"]')).not.toBeNull();
    expect(container.querySelector('input[type="password"]')).not.toBeNull();
    expect(container.querySelector('button[type="submit"]')).not.toBeNull();
  });

  it('should call login with email and password on form submit', async () => {
    mockLogin.mockResolvedValue(undefined);
    connectedPing();
    renderLoginPage();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    fireEvent.change(emailInput, { target: { value: 'user@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'secret' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /log in/i }));
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(mockLogin).toHaveBeenCalledWith('user@test.com', 'secret');
  });

  it('should navigate to / on successful login', async () => {
    mockLogin.mockResolvedValue(undefined);
    connectedPing();
    renderLoginPage();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /log in/i }));
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('should show error for INVALID_CREDENTIALS', async () => {
    const err = new Error('Invalid email or password');
    err.code = 'INVALID_CREDENTIALS';
    mockLogin.mockRejectedValue(err);
    connectedPing();
    renderLoginPage();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrong' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /log in/i }));
      await vi.advanceTimersByTimeAsync(0);
    });

    const alert = screen.getByRole('alert');
    expect(alert.textContent).toContain('Invalid email or password');
  });

  it('should show error for USER_ALREADY_LOGGED_IN_ANOTHER_BROWSER', async () => {
    const err = new Error('User is already logged in from another browser');
    err.code = 'USER_ALREADY_LOGGED_IN_ANOTHER_BROWSER';
    mockLogin.mockRejectedValue(err);
    connectedPing();
    renderLoginPage();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /log in/i }));
      await vi.advanceTimersByTimeAsync(0);
    });

    const alert = screen.getByRole('alert');
    expect(alert.textContent).toContain('You are already logged in from another browser');
  });

  it('should show error message for VALIDATION_ERROR', async () => {
    const err = new Error('Email is required');
    err.code = 'VALIDATION_ERROR';
    mockLogin.mockRejectedValue(err);
    connectedPing();
    renderLoginPage();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /log in/i }));
      await vi.advanceTimersByTimeAsync(0);
    });

    const alert = screen.getByRole('alert');
    expect(alert.textContent).toContain('Email is required');
  });

  it('should show a link to /register', async () => {
    connectedPing();
    renderLoginPage();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    const registerLink = screen.getByRole('link', { name: /register/i });
    expect(registerLink).not.toBeNull();
    expect(registerLink.getAttribute('href')).toBe('/register');
  });

  it('should show success message from location state', async () => {
    connectedPing();
    render(
      <MemoryRouter initialEntries={[{ pathname: '/login', state: { message: 'Account created! Please log in.' } }]}>
        <LoginPage />
      </MemoryRouter>
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    const statusMsg = screen.getByRole('status');
    expect(statusMsg.textContent).toContain('Account created! Please log in.');
  });
});
