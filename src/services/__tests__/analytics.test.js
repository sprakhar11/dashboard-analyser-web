import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('AnalyticsService - Unit Tests', () => {
  const FAKE_BASE_URL = 'http://test-analytics-server';
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

  // --- getConfig ---

  /**
   * Validates: Requirement 1.1
   */
  it('getConfig() sends GET with auth-token header and returns config data', async () => {
    const mockConfig = {
      features: [{ id: 1, name: 'date_picker' }],
      eventTypes: [{ id: 1, name: 'clicked' }],
      ageBuckets: [{ id: 1, name: '18-24' }],
      genders: [{ id: 1, name: 'Male' }],
    };
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockConfig),
    });

    const { getConfig } = await import('../analytics.js');
    const result = await getConfig('my-token');

    expect(globalThis.fetch).toHaveBeenCalledWith(
      `${FAKE_BASE_URL}/api/analytics/config`,
      { headers: { 'auth-token': 'my-token' } }
    );
    expect(result).toEqual(mockConfig);
  });

  it('getConfig() throws on invalid response shape', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ unexpected: 'data' }),
    });

    const { getConfig } = await import('../analytics.js');
    await expect(getConfig('token')).rejects.toThrow('Unexpected response from analytics config endpoint');
  });

  it('getConfig() throws structured error on 401', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: 'UNAUTHORIZED', message: 'Invalid token' }),
    });

    const { getConfig } = await import('../analytics.js');
    try {
      await getConfig('bad-token');
      expect.unreachable('Should have thrown');
    } catch (err) {
      expect(err.message).toBe('Invalid token');
      expect(err.status).toBe(401);
      expect(err.code).toBe('UNAUTHORIZED');
    }
  });

  it('getConfig() throws structured error on 500', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: 'SERVER_ERROR', message: 'Internal error' }),
    });

    const { getConfig } = await import('../analytics.js');
    try {
      await getConfig('token');
      expect.unreachable('Should have thrown');
    } catch (err) {
      expect(err.message).toBe('Internal error');
      expect(err.status).toBe(500);
      expect(err.code).toBe('SERVER_ERROR');
    }
  });

  // --- getDashboard ---

  /**
   * Validates: Requirement 2.1
   */
  it('getDashboard() sends GET with query params and auth-token header', async () => {
    const mockDashboard = {
      summary: { fromDate: '2026-01-01', toDate: '2026-01-31' },
      barChart: [{ featureId: 1, featureName: 'date_picker', totalCount: 42 }],
      lineChart: { featureId: 1, featureName: 'date_picker', bucket: 'day', points: [] },
    };
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockDashboard),
    });

    const { getDashboard } = await import('../analytics.js');
    const result = await getDashboard('my-token', {
      fromDate: '2026-01-01',
      toDate: '2026-01-31',
      selectedFeatureId: 1,
      ageBucketId: 2,
      genderId: 3,
    });

    const calledUrl = globalThis.fetch.mock.calls[0][0];
    expect(calledUrl).toContain(`${FAKE_BASE_URL}/api/analytics/dashboard`);
    expect(calledUrl).toContain('fromDate=2026-01-01');
    expect(calledUrl).toContain('toDate=2026-01-31');
    expect(calledUrl).toContain('selectedFeatureId=1');
    expect(calledUrl).toContain('ageBucketId=2');
    expect(calledUrl).toContain('genderId=3');
    expect(globalThis.fetch.mock.calls[0][1]).toEqual({ headers: { 'auth-token': 'my-token' } });
    expect(result).toEqual(mockDashboard);
  });

  it('getDashboard() omits null optional params from query string', async () => {
    const mockDashboard = {
      summary: { fromDate: '2026-01-01', toDate: '2026-01-31' },
      barChart: [],
      lineChart: { featureId: 1, featureName: 'test', bucket: 'day', points: [] },
    };
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockDashboard),
    });

    const { getDashboard } = await import('../analytics.js');
    await getDashboard('token', {
      fromDate: '2026-01-01',
      toDate: '2026-01-31',
      ageBucketId: null,
      genderId: null,
    });

    const calledUrl = globalThis.fetch.mock.calls[0][0];
    expect(calledUrl).not.toContain('ageBucketId');
    expect(calledUrl).not.toContain('genderId');
  });

  it('getDashboard() throws on invalid response shape', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ wrong: 'shape' }),
    });

    const { getDashboard } = await import('../analytics.js');
    await expect(getDashboard('token', { fromDate: '2026-01-01', toDate: '2026-01-31' }))
      .rejects.toThrow('Unexpected response from analytics dashboard endpoint');
  });

  it('getDashboard() throws structured error on 401', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: 'UNAUTHORIZED', message: 'Token expired' }),
    });

    const { getDashboard } = await import('../analytics.js');
    try {
      await getDashboard('bad-token', { fromDate: '2026-01-01', toDate: '2026-01-31' });
      expect.unreachable('Should have thrown');
    } catch (err) {
      expect(err.status).toBe(401);
      expect(err.code).toBe('UNAUTHORIZED');
    }
  });

  // --- getFeatureTrend ---

  /**
   * Validates: Requirement 6.2
   */
  it('getFeatureTrend() sends GET with featureId in path and query params', async () => {
    const mockTrend = {
      featureId: 5,
      featureName: 'date_picker',
      bucket: 'day',
      points: [{ time: '2026-01-01', count: 10 }],
    };
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockTrend),
    });

    const { getFeatureTrend } = await import('../analytics.js');
    const result = await getFeatureTrend('my-token', {
      featureId: 5,
      fromDate: '2026-01-01',
      toDate: '2026-01-31',
      bucket: 'day',
      ageBucketId: 2,
      genderId: null,
    });

    const calledUrl = globalThis.fetch.mock.calls[0][0];
    expect(calledUrl).toContain(`${FAKE_BASE_URL}/api/analytics/features/5/trend`);
    expect(calledUrl).toContain('fromDate=2026-01-01');
    expect(calledUrl).toContain('toDate=2026-01-31');
    expect(calledUrl).toContain('bucket=day');
    expect(calledUrl).toContain('ageBucketId=2');
    expect(calledUrl).not.toContain('genderId');
    expect(globalThis.fetch.mock.calls[0][1]).toEqual({ headers: { 'auth-token': 'my-token' } });
    expect(result).toEqual(mockTrend);
  });

  it('getFeatureTrend() throws on invalid response shape', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ missing: 'fields' }),
    });

    const { getFeatureTrend } = await import('../analytics.js');
    await expect(getFeatureTrend('token', { featureId: 1 }))
      .rejects.toThrow('Unexpected response from analytics trend endpoint');
  });

  it('getFeatureTrend() throws structured error on 404', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ error: 'NOT_FOUND', message: 'Feature not found' }),
    });

    const { getFeatureTrend } = await import('../analytics.js');
    try {
      await getFeatureTrend('token', { featureId: 999 });
      expect.unreachable('Should have thrown');
    } catch (err) {
      expect(err.message).toBe('Feature not found');
      expect(err.status).toBe(404);
      expect(err.code).toBe('NOT_FOUND');
    }
  });

  it('handles error response with unparseable JSON body', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: () => Promise.reject(new Error('Invalid JSON')),
    });

    const { getConfig } = await import('../analytics.js');
    try {
      await getConfig('token');
      expect.unreachable('Should have thrown');
    } catch (err) {
      expect(err.status).toBe(500);
      expect(err.code).toBe('UNKNOWN_ERROR');
    }
  });
});
