/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext.jsx';

// Mock the dependency modules
vi.mock('../../services/auth.js', () => ({
  register: vi.fn(),
  login: vi.fn(),
  getProfile: vi.fn(),
  logout: vi.fn(),
}));

vi.mock('../../utils/tokenStorage.js', () => ({
  getToken: vi.fn(),
  setToken: vi.fn(),
  removeToken: vi.fn(),
}));

vi.mock('../../utils/browserId.js', () => ({
  getBrowserId: vi.fn(),
}));

import * as authService from '../../services/auth.js';
import { getToken, setToken, removeToken } from '../../utils/tokenStorage.js';
import { getBrowserId } from '../../utils/browserId.js';

// Helper component that exposes auth context values for testing
function TestConsumer({ onRender }) {
  const auth = useAuth();
  onRender(auth);
  return (
    <div>
      <span data-testid="loading">{String(auth.loading)}</span>
      <span data-testid="isAuthenticated">{String(auth.isAuthenticated)}</span>
      <span data-testid="user">{JSON.stringify(auth.user)}</span>
    </div>
  );
}

describe('AuthContext', () => {
  let latestAuth;
  const captureAuth = (auth) => { latestAuth = auth; };

  beforeEach(() => {
    vi.clearAllMocks();
    latestAuth = null;
    // Default: no token stored
    getToken.mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sets loading=false and user=null when no token exists on mount', async () => {
    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer onRender={captureAuth} />
        </AuthProvider>
      );
    });

    expect(latestAuth.loading).toBe(false);
    expect(latestAuth.user).toBeNull();
    expect(latestAuth.isAuthenticated).toBe(false);
  });

  it('restores session from token on mount', async () => {
    const profile = { userId: 1, name: 'Jane', email: 'jane@test.com' };
    getToken.mockReturnValue('valid-token');
    authService.getProfile.mockResolvedValue(profile);

    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer onRender={captureAuth} />
        </AuthProvider>
      );
    });

    expect(authService.getProfile).toHaveBeenCalledWith('valid-token');
    expect(latestAuth.loading).toBe(false);
    expect(latestAuth.user).toEqual(profile);
    expect(latestAuth.isAuthenticated).toBe(true);
  });

  it('handles 401 during session restoration by clearing state', async () => {
    getToken.mockReturnValue('expired-token');
    const err = new Error('Unauthorized');
    err.status = 401;
    authService.getProfile.mockRejectedValue(err);

    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer onRender={captureAuth} />
        </AuthProvider>
      );
    });

    expect(removeToken).toHaveBeenCalled();
    expect(latestAuth.user).toBeNull();
    expect(latestAuth.isAuthenticated).toBe(false);
    expect(latestAuth.loading).toBe(false);
  });

  it('login() stores token and fetches profile', async () => {
    const loginResponse = { userId: 1, email: 'test@test.com', token: 'new-token', expiryDate: '2026-01-01', sameBrowserReuse: false };
    const profile = { userId: 1, name: 'Test', email: 'test@test.com' };
    getBrowserId.mockReturnValue('browser-123');
    authService.login.mockResolvedValue(loginResponse);
    authService.getProfile.mockResolvedValue(profile);

    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer onRender={captureAuth} />
        </AuthProvider>
      );
    });

    await act(async () => {
      await latestAuth.login('test@test.com', 'password');
    });

    expect(getBrowserId).toHaveBeenCalled();
    expect(authService.login).toHaveBeenCalledWith('test@test.com', 'password', 'browser-123');
    expect(setToken).toHaveBeenCalledWith('new-token');
    expect(authService.getProfile).toHaveBeenCalledWith('new-token');
    expect(latestAuth.user).toEqual(profile);
    expect(latestAuth.isAuthenticated).toBe(true);
  });

  it('register() calls authService.register and does NOT auto-login', async () => {
    const registerResponse = { userId: 2, email: 'new@test.com', message: 'User registered successfully' };
    authService.register.mockResolvedValue(registerResponse);

    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer onRender={captureAuth} />
        </AuthProvider>
      );
    });

    let result;
    await act(async () => {
      result = await latestAuth.register('New User', 'new@test.com', 'pass123');
    });

    expect(authService.register).toHaveBeenCalledWith('New User', 'new@test.com', 'pass123');
    expect(result).toEqual(registerResponse);
    expect(latestAuth.user).toBeNull();
    expect(setToken).not.toHaveBeenCalled();
  });

  it('logout() clears token and user', async () => {
    // Start with an authenticated state
    const profile = { userId: 1, name: 'Jane', email: 'jane@test.com' };
    getToken.mockReturnValue('active-token');
    authService.getProfile.mockResolvedValue(profile);
    authService.logout.mockResolvedValue({ message: 'Logged out successfully' });

    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer onRender={captureAuth} />
        </AuthProvider>
      );
    });

    expect(latestAuth.isAuthenticated).toBe(true);

    await act(async () => {
      await latestAuth.logout();
    });

    expect(authService.logout).toHaveBeenCalledWith('active-token');
    expect(removeToken).toHaveBeenCalled();
    expect(latestAuth.user).toBeNull();
    expect(latestAuth.isAuthenticated).toBe(false);
  });

  it('logout() handles 401 by clearing state without re-throwing', async () => {
    const profile = { userId: 1, name: 'Jane', email: 'jane@test.com' };
    getToken.mockReturnValue('expired-token');
    authService.getProfile.mockResolvedValue(profile);
    const err = new Error('Unauthorized');
    err.status = 401;
    authService.logout.mockRejectedValue(err);

    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer onRender={captureAuth} />
        </AuthProvider>
      );
    });

    await act(async () => {
      await latestAuth.logout();
    });

    expect(removeToken).toHaveBeenCalled();
    expect(latestAuth.user).toBeNull();
    expect(latestAuth.isAuthenticated).toBe(false);
  });

  it('fetchProfile() updates user state', async () => {
    const profile = { userId: 1, name: 'Updated', email: 'updated@test.com' };
    getToken.mockReturnValue('my-token');
    // First call for mount restoration
    authService.getProfile.mockResolvedValueOnce(profile);

    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer onRender={captureAuth} />
        </AuthProvider>
      );
    });

    const newProfile = { userId: 1, name: 'Refreshed', email: 'updated@test.com' };
    authService.getProfile.mockResolvedValueOnce(newProfile);

    await act(async () => {
      await latestAuth.fetchProfile();
    });

    expect(latestAuth.user).toEqual(newProfile);
  });

  it('fetchProfile() handles 401 by clearing state', async () => {
    const profile = { userId: 1, name: 'Jane', email: 'jane@test.com' };
    getToken.mockReturnValue('token-123');
    authService.getProfile.mockResolvedValueOnce(profile);

    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer onRender={captureAuth} />
        </AuthProvider>
      );
    });

    const err = new Error('Unauthorized');
    err.status = 401;
    authService.getProfile.mockRejectedValueOnce(err);

    await act(async () => {
      await latestAuth.fetchProfile();
    });

    expect(removeToken).toHaveBeenCalled();
    expect(latestAuth.user).toBeNull();
    expect(latestAuth.isAuthenticated).toBe(false);
  });
});
