import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FilterPanel from '../FilterPanel.jsx';

// Mock DateRangePicker to avoid complexity
vi.mock('../DateRangePicker.jsx', () => ({
  default: ({ value, onChange }) => (
    <div data-testid="date-range-picker">
      {value.fromDate} – {value.toDate}
      <button onClick={() => onChange({ fromDate: '2026-04-01', toDate: '2026-04-30' })}>
        ApplyMock
      </button>
    </div>
  ),
}));

/**
 * Unit tests for FilterPanel component.
 * Validates: Requirements 4.1, 5.1
 */

const ageBuckets = [
  { id: 1, name: '18-24' },
  { id: 2, name: '25-34' },
  { id: 3, name: '35-44' },
];

const genders = [
  { id: 1, name: 'Male' },
  { id: 2, name: 'Female' },
];

const defaultProps = {
  dateRange: { fromDate: '2026-03-01', toDate: '2026-03-31' },
  ageBucketId: null,
  genderId: null,
  ageBuckets,
  genders,
  onDateRangeChange: vi.fn(),
  onAgeBucketChange: vi.fn(),
  onGenderChange: vi.fn(),
};

describe('FilterPanel - Unit Tests', () => {
  // Requirement 4.1 — Age dropdown renders ageBuckets plus "All" option
  it('renders age dropdown with ageBuckets plus "All" option', () => {
    render(<FilterPanel {...defaultProps} />);

    const ageSelect = screen.getByLabelText('Age');
    const options = ageSelect.querySelectorAll('option');

    expect(options).toHaveLength(ageBuckets.length + 1);
    expect(options[0].textContent).toBe('All');
    expect(options[0].value).toBe('');
    expect(options[1].textContent).toBe('18-24');
    expect(options[2].textContent).toBe('25-34');
    expect(options[3].textContent).toBe('35-44');
  });

  // Requirement 5.1 — Gender dropdown renders genders plus "All" option
  it('renders gender dropdown with genders plus "All" option', () => {
    render(<FilterPanel {...defaultProps} />);

    const genderSelect = screen.getByLabelText('Gender');
    const options = genderSelect.querySelectorAll('option');

    expect(options).toHaveLength(genders.length + 1);
    expect(options[0].textContent).toBe('All');
    expect(options[0].value).toBe('');
    expect(options[1].textContent).toBe('Male');
    expect(options[2].textContent).toBe('Female');
  });

  // Requirement 4.1 — Age dropdown change fires callback with selected id (number)
  it('fires onAgeBucketChange with numeric id when age option selected', () => {
    const onAgeBucketChange = vi.fn();
    render(<FilterPanel {...defaultProps} onAgeBucketChange={onAgeBucketChange} />);

    fireEvent.change(screen.getByLabelText('Age'), { target: { value: '2' } });

    expect(onAgeBucketChange).toHaveBeenCalledWith(2);
    expect(onAgeBucketChange).toHaveBeenCalledTimes(1);
  });

  // Requirement 4.1 — Age dropdown "All" selection fires callback with null
  it('fires onAgeBucketChange with null when "All" is selected', () => {
    const onAgeBucketChange = vi.fn();
    render(<FilterPanel {...defaultProps} ageBucketId={2} onAgeBucketChange={onAgeBucketChange} />);

    fireEvent.change(screen.getByLabelText('Age'), { target: { value: '' } });

    expect(onAgeBucketChange).toHaveBeenCalledWith(null);
    expect(onAgeBucketChange).toHaveBeenCalledTimes(1);
  });

  // Requirement 5.1 — Gender dropdown change fires callback with selected id (number)
  it('fires onGenderChange with numeric id when gender option selected', () => {
    const onGenderChange = vi.fn();
    render(<FilterPanel {...defaultProps} onGenderChange={onGenderChange} />);

    fireEvent.change(screen.getByLabelText('Gender'), { target: { value: '1' } });

    expect(onGenderChange).toHaveBeenCalledWith(1);
    expect(onGenderChange).toHaveBeenCalledTimes(1);
  });

  // Requirement 5.1 — Gender dropdown "All" selection fires callback with null
  it('fires onGenderChange with null when "All" is selected', () => {
    const onGenderChange = vi.fn();
    render(<FilterPanel {...defaultProps} genderId={1} onGenderChange={onGenderChange} />);

    fireEvent.change(screen.getByLabelText('Gender'), { target: { value: '' } });

    expect(onGenderChange).toHaveBeenCalledWith(null);
    expect(onGenderChange).toHaveBeenCalledTimes(1);
  });

  // Requirement 3.1 — Renders DateRangePicker
  it('renders DateRangePicker with the date range', () => {
    render(<FilterPanel {...defaultProps} />);

    const picker = screen.getByTestId('date-range-picker');
    expect(picker).toBeDefined();
    expect(picker.textContent).toContain('2026-03-01');
    expect(picker.textContent).toContain('2026-03-31');
  });
});
