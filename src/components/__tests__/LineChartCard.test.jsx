import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';

/**
 * Unit tests for LineChartCard component.
 * Validates: Requirements 2.3, 8.1, 8.3, 8.4
 */

// Mock Recharts components for jsdom compatibility
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  CartesianGrid: () => null,
}));

import LineChartCard from '../LineChartCard.jsx';

const sampleData = {
  featureName: 'date_picker',
  points: [
    { time: '2026-03-01', count: 10 },
    { time: '2026-03-02', count: 25 },
    { time: '2026-03-03', count: 18 },
  ],
};

const defaultProps = {
  data: sampleData,
  loading: false,
  error: null,
};

describe('LineChartCard - Unit Tests', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Requirement 8.1 — Shows loading spinner when loading is true
  it('shows loading indicator when loading is true', () => {
    render(<LineChartCard data={null} loading={true} error={null} />);

    const loadingEl = screen.getByRole('status');
    expect(loadingEl).toBeDefined();
    expect(loadingEl.getAttribute('aria-label')).toBe('Loading line chart');
    expect(screen.queryByTestId('line-chart')).toBeNull();
  });

  // Requirement 8.3 — Shows empty state when data has empty points and not loading
  it('shows empty state message when data has empty points and not loading', () => {
    render(
      <LineChartCard
        data={{ featureName: 'date_picker', points: [] }}
        loading={false}
        error={null}
      />
    );

    expect(screen.getByText('No data available')).toBeDefined();
    expect(screen.queryByTestId('line-chart')).toBeNull();
  });

  // Requirement 8.3 — Shows empty state when data is null and not loading
  it('shows empty state message when data is null and not loading', () => {
    render(<LineChartCard data={null} loading={false} error={null} />);

    expect(screen.getByText('No data available')).toBeDefined();
    expect(screen.queryByTestId('line-chart')).toBeNull();
  });

  // Requirement 8.4 — Shows error message when error is set
  it('shows error message when error prop is set', () => {
    const errorMsg = 'Failed to load trend data';
    render(<LineChartCard data={null} loading={false} error={errorMsg} />);

    const alert = screen.getByRole('alert');
    expect(alert).toBeDefined();
    expect(alert.textContent).toBe(errorMsg);
    expect(screen.queryByTestId('line-chart')).toBeNull();
  });

  // Requirement 2.3 — Renders line chart when data has points
  it('renders line chart when data has points', () => {
    render(<LineChartCard {...defaultProps} />);

    expect(screen.getByTestId('line-chart')).toBeDefined();
    expect(screen.getByTestId('line')).toBeDefined();
  });

  // Requirement 8.3 — Title shows feature name
  it('title shows feature name with "Daily Trend" suffix', () => {
    render(<LineChartCard {...defaultProps} />);

    expect(screen.getByText('date_picker — Daily Trend')).toBeDefined();
  });

  // Requirement 8.3 — Title shows "Daily Trend" when data is null
  it('title shows "Daily Trend" when data is null', () => {
    render(<LineChartCard data={null} loading={false} error={null} />);

    expect(screen.getByText('Daily Trend')).toBeDefined();
  });

  it('title shows "Hourly Trend" when bucket is hour', () => {
    render(<LineChartCard {...defaultProps} bucket="hour" onBucketChange={() => {}} />);

    expect(screen.getByText('date_picker — Hourly Trend')).toBeDefined();
  });

  it('renders day/hour toggle buttons when onBucketChange is provided', () => {
    render(<LineChartCard {...defaultProps} bucket="day" onBucketChange={() => {}} />);

    expect(screen.getByRole('button', { name: 'Day' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Hour' })).toBeDefined();
  });
});
