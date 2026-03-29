import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DateRangePicker from '../DateRangePicker.jsx';

const defaultValue = { fromDate: '2026-03-01T00:00:00', toDate: '2026-03-31T23:59:59' };

describe('DateRangePicker - Unit Tests', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('displays formatted date range text', () => {
    render(<DateRangePicker value={defaultValue} onChange={vi.fn()} />);
    const trigger = screen.getByRole('button', { name: 'Select date range' });
    expect(trigger.textContent).toBe('Mar 1, 2026 – Mar 31, 2026');
  });

  it('displays "All time" when both dates are null', () => {
    render(<DateRangePicker value={{ fromDate: null, toDate: null }} onChange={vi.fn()} />);
    const trigger = screen.getByRole('button', { name: 'Select date range' });
    expect(trigger.textContent).toBe('All time');
  });

  it('opens the popover when the trigger button is clicked', () => {
    render(<DateRangePicker value={defaultValue} onChange={vi.fn()} />);
    expect(screen.queryByRole('dialog')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Select date range' }));
    expect(screen.getByRole('dialog')).toBeDefined();
  });

  it('renders preset buttons', () => {
    render(<DateRangePicker value={defaultValue} onChange={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Select date range' }));
    expect(screen.getByRole('button', { name: 'All' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Today' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'FY' })).toBeDefined();
    expect(screen.getByRole('button', { name: '1Y' })).toBeDefined();
  });

  it('clicking "All" preset calls onChange with null dates and closes popover', () => {
    const onChange = vi.fn();
    render(<DateRangePicker value={defaultValue} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Select date range' }));
    fireEvent.click(screen.getByRole('button', { name: 'All' }));
    expect(onChange).toHaveBeenCalledWith({ fromDate: null, toDate: null });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('clicking "Today" preset calls onChange with today dates', () => {
    const onChange = vi.fn();
    render(<DateRangePicker value={{ fromDate: null, toDate: null }} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Select date range' }));
    fireEvent.click(screen.getByRole('button', { name: 'Today' }));
    const call = onChange.mock.calls[0][0];
    const todayStr = new Date().toISOString().slice(0, 10);
    expect(call.fromDate).toBe(`${todayStr}T00:00:00`);
    expect(call.toDate).toBe(`${todayStr}T23:59:59`);
  });

  it('custom Apply calls onChange with LocalDateTime format and closes popover', () => {
    const onChange = vi.fn();
    render(<DateRangePicker value={defaultValue} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Select date range' }));
    fireEvent.change(screen.getByLabelText('From'), { target: { value: '2026-04-01' } });
    fireEvent.change(screen.getByLabelText('To'), { target: { value: '2026-04-30' } });
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect(onChange).toHaveBeenCalledWith({ fromDate: '2026-04-01T00:00:00', toDate: '2026-04-30T23:59:59' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('custom Apply with empty dates calls onChange with null', () => {
    const onChange = vi.fn();
    render(<DateRangePicker value={defaultValue} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Select date range' }));
    fireEvent.change(screen.getByLabelText('From'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('To'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect(onChange).toHaveBeenCalledWith({ fromDate: null, toDate: null });
  });

  it('Cancel closes popover without calling onChange', () => {
    const onChange = vi.fn();
    render(<DateRangePicker value={defaultValue} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Select date range' }));
    fireEvent.change(screen.getByLabelText('From'), { target: { value: '2026-05-01' } });
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('click outside closes popover without calling onChange', () => {
    const onChange = vi.fn();
    render(<DateRangePicker value={defaultValue} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Select date range' }));
    fireEvent.mouseDown(document.body);
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
