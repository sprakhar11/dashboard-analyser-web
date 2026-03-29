import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import DateRangePicker from '../DateRangePicker.jsx';

/**
 * Feature: product-analytics-dashboard, Property 3: DateRangePicker cancel reverts to previous value
 * Validates: Requirements 3.4
 */

const dateArb = fc
  .record({
    year: fc.integer({ min: 2000, max: 2099 }),
    month: fc.integer({ min: 1, max: 12 }),
    day: fc.integer({ min: 1, max: 28 }),
  })
  .map(({ year, month, day }) =>
    `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  );

const dateRangeArb = fc
  .tuple(dateArb, dateArb)
  .map(([a, b]) => {
    const [from, to] = a <= b ? [a, b] : [b, a];
    return { fromDate: `${from}T00:00:00`, toDate: `${to}T23:59:59` };
  });

function formatDisplay(fromDate, toDate) {
  if (!fromDate && !toDate) return 'All time';
  const fmt = (str) => {
    const [y, m, d] = str.slice(0, 10).split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  if (fromDate && toDate) return `${fmt(fromDate)} – ${fmt(toDate)}`;
  if (fromDate) return `From ${fmt(fromDate)}`;
  return `Up to ${fmt(toDate)}`;
}

describe('DateRangePicker - Property Tests', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('cancel reverts displayed range to the original value after modification', () => {
    fc.assert(
      fc.property(dateRangeArb, (originalRange) => {
        const onChange = vi.fn();
        const { unmount } = render(
          <DateRangePicker value={originalRange} onChange={onChange} />
        );

        const expectedText = formatDisplay(originalRange.fromDate, originalRange.toDate);
        const trigger = screen.getByRole('button', { name: 'Select date range' });
        expect(trigger.textContent).toBe(expectedText);

        fireEvent.click(trigger);
        fireEvent.change(screen.getByLabelText('From'), { target: { value: '2099-12-31' } });
        fireEvent.change(screen.getByLabelText('To'), { target: { value: '2099-12-31' } });
        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

        expect(trigger.textContent).toBe(expectedText);
        expect(onChange).not.toHaveBeenCalled();
        unmount();
      }),
      { numRuns: 100 }
    );
  });
});
