import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('PingService - Unit Tests', () => {
  const FAKE_BASE_URL = 'http://test-server';
  let originalFetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    vi.stubEnv('VITE_BASE_URL', FAKE_BASE_URL);
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  /**
   * Validates: Requirements 3.1, 3.2
   */
  it('should return parsed response on 200', async () => {
    const mockResponse = {
      appName: 'dashboard-api',
      appVersion: '1.0.0',
      timestamp: '2024-01-01T00:00:00Z',
      databaseStatus: 'connected',
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const { ping } = await import('../../services/health.js');
    const result = await ping();

    expect(globalThis.fetch).toHaveBeenCalledWith(`${FAKE_BASE_URL}/api/ping`);
    expect(result).toEqual(mockResponse);
  });

  /**
   * Validates: Requirement 3.4
   */
  it('should throw on 500 response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    const { ping } = await import('../../services/health.js');

    await expect(ping()).rejects.toThrow('Ping failed: 500 Internal Server Error');
  });

  /**
   * Validates: Requirement 3.4
   */
  it('should throw on network error', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

    const { ping } = await import('../../services/health.js');

    await expect(ping()).rejects.toThrow('Failed to fetch');
  });

  /**
   * Validates: Unexpected 200 response with wrong shape
   */
  it('should throw on 200 response with unexpected shape', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ unexpected: 'data' }),
    });

    const { ping } = await import('../../services/health.js');

    await expect(ping()).rejects.toThrow('Unexpected response from ping endpoint');
  });

  it('should throw on 200 response with missing fields', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ appName: 'test', appVersion: '1.0' }),
    });

    const { ping } = await import('../../services/health.js');

    await expect(ping()).rejects.toThrow('Unexpected response from ping endpoint');
  });
});
