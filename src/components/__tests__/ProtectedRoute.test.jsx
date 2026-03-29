import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute.jsx';

vi.mock('../../context/AuthContext.jsx', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../../context/AuthContext.jsx';

describe('ProtectedRoute', () => {
  it('shows loading indicator while loading', () => {
    useAuth.mockReturnValue({ loading: true, isAuthenticated: false });

    render(
      <MemoryRouter>
        <ProtectedRoute><div>Protected Content</div></ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Loading...')).toBeDefined();
    expect(screen.queryByText('Protected Content')).toBeNull();
  });

  it('redirects to /login when unauthenticated', () => {
    useAuth.mockReturnValue({ loading: false, isAuthenticated: false });

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <ProtectedRoute><div>Protected Content</div></ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.queryByText('Protected Content')).toBeNull();
    expect(screen.queryByText('Loading...')).toBeNull();
  });

  it('renders children when authenticated', () => {
    useAuth.mockReturnValue({ loading: false, isAuthenticated: true });

    render(
      <MemoryRouter>
        <ProtectedRoute><div>Protected Content</div></ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Protected Content')).toBeDefined();
  });
});
