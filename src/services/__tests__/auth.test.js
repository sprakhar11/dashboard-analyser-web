import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('AuthService - Unit Tests', () => {
  const FAKE_AUTH_URL = 'http://test-auth-server';
  let originalFetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    vi.stubEnv('VITE_BASE_URL', FAKE_AUTH_URL);
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  /**
   * Validates: Requirement 1.1
   */
  it('register() sends correct POST request and returns parsed response', async () => {
    const mockResponse = { userId: 1, name: 'Test User', email: 'test@example.com', age: 25, gender: { id: 1, code: 'MALE', name: 'Male' }, message: 'User registered successfully' };
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const { register } = await import('../auth.js');
    const result = await register({ name: 'Test User', email: 'test@example.com', password: 'password123', genderId: 1, age: 25 });

    expect(globalThis.fetch).toHaveBeenCalledWith(`${FAKE_AUTH_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test User', email: 'test@example.com', password: 'password123', genderId: 1, age: 25 }),
    });
    expect(result).toEqual(mockResponse);
  });

  /**
   * Validates: Requirement 1.2
   */
  it('login() sends correct POST request and returns parsed response', async () => {
    const mockResponse = { userId: 1, email: 'test@example.com', token: 'abc-123', expiryDate: '2026-01-01T00:00:00', sameBrowserReuse: false };
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const { login } = await import('../auth.js');
    const result = await login('test@example.com', 'password123', 'browser-id-1');

    expect(globalThis.fetch).toHaveBeenCalledWith(`${FAKE_AUTH_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'password123', browserId: 'browser-id-1' }),
    });
    expect(result).toEqual(mockResponse);
  });

  /**
   * Validates: Requirement 1.3
   */
  it('getProfile() sends GET with auth-token header and returns profile', async () => {
    const mockResponse = { userId: 1, name: 'Test User', email: 'test@example.com' };
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const { getProfile } = await import('../auth.js');
    const result = await getProfile('my-token-123');

    expect(globalThis.fetch).toHaveBeenCalledWith(`${FAKE_AUTH_URL}/api/auth/me`, {
      headers: { 'auth-token': 'my-token-123' },
    });
    expect(result).toEqual(mockResponse);
  });

  /**
   * Validates: Requirement 1.4
   */
  it('logout() sends POST with auth-token header and returns message', async () => {
    const mockResponse = { message: 'Logged out successfully' };
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const { logout } = await import('../auth.js');
    const result = await logout('my-token-123');

    expect(globalThis.fetch).toHaveBeenCalledWith(`${FAKE_AUTH_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { 'auth-token': 'my-token-123' },
    });
    expect(result).toEqual(mockResponse);
  });

  /**
   * Validates: Requirement 1.6
   */
  it('throws structured error on 409 response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 409,
      json: () => Promise.resolve({ error: 'EMAIL_ALREADY_EXISTS', message: 'Email is already registered' }),
    });

    const { register } = await import('../auth.js');

    try {
      await register({ name: 'Test', email: 'test@example.com', password: 'pass', genderId: 1, age: 25 });
      expect.unreachable('Should have thrown');
    } catch (err) {
      expect(err.message).toBe('Email is already registered');
      expect(err.code).toBe('EMAIL_ALREADY_EXISTS');
      expect(err.status).toBe(409);
    }
  });

  /**
   * Validates: Requirement 1.6
   */
  it('throws structured error on 401 response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }),
    });

    const { login } = await import('../auth.js');

    try {
      await login('test@example.com', 'wrong', 'browser-1');
      expect.unreachable('Should have thrown');
    } catch (err) {
      expect(err.message).toBe('Invalid email or password');
      expect(err.code).toBe('INVALID_CREDENTIALS');
      expect(err.status).toBe(401);
    }
  });

  /**
   * Validates: Requirement 1.6
   */
  it('throws on network failure', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

    const { register } = await import('../auth.js');

    await expect(register({ name: 'Test', email: 'test@example.com', password: 'pass', genderId: 1, age: 25 })).rejects.toThrow('Failed to fetch');
  });
});
