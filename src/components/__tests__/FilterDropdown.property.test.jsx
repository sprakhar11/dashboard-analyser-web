import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import * as fc from 'fast-check';
import FilterPanel from '../FilterPanel.jsx';

/**
 * Feature: product-analytics-dashboard, Property 1: Filter dropdown options match config data
 * Validates: Requirements 1.2, 4.1, 5.1
 *
 * For any config data containing a list of dimension items (ageBuckets or genders),
 * the corresponding dropdown component should render exactly length(items) + 1 options,
 * where the extra option is "All", and every item's name appears as an option label.
 */

// Mock DateRangePicker to avoid rendering its complex popover logic
vi.mock('../DateRangePicker.jsx', () => ({
  default: () => <div data-testid="date-range-picker-mock" />,
}));

/**
 * Generates a random array of {id, name} items with unique ids and non-empty names.
 */
const itemsArb = fc
  .uniqueArray(
    fc.record({
      id: fc.integer({ min: 1, max: 10000 }),
      name: fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
    }),
    { minLength: 0, maxLength: 20, selector: (item) => item.id }
  );

const defaultProps = {
  dateRange: { fromDate: '2025-01-01', toDate: '2025-01-31' },
  ageBucketId: null,
  genderId: null,
  onDateRangeChange: () => {},
  onAgeBucketChange: () => {},
  onGenderChange: () => {},
};

describe('FilterPanel Dropdowns - Property Tests', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('age dropdown options match ageBuckets config data', () => {
    fc.assert(
      fc.property(itemsArb, (ageBuckets) => {
        const { unmount } = render(
          <FilterPanel
            {...defaultProps}
            ageBuckets={ageBuckets}
            genders={[]}
          />
        );

        const select = screen.getByLabelText('Age');
        const options = within(select).getAllByRole('option');

        // Option count should be items.length + 1 (for "All")
        expect(options).toHaveLength(ageBuckets.length + 1);

        // First option should be "All"
        expect(options[0].textContent).toBe('All');

        // Every item's name should appear as an option label
        const optionLabels = options.map((opt) => opt.textContent);
        for (const bucket of ageBuckets) {
          expect(optionLabels).toContain(bucket.name);
        }

        unmount();
      }),
      { numRuns: 100 }
    );
  });

  it('gender dropdown options match genders config data', () => {
    fc.assert(
      fc.property(itemsArb, (genders) => {
        const { unmount } = render(
          <FilterPanel
            {...defaultProps}
            ageBuckets={[]}
            genders={genders}
          />
        );

        const select = screen.getByLabelText('Gender');
        const options = within(select).getAllByRole('option');

        // Option count should be items.length + 1 (for "All")
        expect(options).toHaveLength(genders.length + 1);

        // First option should be "All"
        expect(options[0].textContent).toBe('All');

        // Every item's name should appear as an option label
        const optionLabels = options.map((opt) => opt.textContent);
        for (const gender of genders) {
          expect(optionLabels).toContain(gender.name);
        }

        unmount();
      }),
      { numRuns: 100 }
    );
  });
});
