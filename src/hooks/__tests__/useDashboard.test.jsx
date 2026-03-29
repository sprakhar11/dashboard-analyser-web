import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../services/analytics.js', () => ({
  getConfig: vi.fn(),
  getDashboard: vi.fn(),
  getFeatureTrend: vi.fn(),
}));

vi.mock('../../utils/tokenStorage.js', () => ({
  getToken: vi.fn(() => 'test-token'),
  removeToken: vi.fn(),
}));

import { getConfig, getDashboard, getFeatureTrend } from '../../services/analytics.js';
import { getToken, removeToken } from '../../utils/tokenStorage.js';
import { useDashboard } from '../useDashboard.js';

function wrapper({ children }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

const defaultFilters = {
  dateRange: { fromDate: '2026-03-01', toDate: '2026-03-31' },
  ageBucketId: null,
  genderId: null,
};

const mockConfig = {
  features: [
    { id: 10, name: 'date_picker' },
    { id: 20, name: 'filter_age' },
  ],
  eventTypes: [{ id: 1, name: 'clicked' }],
  ageBuckets: [{ id: 1, name: '18-24' }],
  genders: [{ id: 1, name: 'Male' }],
};

const mockDashboardData = {
  summary: { fromDate: '2026-03-01', toDate: '2026-03-31' },
  barChart: [
    { featureId: 10, featureName: 'date_picker', totalCount: 50 },
    { featureId: 20, featureName: 'filter_age', totalCount: 30 },
  ],
  lineChart: {
    featureId: 10,
    featureName: 'date_picker',
    bucket: 'day',
    points: [{ time: '2026-03-01', count: 5 }],
  },
};

const mockTrendData = {
  featureId: 20,
  featureName: 'filter_age',
  bucket: 'day',
  points: [
    { time: '2026-03-01', count: 3 },
    { time: '2026-03-02', count: 7 },
  ],
};

describe('useDashboard hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getToken.mockReturnValue('test-token');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Validates: Requirement 1.1
   */
  it('fetches config on mount and sets config state', async () => {
    getConfig.mockResolvedValue(mockConfig);

    const { result } = renderHook(() => useDashboard(defaultFilters), { wrapper });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(getConfig).toHaveBeenCalledWith('test-token');
    expect(result.current.config).toEqual(mockConfig);
    expect(result.current.configError).toBeNull();
  });

  /**
   * Validates: Requirement 2.1
   */
  it('defaults selectedFeatureId to first feature from config', async () => {
    getConfig.mockResolvedValue(mockConfig);

    const { result } = renderHook(() => useDashboard(defaultFilters), { wrapper });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(result.current.selectedFeatureId).toBe(10);
  });

  /**
   * Validates: Requirement 1.1
   */
  it('sets configLoading to true while fetching, false after', async () => {
    let resolveConfig;
    getConfig.mockReturnValue(new Promise((resolve) => { resolveConfig = resolve; }));

    const { result } = renderHook(() => useDashboard(defaultFilters), { wrapper });

    // Should be loading initially
    expect(result.current.configLoading).toBe(true);

    await act(async () => {
      resolveConfig(mockConfig);
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(result.current.configLoading).toBe(false);
  });

  /**
   * Validates: Requirement 8.4
   */
  it('sets configError when config fetch fails with non-401 error', async () => {
    const err = new Error('Server error');
    err.status = 500;
    getConfig.mockRejectedValue(err);

    const { result } = renderHook(() => useDashboard(defaultFilters), { wrapper });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(result.current.configError).toBe('Server error');
    expect(result.current.config).toBeNull();
    expect(removeToken).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  /**
   * Validates: Requirement 8.5
   */
  it('redirects to /login and calls removeToken on 401 config error', async () => {
    const err = new Error('Unauthorized');
    err.status = 401;
    getConfig.mockRejectedValue(err);

    const { result } = renderHook(() => useDashboard(defaultFilters), { wrapper });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(removeToken).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
    // configError should NOT be set for 401 (redirect handles it)
    expect(result.current.configError).toBeNull();
  });

  /**
   * Validates: Requirement 2.1
   */
  it('fetchDashboard sends correct params to getDashboard', async () => {
    getConfig.mockResolvedValue(mockConfig);
    getDashboard.mockResolvedValue(mockDashboardData);

    const { result } = renderHook(() => useDashboard(defaultFilters), { wrapper });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    await act(async () => {
      await result.current.fetchDashboard({
        dateRange: { fromDate: '2026-04-01', toDate: '2026-04-30' },
        selectedFeatureId: 10,
        ageBucketId: 1,
        genderId: 2,
      });
    });

    expect(getDashboard).toHaveBeenCalledWith('test-token', {
      fromDate: '2026-04-01',
      toDate: '2026-04-30',
      selectedFeatureId: 10,
      ageBucketId: 1,
      genderId: 2,
    });
  });

  /**
   * Validates: Requirement 2.1
   */
  it('fetchDashboard sets barData and lineData from response', async () => {
    getConfig.mockResolvedValue(mockConfig);
    getDashboard.mockResolvedValue(mockDashboardData);

    const { result } = renderHook(() => useDashboard(defaultFilters), { wrapper });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    await act(async () => {
      await result.current.fetchDashboard({
        dateRange: { fromDate: '2026-03-01', toDate: '2026-03-31' },
        ageBucketId: null,
        genderId: null,
      });
    });

    expect(result.current.barData).toEqual(mockDashboardData.barChart);
    expect(result.current.lineData).toEqual(mockDashboardData.lineChart);
    expect(result.current.chartsError).toBeNull();
  });

  /**
   * Validates: Requirement 8.4
   */
  it('fetchDashboard sets chartsError on non-401 error', async () => {
    getConfig.mockResolvedValue(mockConfig);
    const err = new Error('Bad request');
    err.status = 400;
    getDashboard.mockRejectedValue(err);

    const { result } = renderHook(() => useDashboard(defaultFilters), { wrapper });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    await act(async () => {
      await result.current.fetchDashboard({
        dateRange: { fromDate: '2026-03-01', toDate: '2026-03-31' },
        ageBucketId: null,
        genderId: null,
      });
    });

    expect(result.current.chartsError).toBe('Bad request');
    expect(removeToken).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  /**
   * Validates: Requirement 8.5
   */
  it('fetchDashboard redirects on 401 error', async () => {
    getConfig.mockResolvedValue(mockConfig);
    const err = new Error('Unauthorized');
    err.status = 401;
    getDashboard.mockRejectedValue(err);

    const { result } = renderHook(() => useDashboard(defaultFilters), { wrapper });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    await act(async () => {
      await result.current.fetchDashboard({
        dateRange: { fromDate: '2026-03-01', toDate: '2026-03-31' },
        ageBucketId: null,
        genderId: null,
      });
    });

    expect(removeToken).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
    expect(result.current.chartsError).toBeNull();
  });

  /**
   * Validates: Requirement 2.1
   */
  it('fetchTrend calls getFeatureTrend with correct params', async () => {
    getConfig.mockResolvedValue(mockConfig);
    getFeatureTrend.mockResolvedValue(mockTrendData);

    const { result } = renderHook(() => useDashboard(defaultFilters), { wrapper });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    await act(async () => {
      await result.current.fetchTrend(20);
    });

    expect(getFeatureTrend).toHaveBeenCalledWith('test-token', {
      featureId: 20,
      fromDate: '2026-03-01',
      toDate: '2026-03-31',
      bucket: 'day',
      ageBucketId: null,
      genderId: null,
    });
  });

  /**
   * Validates: Requirement 2.1
   */
  it('fetchTrend updates lineData with trend response', async () => {
    getConfig.mockResolvedValue(mockConfig);
    getFeatureTrend.mockResolvedValue(mockTrendData);

    const { result } = renderHook(() => useDashboard(defaultFilters), { wrapper });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    await act(async () => {
      await result.current.fetchTrend(20);
    });

    expect(result.current.lineData).toEqual(mockTrendData);
    expect(result.current.chartsError).toBeNull();
  });
});
