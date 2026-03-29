import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Converts a YYYY-MM-DD date string to LocalDateTime start-of-day: YYYY-MM-DDT00:00:00
 */
function toStartOfDay(dateStr) {
  return dateStr ? `${dateStr}T00:00:00` : null;
}

/**
 * Converts a YYYY-MM-DD date string to LocalDateTime end-of-day: YYYY-MM-DDT23:59:59
 */
function toEndOfDay(dateStr) {
  return dateStr ? `${dateStr}T23:59:59` : null;
}

/**
 * Extracts YYYY-MM-DD from a LocalDateTime string or returns as-is if already date-only.
 */
function toDateOnly(dateTimeStr) {
  if (!dateTimeStr) return '';
  return dateTimeStr.slice(0, 10);
}

/**
 * Formats a date string for display. Returns "All time" for null.
 */
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

/** Returns YYYY-MM-DD for today */
function today() {
  return new Date().toISOString().slice(0, 10);
}

/** Returns YYYY-MM-DD for N days ago */
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

/** Returns YYYY-MM-DD for start of financial year (Apr 1) */
function financialYearStart() {
  const now = new Date();
  const year = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  return `${year}-04-01`;
}

/** Returns YYYY-MM-DD for N years ago from today */
function yearsAgo(n) {
  const d = new Date();
  d.setFullYear(d.getFullYear() - n);
  return d.toISOString().slice(0, 10);
}

const PRESETS = [
  { label: 'All', from: null, to: null },
  { label: 'Today', from: () => today(), to: () => today() },
  { label: '30 Days', from: () => daysAgo(30), to: () => today() },
  { label: 'FY', from: () => financialYearStart(), to: () => today() },
  { label: '1Y', from: () => yearsAgo(1), to: () => today() },
  { label: '2Y', from: () => yearsAgo(2), to: () => today() },
  { label: '3Y', from: () => yearsAgo(3), to: () => today() },
];

const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

const btnBase = {
  padding: '4px 10px',
  border: '1px solid #e5e4e7',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '12px',
  fontFamily: FONT,
  backgroundColor: '#fff',
  color: '#08060d',
};

const btnActive = {
  ...btnBase,
  backgroundColor: '#4f8df5',
  color: '#fff',
  borderColor: '#4f8df5',
};

/**
 * DateRangePicker with presets and optional custom from/to.
 *
 * @param {Object} props
 * @param {{ fromDate: string|null, toDate: string|null }} props.value
 * @param {(range: { fromDate: string|null, toDate: string|null }) => void} props.onChange
 */
export default function DateRangePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [activePreset, setActivePreset] = useState(null);
  const [draftFrom, setDraftFrom] = useState('');
  const [draftTo, setDraftTo] = useState('');
  const popoverRef = useRef(null);
  const triggerRef = useRef(null);

  // Determine active preset from current value on mount / value change
  useEffect(() => {
    if (!value.fromDate && !value.toDate) {
      setActivePreset('All');
    } else {
      setActivePreset('Custom');
    }
    setDraftFrom(toDateOnly(value.fromDate));
    setDraftTo(toDateOnly(value.toDate));
  }, [value.fromDate, value.toDate]);

  const handleCancel = useCallback(() => {
    setDraftFrom(toDateOnly(value.fromDate));
    setDraftTo(toDateOnly(value.toDate));
    setOpen(false);
  }, [value.fromDate, value.toDate]);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e) {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target) &&
        triggerRef.current && !triggerRef.current.contains(e.target)
      ) {
        handleCancel();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, handleCancel]);

  function handlePresetClick(preset) {
    const from = typeof preset.from === 'function' ? preset.from() : preset.from;
    const to = typeof preset.to === 'function' ? preset.to() : preset.to;
    setActivePreset(preset.label);
    onChange({
      fromDate: toStartOfDay(from),
      toDate: toEndOfDay(to),
    });
    setOpen(false);
  }

  function handleCustomApply() {
    onChange({
      fromDate: draftFrom ? toStartOfDay(draftFrom) : null,
      toDate: draftTo ? toEndOfDay(draftTo) : null,
    });
    setActivePreset('Custom');
    setOpen(false);
  }

  const displayText = formatDisplay(value.fromDate, value.toDate);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => { setDraftFrom(toDateOnly(value.fromDate)); setDraftTo(toDateOnly(value.toDate)); setOpen(!open); }}
        aria-label="Select date range"
        style={{
          backgroundColor: '#fff',
          border: '1px solid #e5e4e7',
          borderRadius: '6px',
          padding: '6px 12px',
          cursor: 'pointer',
          fontSize: '14px',
          color: '#08060d',
          fontFamily: FONT,
        }}
      >
        {displayText}
      </button>

      {open && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-label="Date range picker"
          style={{
            position: 'absolute', top: '100%', left: 0, marginTop: '4px',
            background: '#fff', border: '1px solid #e5e4e7', borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)', padding: '16px', zIndex: 10,
            display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '280px',
          }}
        >
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => handlePresetClick(p)}
                style={activePreset === p.label ? btnActive : btnBase}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div style={{ borderTop: '1px solid #e5e4e7', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: '#888', fontFamily: FONT }}>Custom range</span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <label htmlFor="date-range-from" style={{ fontSize: '13px', color: '#555', fontFamily: FONT }}>From</label>
              <input
                id="date-range-from"
                type="date"
                value={draftFrom}
                onChange={(e) => setDraftFrom(e.target.value)}
                style={{ padding: '4px 8px', border: '1px solid #e5e4e7', borderRadius: '4px', fontSize: '13px', fontFamily: FONT, color: '#08060d', backgroundColor: '#fff' }}
              />
              <label htmlFor="date-range-to" style={{ fontSize: '13px', color: '#555', fontFamily: FONT }}>To</label>
              <input
                id="date-range-to"
                type="date"
                value={draftTo}
                onChange={(e) => setDraftTo(e.target.value)}
                style={{ padding: '4px 8px', border: '1px solid #e5e4e7', borderRadius: '4px', fontSize: '13px', fontFamily: FONT, color: '#08060d', backgroundColor: '#fff' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={handleCancel} style={{ ...btnBase, padding: '5px 14px' }}>Cancel</button>
              <button type="button" onClick={handleCustomApply} style={{ ...btnBase, padding: '5px 14px', backgroundColor: '#4f8df5', color: '#fff', borderColor: '#4f8df5' }}>Apply</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
