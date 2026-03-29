import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// --- Mocks ---

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockFetchDashboard = vi.fn();
const mockFetchTrend = vi.fn();
const mockSetSelectedFeatureId = vi.fn();

vi.mock('../../hooks/useDashboard.js', () => ({
  useDashboard: vi.fn(),
}));

vi.mock('../../utils/cookieStorage.js', () => ({
  getCookie: vi.fn(() => null),
  setCookie: vi.fn(),
  COOKIE_KEYS: {
    fromDate: 'dashboard_fromDate',
    toDate: 'dashboard_toDate',
    ageBucketId: 'dashboard_ageBucketId',
    genderId: 'dashboard_genderId',
  },
}));

vi.mock('../../utils/tokenStorage.js', () => ({
  getToken: vi.fn(() => 'test-token'),
}));

vi.mock('../../services/tracking.js', () => ({
  trackEvent: vi.fn(),
}));

const mockLogout = vi.fn().mockResolvedValue(undefined);
vi.mock('../../context/AuthContext.jsx', () => ({
  useAuth: () => ({ logout: mockLogout }),
}));

// Mock chart components to capture props and enable interaction testing
let capturedBarChartProps = {};
vi.mock('../../components/BarChartCard.jsx', () => ({
  default: (props) => {
    capturedBarChartProps = props;
    return (
      <div data-testid="bar-chart-card">
        <span>Feature Usage</span>
        <button
          data-testid="bar-click-trigger"
          onClick={() => props.onBarClick(20)}
        >
          Click bar
        </button>
      </div>
    );
  },
}));

vi.mock('../../components/LineChartCard.jsx', () => ({
  default: (props) => (
    <div data-testid="line-chart-card">
      <span>{props.data?.featureName ?? 'Daily Trend'}</span>
    </div>
  ),
}));

import DashboardPage from '../DashboardPage.jsx';
import { useDashboard } from '../../hooks/useDashboard.js';
import { getCookie, setCookie, COOKIE_KEYS } from '../../utils/cookieStorage.js';
import { getToken } from '../../utils/tokenStorage.js';
import { trackEvent } from '../../services/tracking.js';

// --- Helpers ---

const mockConfig = {
  features: [
    { id: 10, name: 'date_picker' },
    { id: 20, name: 'filter_age' },
  ],
  eventTypes: [{ id: 1, name: 'clicked' }],
  ageBuckets: [
    { id: 1, name: '18-24' },
    { id: 2, name: '25-34' },
  ],
  genders: [
    { id: 1, name: 'Male' },
    { id: 2, name: 'Female' },
  ],
};

const mockBarData = [
  { featureId: 10, featureName: 'date_picker', totalCount: 50 },
  { featureId: 20, featureName: 'filter_age', totalCount: 30 },
];

const mockLineData = {
  featureName: 'date_picker',
  points: [{ time: '2026-03-01', count: 5 }],
};

function defaultHookReturn(overrides = {}) {
  return {
    config: mockConfig,
    configLoading: false,
    configError: null,
    barData: mockBarData,
    lineData: mockLineData,
    selectedFeatureId: 10,
    chartsLoading: false,
    chartsError: null,
    fetchDashboard: mockFetchDashboard,
    fetchTrend: mockFetchTrend,
    setSelectedFeatureId: mockSetSelectedFeatureId,
    ...overrides,
  };
}

function renderDashboard() {
  return render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>
  );
}

describe('DashboardPage - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedBarChartProps = {};
    getCookie.mockReturnValue(null);
    getToken.mockReturnValue('test-token');
    useDashboard.mockReturnValue(defaultHookReturn());
  });

  /**
   * Validates: Requirement 1.4
   */
  it('shows loading state while config is loading', () => {
    useDashboard.mockReturnValue(
      defaultHookReturn({ config: null, configLoading: true })
    );
    renderDashboard();
    expect(screen.getByRole('status', { name: /loading dashboard/i })).toBeTruthy();
  });

  /**
   * Validates: Requirement 8.4
   */
  it('shows error state when configError is set', () => {
    useDashboard.mockReturnValue(
      defaultHookReturn({
        config: null,
        configLoading: false,
        configError: 'Failed to load configuration',
      })
    );
    renderDashboard();
    const alert = screen.getByRole('alert');
    expect(alert.textContent).toContain('Failed to load configuration');
  });

  /**
   * Validates: Requirements 1.1, 2.1
   */
  it('renders header, FilterPanel, and chart cards when config is loaded', () => {
    renderDashboard();
    expect(screen.getByText('Frontend')).toBeTruthy();
    expect(screen.getByText('Interactive product analytics dashboard')).toBeTruthy();
    expect(screen.getByLabelText(/age/i)).toBeTruthy();
    expect(screen.getByLabelText(/gender/i)).toBeTruthy();
    expect(screen.getByTestId('bar-chart-card')).toBeTruthy();
    expect(screen.getByTestId('line-chart-card')).toBeTruthy();
  });

  /**
   * Validates: Requirement 7.3
   */
  it('reads saved filters from cookies on mount', () => {
    getCookie.mockImplementation((key) => {
      if (key === COOKIE_KEYS.fromDate) return '2026-01-01';
      if (key === COOKIE_KEYS.toDate) return '2026-01-31';
      if (key === COOKIE_KEYS.ageBucketId) return '2';
      if (key === COOKIE_KEYS.genderId) return '1';
      return null;
    });
    renderDashboard();
    const callArg = useDashboard.mock.calls[0][0];
    expect(callArg.dateRange.fromDate).toBe('2026-01-01');
    expect(callArg.dateRange.toDate).toBe('2026-01-31');
    expect(callArg.ageBucketId).toBe(2);
    expect(callArg.genderId).toBe(1);
  });

  /**
   * Validates: Requirement 7.3
   */
  it('age filter change persists to cookies and calls fetchDashboard', () => {
    renderDashboard();
    const ageSelect = screen.getByLabelText(/age/i);
    fireEvent.change(ageSelect, { target: { value: '2' } });
    expect(setCookie).toHaveBeenCalledWith(COOKIE_KEYS.ageBucketId, '2');
    expect(mockFetchDashboard).toHaveBeenCalled();
  });

  /**
   * Validates: Requirement 7.3
   */
  it('gender filter change persists to cookies and calls fetchDashboard', () => {
    renderDashboard();
    const genderSelect = screen.getByLabelText(/gender/i);
    fireEvent.change(genderSelect, { target: { value: '1' } });
    expect(setCookie).toHaveBeenCalledWith(COOKIE_KEYS.genderId, '1');
    expect(mockFetchDashboard).toHaveBeenCalled();
  });

  /**
   * Validates: Requirement 4.4
   */
  it('age filter change fires tracking event with featureId=2, eventTypeId=3', () => {
    renderDashboard();
    fireEvent.change(screen.getByLabelText(/age/i), { target: { value: '1' } });
    expect(trackEvent).toHaveBeenCalledWith('test-token', {
      featureId: 2,
      eventTypeId: 3,
    });
  });

  /**
   * Validates: Requirement 5.4
   */
  it('gender filter change fires tracking event with featureId=3, eventTypeId=3', () => {
    renderDashboard();
    fireEvent.change(screen.getByLabelText(/gender/i), { target: { value: '2' } });
    expect(trackEvent).toHaveBeenCalledWith('test-token', {
      featureId: 3,
      eventTypeId: 3,
    });
  });

  /**
   * Validates: Requirement 6.4
   */
  it('bar click calls fetchTrend, setSelectedFeatureId, and fires tracking event', () => {
    renderDashboard();
    fireEvent.click(screen.getByTestId('bar-click-trigger'));
    expect(mockSetSelectedFeatureId).toHaveBeenCalledWith(20);
    expect(mockFetchTrend).toHaveBeenCalledWith(20, expect.objectContaining({
      dateRange: expect.any(Object),
    }));
    expect(trackEvent).toHaveBeenCalledWith('test-token', {
      featureId: 4,
      eventTypeId: 1,
    });
  });

  /**
   * Validates: Requirement 8.5
   */
  it('does not render charts or filters when config is loading', () => {
    useDashboard.mockReturnValue(
      defaultHookReturn({ config: null, configLoading: true })
    );
    renderDashboard();
    expect(screen.queryByLabelText(/age/i)).toBeNull();
    expect(screen.queryByLabelText(/gender/i)).toBeNull();
    expect(screen.queryByTestId('bar-chart-card')).toBeNull();
  });

  /**
   * Validates: Requirement 7.4
   */
  it('uses default filters when no cookies are saved', () => {
    getCookie.mockReturnValue(null);
    renderDashboard();
    const callArg = useDashboard.mock.calls[0][0];
    expect(callArg.ageBucketId).toBeNull();
    expect(callArg.genderId).toBeNull();
    expect(callArg.dateRange.fromDate).toBeTruthy();
    expect(callArg.dateRange.toDate).toBeTruthy();
  });
});
