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
  border: '1px solid #e5e4e7',
  borderRadius: '6px',
  fontSize: '14px',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  color: '#08060d',
  backgroundColor: '#fff',
  cursor: 'pointer',
  minWidth: '140px',
  WebkitAppearance: 'none',
  appearance: 'none',
  backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%23666\' d=\'M6 8L1 3h10z\'/%3E%3C/svg%3E")',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 10px center',
  paddingRight: '30px',
};

const labelStyle = {
  fontSize: '13px',
  color: '#555',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
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
