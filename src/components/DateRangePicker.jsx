import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Extracts YYYY-MM-DD from a LocalDateTime string.
 */
function toDateOnly(dateTimeStr) {
  if (!dateTimeStr) return '';
  return dateTimeStr.slice(0, 10);
}

/**
 * Extracts HH:mm from a LocalDateTime string. Returns '' if no time part.
 */
function toTimeOnly(dateTimeStr) {
  if (!dateTimeStr || dateTimeStr.length <= 10) return '';
  return dateTimeStr.slice(11, 16);
}

/**
 * Builds a LocalDateTime string from date and time parts.
 * If time is empty, uses defaultTime. Seconds default to 00 for from, 59 for to.
 */
function buildDateTime(date, time, defaultTime, defaultSeconds) {
  if (!date) return null;
  const t = time || defaultTime;
  return `${date}T${t}:${defaultSeconds}`;
}

/**
 * Formats for display. Shows time if not 00:00 / 23:59.
 */
function formatDisplay(fromDate, toDate) {
  if (!fromDate && !toDate) return 'All time';
  const fmtDate = (str) => {
    const [y, m, d] = str.slice(0, 10).split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  const fmtTime = (str) => {
    if (!str || str.length <= 10) return '';
    const t = str.slice(11, 16);
    if (t === '00:00' || t === '23:59') return '';
    return ` ${t}`;
  };
  const fmt = (str) => fmtDate(str) + fmtTime(str);
  if (fromDate && toDate) return `${fmt(fromDate)} – ${fmt(toDate)}`;
  if (fromDate) return `From ${fmt(fromDate)}`;
  return `Up to ${fmt(toDate)}`;
}

function today() { return new Date().toISOString().slice(0, 10); }
function daysAgo(n) { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10); }
function financialYearStart() { const now = new Date(); const y = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1; return `${y}-04-01`; }
function yearsAgo(n) { const d = new Date(); d.setFullYear(d.getFullYear() - n); return d.toISOString().slice(0, 10); }

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
const btnBase = { padding: '4px 10px', border: '1px solid #e5e4e7', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontFamily: FONT, backgroundColor: '#fff', color: '#08060d' };
const btnActive = { ...btnBase, backgroundColor: '#4f8df5', color: '#fff', borderColor: '#4f8df5' };
const inputStyle = { padding: '4px 8px', border: '1px solid #e5e4e7', borderRadius: '4px', fontSize: '13px', fontFamily: FONT, color: '#08060d', backgroundColor: '#fff' };
const labelStyle = { fontSize: '13px', color: '#555', fontFamily: FONT, minWidth: '32px' };

export default function DateRangePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [activePreset, setActivePreset] = useState(null);
  const [draftFromDate, setDraftFromDate] = useState('');
  const [draftFromTime, setDraftFromTime] = useState('');
  const [draftToDate, setDraftToDate] = useState('');
  const [draftToTime, setDraftToTime] = useState('');
  const popoverRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!value.fromDate && !value.toDate) {
      setActivePreset('All');
    } else {
      setActivePreset('Custom');
    }
    setDraftFromDate(toDateOnly(value.fromDate));
    setDraftFromTime(toTimeOnly(value.fromDate));
    setDraftToDate(toDateOnly(value.toDate));
    setDraftToTime(toTimeOnly(value.toDate));
  }, [value.fromDate, value.toDate]);

  const handleCancel = useCallback(() => {
    setDraftFromDate(toDateOnly(value.fromDate));
    setDraftFromTime(toTimeOnly(value.fromDate));
    setDraftToDate(toDateOnly(value.toDate));
    setDraftToTime(toTimeOnly(value.toDate));
    setOpen(false);
  }, [value.fromDate, value.toDate]);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e) {
      if (popoverRef.current && !popoverRef.current.contains(e.target) && triggerRef.current && !triggerRef.current.contains(e.target)) {
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
      fromDate: from ? `${from}T00:00:00` : null,
      toDate: to ? `${to}T23:59:59` : null,
    });
    setOpen(false);
  }

  function handleCustomApply() {
    onChange({
      fromDate: buildDateTime(draftFromDate, draftFromTime, '00:00', '00'),
      toDate: buildDateTime(draftToDate, draftToTime, '23:59', '59'),
    });
    setActivePreset('Custom');
    setOpen(false);
  }

  function handleOpen() {
    setDraftFromDate(toDateOnly(value.fromDate));
    setDraftFromTime(toTimeOnly(value.fromDate));
    setDraftToDate(toDateOnly(value.toDate));
    setDraftToTime(toTimeOnly(value.toDate));
    setOpen(!open);
  }

  const displayText = formatDisplay(value.fromDate, value.toDate);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button ref={triggerRef} type="button" onClick={handleOpen} aria-label="Select date range"
        style={{ backgroundColor: '#fff', border: '1px solid #e5e4e7', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '14px', color: '#08060d', fontFamily: FONT }}>
        {displayText}
      </button>

      {open && (
        <div ref={popoverRef} role="dialog" aria-label="Date range picker"
          style={{ position: 'absolute', top: '100%', left: 0, marginTop: '4px', background: '#fff', border: '1px solid #e5e4e7', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', padding: '16px', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '340px' }}>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {PRESETS.map((p) => (
              <button key={p.label} type="button" onClick={() => handlePresetClick(p)} style={activePreset === p.label ? btnActive : btnBase}>{p.label}</button>
            ))}
          </div>

          <div style={{ borderTop: '1px solid #e5e4e7', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '12px', color: '#888', fontFamily: FONT }}>Custom range</span>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <label htmlFor="date-range-from" style={labelStyle}>From</label>
              <input id="date-range-from" type="date" value={draftFromDate} onChange={(e) => { setDraftFromDate(e.target.value); if (!e.target.value) setDraftFromTime(''); }} style={inputStyle} />
              <input id="time-range-from" type="time" aria-label="From time" value={draftFromTime} onChange={(e) => setDraftFromTime(e.target.value)} disabled={!draftFromDate} style={{ ...inputStyle, width: '100px', ...(draftFromDate ? {} : { opacity: 0.4, cursor: 'not-allowed' }) }} />
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <label htmlFor="date-range-to" style={labelStyle}>To</label>
              <input id="date-range-to" type="date" value={draftToDate} onChange={(e) => { setDraftToDate(e.target.value); if (!e.target.value) setDraftToTime(''); }} style={inputStyle} />
              <input id="time-range-to" type="time" aria-label="To time" value={draftToTime} onChange={(e) => setDraftToTime(e.target.value)} disabled={!draftToDate} style={{ ...inputStyle, width: '100px', ...(draftToDate ? {} : { opacity: 0.4, cursor: 'not-allowed' }) }} />
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
