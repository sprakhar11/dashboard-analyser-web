import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('TrackingService - Unit Tests', () => {
  const FAKE_BASE_URL = 'http://test-tracking-server';
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
   * Validates: Requirements 11.1, 11.2
   */
  it('sends POST to /api/track with correct headers and body', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true }),
    });

    const { trackEvent } = await import('../tracking.js');
    await trackEvent('my-token', { featureId: 1, eventTypeId: 2 });

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    const [url, options] = globalThis.fetch.mock.calls[0];
    expect(url).toBe(`${FAKE_BASE_URL}/api/track`);
    expect(options.method).toBe('POST');
    expect(options.headers['Content-Type']).toBe('application/json');
    expect(options.headers['auth-token']).toBe('my-token');

    const body = JSON.parse(options.body);
    expect(body.featureId).toBe(1);
    expect(body.eventTypeId).toBe(2);
  });

  /**
   * Validates: Requirement 11.2
   */
  it('includes eventTime as a valid ISO-8601 string', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true }),
    });

    const { trackEvent } = await import('../tracking.js');
    const before = new Date().toISOString();
    await trackEvent('token', { featureId: 1, eventTypeId: 1 });
    const after = new Date().toISOString();

    const body = JSON.parse(globalThis.fetch.mock.calls[0][1].body);
    expect(typeof body.eventTime).toBe('string');

    const parsed = new Date(body.eventTime);
    expect(parsed.toString()).not.toBe('Invalid Date');
    expect(body.eventTime).toBe(parsed.toISOString());
    // eventTime should be between before and after timestamps
    expect(body.eventTime >= before).toBe(true);
    expect(body.eventTime <= after).toBe(true);
  });

  /**
   * Validates: Requirement 11.2
   */
  it('includes metaInfo in the request body when provided', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true }),
    });

    const { trackEvent } = await import('../tracking.js');
    await trackEvent('token', {
      featureId: 4,
      eventTypeId: 1,
      metaInfo: { selectedBar: 'date_picker' },
    });

    const body = JSON.parse(globalThis.fetch.mock.calls[0][1].body);
    expect(body.metaInfo).toEqual({ selectedBar: 'date_picker' });
  });

  it('omits metaInfo from the request body when not provided', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true }),
    });

    const { trackEvent } = await import('../tracking.js');
    await trackEvent('token', { featureId: 1, eventTypeId: 2 });

    const body = JSON.parse(globalThis.fetch.mock.calls[0][1].body);
    expect(body).not.toHaveProperty('metaInfo');
  });

  /**
   * Validates: Requirements 11.1, 11.3
   */
  it('does not throw on network error', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

    const { trackEvent } = await import('../tracking.js');
    await expect(
      trackEvent('token', { featureId: 1, eventTypeId: 1 })
    ).resolves.toBeUndefined();
  });

  /**
   * Validates: Requirements 11.1, 11.3
   */
  it('does not throw on 4xx response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
    });

    const { trackEvent } = await import('../tracking.js');
    await expect(
      trackEvent('token', { featureId: 1, eventTypeId: 1 })
    ).resolves.toBeUndefined();
  });

  /**
   * Validates: Requirements 11.1, 11.3
   */
  it('does not throw on 5xx response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    const { trackEvent } = await import('../tracking.js');
    await expect(
      trackEvent('token', { featureId: 1, eventTypeId: 1 })
    ).resolves.toBeUndefined();
  });

  /**
   * Validates: Requirements 11.1, 11.3
   */
  it('does not throw on JSON parse error in response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.reject(new SyntaxError('Unexpected token')),
    });

    const { trackEvent } = await import('../tracking.js');
    await expect(
      trackEvent('token', { featureId: 1, eventTypeId: 1 })
    ).resolves.toBeUndefined();
  });
});
