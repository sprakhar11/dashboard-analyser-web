import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DateRangePicker from '../DateRangePicker.jsx';

/**
 * Unit tests for DateRangePicker component.
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4
 */

const defaultValue = { fromDate: '2026-03-01', toDate: '2026-03-31' };

describe('DateRangePicker - Unit Tests', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Requirement 3.1 — displays formatted date range text
  it('displays the formatted date range text', () => {
    render(<DateRangePicker value={defaultValue} onChange={vi.fn()} />);

    const trigger = screen.getByRole('button', { name: 'Select date range' });
    expect(trigger.textContent).toBe('Mar 1, 2026 – Mar 31, 2026');
  });

  // Requirement 3.1 — opens popover on click
  it('opens the popover when the trigger button is clicked', () => {
    render(<DateRangePicker value={defaultValue} onChange={vi.fn()} />);

    expect(screen.queryByRole('dialog')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Select date range' }));

    expect(screen.getByRole('dialog')).toBeDefined();
  });

  // Requirement 3.1 — date inputs reflect current value when opened
  it('populates date inputs with the current value when opened', () => {
    render(<DateRangePicker value={defaultValue} onChange={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Select date range' }));

    expect(screen.getByLabelText('From').value).toBe('2026-03-01');
    expect(screen.getByLabelText('To').value).toBe('2026-03-31');
  });

  // Requirement 3.2, 3.3 — Apply commits new dates and closes popover
  it('calls onChange with updated dates and closes popover on Apply', () => {
    const onChange = vi.fn();
    render(<DateRangePicker value={defaultValue} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'Select date range' }));

    fireEvent.change(screen.getByLabelText('From'), { target: { value: '2026-04-01' } });
    fireEvent.change(screen.getByLabelText('To'), { target: { value: '2026-04-30' } });

    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));

    expect(onChange).toHaveBeenCalledWith({ fromDate: '2026-04-01', toDate: '2026-04-30' });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  // Requirement 3.4 — Cancel reverts to original dates and closes popover
  it('reverts to original dates and closes popover on Cancel', () => {
    const onChange = vi.fn();
    render(<DateRangePicker value={defaultValue} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'Select date range' }));

    fireEvent.change(screen.getByLabelText('From'), { target: { value: '2026-05-01' } });
    fireEvent.change(screen.getByLabelText('To'), { target: { value: '2026-05-31' } });

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).toBeNull();

    // Trigger text should still show original range
    const trigger = screen.getByRole('button', { name: 'Select date range' });
    expect(trigger.textContent).toBe('Mar 1, 2026 – Mar 31, 2026');
  });

  // Requirement 3.4 — click outside popover closes it with cancel behavior
  it('closes the popover and reverts on click outside', () => {
    const onChange = vi.fn();
    render(<DateRangePicker value={defaultValue} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'Select date range' }));

    fireEvent.change(screen.getByLabelText('From'), { target: { value: '2026-06-01' } });

    // Simulate click outside
    fireEvent.mouseDown(document.body);

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).toBeNull();

    const trigger = screen.getByRole('button', { name: 'Select date range' });
    expect(trigger.textContent).toBe('Mar 1, 2026 – Mar 31, 2026');
  });
});
