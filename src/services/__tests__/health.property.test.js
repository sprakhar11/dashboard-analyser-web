import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';

describe('PingService - Property Tests', () => {
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
   * Property 1: Ping response parsing preserves all fields
   * Validates: Requirements 3.2
   */
  it('should preserve all fields from the ping response', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          appName: fc.string({ minLength: 1 }),
          appVersion: fc.string({ minLength: 1 }),
          timestamp: fc.string({ minLength: 1 }),
          databaseStatus: fc.string({ minLength: 1 }),
        }),
        async (pingResponse) => {
          globalThis.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(pingResponse),
          });

          const { ping } = await import('../../services/health.js');

          const result = await ping();

          expect(result.appName).toBe(pingResponse.appName);
          expect(result.appVersion).toBe(pingResponse.appVersion);
          expect(result.timestamp).toBe(pingResponse.timestamp);
          expect(result.databaseStatus).toBe(pingResponse.databaseStatus);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2: Non-success responses produce error state
   * Validates: Requirements 3.4
   */
  it('should throw on non-success HTTP status codes', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 400, max: 599 }),
        async (statusCode) => {
          globalThis.fetch = vi.fn().mockResolvedValue({
            ok: false,
            status: statusCode,
            statusText: 'Error',
          });

          const { ping } = await import('../../services/health.js');

          await expect(ping()).rejects.toThrow();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2 (continued): Network errors produce error state
   * Validates: Requirements 3.4
   */
  it('should throw on network errors', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }),
        async (errorMessage) => {
          globalThis.fetch = vi.fn().mockRejectedValue(new Error(errorMessage));

          const { ping } = await import('../../services/health.js');

          await expect(ping()).rejects.toThrow();
        }
      ),
      { numRuns: 100 }
    );
  });
});
