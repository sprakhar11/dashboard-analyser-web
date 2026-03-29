import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';

describe('TrackingService - Property Tests', () => {
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
   * Feature: product-analytics-dashboard, Property 6: Track event never throws
   *
   * For any combination of featureId, eventTypeId, and network outcome
   * (success, network error, 4xx, 5xx), calling trackEvent should resolve
   * without throwing an exception.
   *
   * Validates: Requirements 11.1, 11.3
   */
  it('Property 6: trackEvent never throws for any featureId/eventTypeId and failure mode', async () => {
    // Arbitrary to pick a failure mode
    const failureMode = fc.oneof(
      fc.constant('success'),
      fc.constant('network-error'),
      fc.integer({ min: 400, max: 499 }).map((s) => `client-error-${s}`),
      fc.integer({ min: 500, max: 599 }).map((s) => `server-error-${s}`)
    );

    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 100000 }),
        fc.integer({ min: 1, max: 100000 }),
        failureMode,
        async (featureId, eventTypeId, mode) => {
          if (mode === 'success') {
            globalThis.fetch = vi.fn().mockResolvedValue({
              ok: true,
              status: 200,
              json: () => Promise.resolve({ success: true }),
            });
          } else if (mode === 'network-error') {
            globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
          } else {
            const statusCode = parseInt(mode.split('-').pop(), 10);
            globalThis.fetch = vi.fn().mockResolvedValue({
              ok: false,
              status: statusCode,
              statusText: 'Error',
              json: () => Promise.resolve({ error: 'something went wrong' }),
            });
          }

          const { trackEvent } = await import('../../services/tracking.js');

          // trackEvent must resolve without throwing — fire-and-forget
          await expect(trackEvent('test-token', { featureId, eventTypeId })).resolves.toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: product-analytics-dashboard, Property 7: Track request body contains required fields with valid timestamp
   *
   * For any featureId (positive integer) and eventTypeId (positive integer),
   * the request body sent by trackEvent should contain featureId, eventTypeId,
   * and eventTime, where eventTime is a valid ISO-8601 timestamp string.
   *
   * Validates: Requirements 11.2
   */
  it('Property 7: trackEvent request body contains featureId, eventTypeId, and valid ISO-8601 eventTime', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 100000 }),
        fc.integer({ min: 1, max: 100000 }),
        async (featureId, eventTypeId) => {
          let capturedBody = null;

          globalThis.fetch = vi.fn().mockImplementation((_url, options) => {
            capturedBody = JSON.parse(options.body);
            return Promise.resolve({
              ok: true,
              status: 200,
              json: () => Promise.resolve({ success: true }),
            });
          });

          const { trackEvent } = await import('../../services/tracking.js');

          await trackEvent('test-token', { featureId, eventTypeId });

          // Body must have been sent
          expect(capturedBody).not.toBeNull();

          // Required fields present
          expect(capturedBody.featureId).toBe(featureId);
          expect(capturedBody.eventTypeId).toBe(eventTypeId);
          expect(typeof capturedBody.eventTime).toBe('string');

          // eventTime must be a valid ISO-8601 timestamp
          const parsed = new Date(capturedBody.eventTime);
          expect(parsed.toString()).not.toBe('Invalid Date');
          // Verify it round-trips as ISO string (confirms ISO-8601 format)
          expect(capturedBody.eventTime).toBe(parsed.toISOString());
        }
      ),
      { numRuns: 100 }
    );
  });
});
