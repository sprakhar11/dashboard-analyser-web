import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../services/analytics.js', () => ({
  getConfig: vi.fn(),
  getDashboard: vi.fn(),
  getFeatureTrend: vi.fn(),
}));

vi.mock('../../utils/tokenStorage.js', () => ({
  getToken: vi.fn(() => 'fake-token'),
  removeToken: vi.fn(),
}));

import { getConfig, getDashboard, getFeatureTrend } from '../../services/analytics.js';
import { getToken, removeToken } from '../../utils/tokenStorage.js';
import { useDashboard } from '../useDashboard.js';

function wrapper({ children }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

const defaultFilters = {
  dateRange: { fromDate: '2026-01-01', toDate: '2026-01-31' },
  ageBucketId: null,
  genderId: null,
};

/**
 * Arbitrary for non-401 HTTP error status codes.
 * Covers client errors (400-499 excluding 401) and server errors (500-599).
 */
const nonUnauthorizedStatus = fc.oneof(
  fc.constant(400),
  fc.integer({ min: 402, max: 499 }),
  fc.integer({ min: 500, max: 599 })
);

describe('useDashboard - Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getToken.mockReturnValue('fake-token');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Feature: product-analytics-dashboard, Property 5: Non-401 API errors display error state
   *
   * For any API error response with a status code that is not 401
   * (e.g., 400, 403, 404, 500), the affected chart card should display
   * an error message string and should not display chart content.
   *
   * Validates: Requirements 8.4
   */
  it('Property 5: Non-401 API errors on config fetch set configError with error message', async () => {
    await fc.assert(
      fc.asyncProperty(
        nonUnauthorizedStatus,
        fc.string({ minLength: 1, maxLength: 100 }),
        async (statusCode, errorMessage) => {
          vi.clearAllMocks();
          getToken.mockReturnValue('fake-token');

          const err = new Error(errorMessage);
          err.status = statusCode;
          err.code = 'TEST_ERROR';
          getConfig.mockRejectedValue(err);
          getDashboard.mockResolvedValue({
            summary: {},
            barChart: [],
            lineChart: null,
          });

          const { result } = renderHook(() => useDashboard(defaultFilters), { wrapper });

          // Wait for the config fetch to settle
          await act(async () => {
            await new Promise((r) => setTimeout(r, 0));
          });

          // configError should be set with the error message
          expect(result.current.configError).toBe(errorMessage);
          // config should remain null (no chart content)
          expect(result.current.config).toBeNull();
          // Should NOT have redirected (removeToken not called)
          expect(removeToken).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: product-analytics-dashboard, Property 5: Non-401 API errors display error state
   *
   * For any API error response with a status code that is not 401 on the
   * dashboard fetch, chartsError should be set with the error message.
   *
   * Validates: Requirements 8.4
   */
  it('Property 5: Non-401 API errors on dashboard fetch set chartsError with error message', async () => {
    await fc.assert(
      fc.asyncProperty(
        nonUnauthorizedStatus,
        fc.string({ minLength: 1, maxLength: 100 }),
        async (statusCode, errorMessage) => {
          vi.clearAllMocks();
          getToken.mockReturnValue('fake-token');

          // Config succeeds
          getConfig.mockResolvedValue({
            features: [{ id: 1, name: 'test_feature' }],
            eventTypes: [{ id: 1, name: 'click' }],
            ageBuckets: [{ id: 1, name: '18-24' }],
            genders: [{ id: 1, name: 'Male' }],
          });

          const dashErr = new Error(errorMessage);
          dashErr.status = statusCode;
          dashErr.code = 'TEST_ERROR';
          getDashboard.mockRejectedValue(dashErr);

          const { result } = renderHook(() => useDashboard(defaultFilters), { wrapper });

          // Wait for config fetch to settle
          await act(async () => {
            await new Promise((r) => setTimeout(r, 0));
          });

          // Now trigger fetchDashboard
          await act(async () => {
            await result.current.fetchDashboard({
              dateRange: { fromDate: '2026-01-01', toDate: '2026-01-31' },
              ageBucketId: null,
              genderId: null,
            });
          });

          // chartsError should be set with the error message
          expect(result.current.chartsError).toBe(errorMessage);
          // Should NOT have redirected
          expect(removeToken).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 100 }
    );
  });
});
