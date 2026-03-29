import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Formats a YYYY-MM-DD date string to a human-readable format (e.g., "Mar 1, 2026").
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @returns {string}
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

/**
 * DateRangePicker component.
 * Displays the current date range as formatted text. Clicking opens a popover
 * with two date inputs, Apply and Cancel buttons.
 *
 * @param {Object} props
 * @param {{ fromDate: string, toDate: string }} props.value - Current applied range (YYYY-MM-DD)
 * @param {(range: {fromDate: string, toDate: string}) => void} props.onChange - Called on Apply
 */
export default function DateRangePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ fromDate: value.fromDate, toDate: value.toDate });
  const popoverRef = useRef(null);
  const triggerRef = useRef(null);

  // Sync draft when value prop changes while closed
  useEffect(() => {
    if (!open) {
      setDraft({ fromDate: value.fromDate, toDate: value.toDate });
    }
  }, [value.fromDate, value.toDate, open]);

  const handleCancel = useCallback(() => {
    setDraft({ fromDate: value.fromDate, toDate: value.toDate });
    setOpen(false);
  }, [value.fromDate, value.toDate]);

  // Close popover on outside click (cancel behavior)
  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target)
      ) {
        handleCancel();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, handleCancel]);

  function handleApply() {
    onChange({ fromDate: draft.fromDate, toDate: draft.toDate });
    setOpen(false);
  }

  function handleOpen() {
    setDraft({ fromDate: value.fromDate, toDate: value.toDate });
    setOpen(true);
  }

  const displayText = `${formatDate(value.fromDate)} – ${formatDate(value.toDate)}`;

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        aria-label="Select date range"
        style={{
          background: 'var(--bg, #fff)',
          border: '1px solid var(--border, #e5e4e7)',
          borderRadius: '6px',
          padding: '6px 12px',
          cursor: 'pointer',
          fontSize: '14px',
          color: 'var(--text-h, #08060d)',
          fontFamily: 'var(--sans)',
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
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: '4px',
            background: 'var(--bg, #fff)',
            border: '1px solid var(--border, #e5e4e7)',
            borderRadius: '8px',
            boxShadow: 'var(--shadow)',
            padding: '16px',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            minWidth: '240px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label
              htmlFor="date-range-from"
              style={{ fontSize: '13px', color: 'var(--text)', fontFamily: 'var(--sans)' }}
            >
              From
            </label>
            <input
              id="date-range-from"
              type="date"
              value={draft.fromDate}
              onChange={(e) => setDraft((d) => ({ ...d, fromDate: e.target.value }))}
              style={{
                padding: '4px 8px',
                border: '1px solid var(--border, #e5e4e7)',
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: 'var(--sans)',
                color: 'var(--text-h)',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label
              htmlFor="date-range-to"
              style={{ fontSize: '13px', color: 'var(--text)', fontFamily: 'var(--sans)' }}
            >
              To
            </label>
            <input
              id="date-range-to"
              type="date"
              value={draft.toDate}
              onChange={(e) => setDraft((d) => ({ ...d, toDate: e.target.value }))}
              style={{
                padding: '4px 8px',
                border: '1px solid var(--border, #e5e4e7)',
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: 'var(--sans)',
                color: 'var(--text-h)',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={handleCancel}
              style={{
                padding: '6px 14px',
                border: '1px solid var(--border, #e5e4e7)',
                borderRadius: '6px',
                background: 'var(--bg, #fff)',
                cursor: 'pointer',
                fontSize: '13px',
                color: 'var(--text)',
                fontFamily: 'var(--sans)',
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              style={{
                padding: '6px 14px',
                border: 'none',
                borderRadius: '6px',
                background: 'var(--accent, #aa3bff)',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '13px',
                fontFamily: 'var(--sans)',
              }}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
