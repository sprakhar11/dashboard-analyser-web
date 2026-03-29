import DateRangePicker from './DateRangePicker.jsx';

const filterPanelStyles = `
  .filter-panel {
    display: flex;
    flex-direction: row;
    align-items: flex-end;
    gap: 16px;
    flex-wrap: wrap;
  }
  @media (max-width: 767px) {
    .filter-panel {
      flex-direction: column;
      align-items: stretch;
    }
  }
`;

const selectStyle = {
  padding: '6px 12px',
  border: '1px solid var(--border, #e5e4e7)',
  borderRadius: '6px',
  fontSize: '14px',
  fontFamily: 'var(--sans)',
  color: 'var(--text-h, #08060d)',
  background: 'var(--bg, #fff)',
  cursor: 'pointer',
  minWidth: '140px',
};

const labelStyle = {
  fontSize: '13px',
  color: 'var(--text, #555)',
  fontFamily: 'var(--sans)',
  marginBottom: '4px',
};

/**
 * @param {Object} props
 * @param {{ fromDate: string, toDate: string }} props.dateRange
 * @param {number|null} props.ageBucketId
 * @param {number|null} props.genderId
 * @param {Array<{id: number, name: string}>} props.ageBuckets
 * @param {Array<{id: number, name: string}>} props.genders
 * @param {(range: {fromDate: string, toDate: string}) => void} props.onDateRangeChange
 * @param {(id: number|null) => void} props.onAgeBucketChange
 * @param {(id: number|null) => void} props.onGenderChange
 */
export default function FilterPanel({
  dateRange,
  ageBucketId,
  genderId,
  ageBuckets,
  genders,
  onDateRangeChange,
  onAgeBucketChange,
  onGenderChange,
}) {
  return (
    <>
      <style>{filterPanelStyles}</style>
      <div className="filter-panel" role="group" aria-label="Dashboard filters">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={labelStyle}>Date Range</span>
          <DateRangePicker value={dateRange} onChange={onDateRangeChange} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label htmlFor="age-bucket-select" style={labelStyle}>
            Age
          </label>
          <select
            id="age-bucket-select"
            value={ageBucketId ?? ''}
            onChange={(e) => {
              const val = e.target.value;
              onAgeBucketChange(val === '' ? null : Number(val));
            }}
            style={selectStyle}
          >
            <option value="">All</option>
            {ageBuckets.map((bucket) => (
              <option key={bucket.id} value={bucket.id}>
                {bucket.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label htmlFor="gender-select" style={labelStyle}>
            Gender
          </label>
          <select
            id="gender-select"
            value={genderId ?? ''}
            onChange={(e) => {
              const val = e.target.value;
              onGenderChange(val === '' ? null : Number(val));
            }}
            style={selectStyle}
          >
            <option value="">All</option>
            {genders.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
}
