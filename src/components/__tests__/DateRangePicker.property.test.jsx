import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import DateRangePicker from '../DateRangePicker.jsx';

/**
 * Feature: product-analytics-dashboard, Property 3: DateRangePicker cancel reverts to previous value
 * Validates: Requirements 3.4
 *
 * For any initial date range, if the user opens the DateRangePicker, modifies the
 * start or end date, and then clicks Cancel, the displayed date range should equal
 * the original applied range.
 */

/**
 * Generates a valid YYYY-MM-DD date string within a reasonable range
 * using integer components to avoid invalid Date edge cases.
 */
const dateArb = fc
  .record({
    year: fc.integer({ min: 2000, max: 2099 }),
    month: fc.integer({ min: 1, max: 12 }),
    day: fc.integer({ min: 1, max: 28 }), // cap at 28 to avoid invalid month/day combos
  })
  .map(({ year, month, day }) =>
    `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  );

/**
 * Generates a pair of YYYY-MM-DD date strings where fromDate <= toDate.
 */
const dateRangeArb = fc
  .tuple(dateArb, dateArb)
  .map(([a, b]) => (a <= b ? { fromDate: a, toDate: b } : { fromDate: b, toDate: a }));

/**
 * Formats a YYYY-MM-DD string to the same display format the component uses
 * (e.g., "Mar 1, 2026"). Mirrors the component's internal formatDate function.
 */
function formatDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

describe('DateRangePicker - Property Tests', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('cancel reverts displayed range to the original value after modification', () => {
    fc.assert(
      fc.property(
        dateRangeArb,
        dateRangeArb,
        (originalRange, modifiedRange) => {
          // Skip when modified range is identical to original — no real modification
          fc.pre(
            originalRange.fromDate !== modifiedRange.fromDate ||
            originalRange.toDate !== modifiedRange.toDate
          );

          const onChange = vi.fn();

          const { unmount } = render(
            <DateRangePicker value={originalRange} onChange={onChange} />
          );

          const expectedText = `${formatDate(originalRange.fromDate)} – ${formatDate(originalRange.toDate)}`;

          // The button should show the original range
          const trigger = screen.getByRole('button', { name: 'Select date range' });
          expect(trigger.textContent).toBe(expectedText);

          // Open the popover
          fireEvent.click(trigger);

          // Modify the date inputs to different values
          const fromInput = screen.getByLabelText('From');
          const toInput = screen.getByLabelText('To');

          fireEvent.change(fromInput, { target: { value: modifiedRange.fromDate } });
          fireEvent.change(toInput, { target: { value: modifiedRange.toDate } });

          // Click Cancel
          const cancelButton = screen.getByRole('button', { name: 'Cancel' });
          fireEvent.click(cancelButton);

          // The displayed text should revert to the original range
          expect(trigger.textContent).toBe(expectedText);

          // onChange should NOT have been called
          expect(onChange).not.toHaveBeenCalled();

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});
