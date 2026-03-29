import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

vi.mock('../services/health.js', () => ({
  ping: vi.fn(() => new Promise(() => {})),
}));

vi.mock('../context/AuthContext.jsx', async () => {
  const actual = await vi.importActual('../context/AuthContext.jsx');
  return {
    ...actual,
    AuthProvider: ({ children }) => children,
    useAuth: vi.fn(() => ({
      user: null,
      isAuthenticated: false,
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      fetchProfile: vi.fn(),
    })),
  };
});

import { useAuth } from '../context/AuthContext.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';
import ProfilePage from '../pages/ProfilePage.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';

describe('App Routing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Validates: Requirement 2.2
   */
  it('should render LoginPage when navigating to /login', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Loading...')).toBeDefined();
  });

  /**
   * Validates: Requirement 6.1
   */
  it('should render RegisterPage when navigating to /register', () => {
    render(
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/name/i)).toBeDefined();
    expect(screen.getByLabelText(/email/i)).toBeDefined();
    expect(screen.getByLabelText(/password/i)).toBeDefined();
  });

  /**
   * Validates: Requirement 7.1
   */
  it('should redirect to /login when unauthenticated user visits /profile', () => {
    useAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      fetchProfile: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/profile']}>
        <Routes>
          <Route path="/profile" element={
            <ProtectedRoute><ProfilePage /></ProtectedRoute>
          } />
          <Route path="/login" element={<div>Login Redirect</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Redirect')).toBeDefined();
  });

  /**
   * Validates: Requirement 7.3, 10.4
   */
  it('should render ProfilePage when authenticated user visits /profile', () => {
    useAuth.mockReturnValue({
      user: { userId: 1, name: 'Test User', email: 'test@example.com' },
      isAuthenticated: true,
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      fetchProfile: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/profile']}>
        <Routes>
          <Route path="/profile" element={
            <ProtectedRoute><ProfilePage /></ProtectedRoute>
          } />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Test User')).toBeDefined();
    expect(screen.getByText('test@example.com')).toBeDefined();
  });

  /**
   * Validates: Requirement 7.1
   */
  it('should redirect to /login when unauthenticated user visits /', () => {
    useAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      fetchProfile: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={
            <ProtectedRoute><div>Home</div></ProtectedRoute>
          } />
          <Route path="/login" element={<div>Login Redirect</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Redirect')).toBeDefined();
  });

  /**
   * Validates: Requirement 7.3
   */
  it('should render home when authenticated user visits /', () => {
    useAuth.mockReturnValue({
      user: { userId: 1, name: 'Test User', email: 'test@example.com' },
      isAuthenticated: true,
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      fetchProfile: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={
            <ProtectedRoute><div>Home</div></ProtectedRoute>
          } />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Home')).toBeDefined();
  });
});
