import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as fc from 'fast-check';

/**
 * Feature: product-analytics-dashboard, Property 2: Bar chart renders one bar per data item
 * Validates: Requirements 2.2
 *
 * For any non-empty barChart data array, the BarChartCard should render exactly
 * one bar element per item in the array.
 */

// Mock Recharts components so we can count rendered bar cells in jsdom
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar: ({ children }) => <div>{children}</div>,
  Cell: (props) => <div data-testid="bar-cell" />,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  CartesianGrid: () => null,
}));

import BarChartCard from '../BarChartCard.jsx';

/**
 * Generates a random non-empty array of bar chart data items with unique featureIds.
 */
const barDataArb = fc.uniqueArray(
  fc.record({
    featureId: fc.integer({ min: 1, max: 10000 }),
    featureName: fc.string({ minLength: 1, maxLength: 30 }).filter((s) => s.trim().length > 0),
    totalCount: fc.integer({ min: 0, max: 100000 }),
  }),
  { minLength: 1, maxLength: 20, selector: (item) => item.featureId }
);

const defaultProps = {
  selectedFeatureId: null,
  onBarClick: () => {},
  loading: false,
  error: null,
};

describe('BarChartCard - Property Tests', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders one bar-cell per data item', () => {
    fc.assert(
      fc.property(barDataArb, (data) => {
        const { unmount } = render(
          <BarChartCard {...defaultProps} data={data} />
        );

        const cells = screen.getAllByTestId('bar-cell');
        expect(cells).toHaveLength(data.length);

        unmount();
      }),
      { numRuns: 100 }
    );
  });
});
