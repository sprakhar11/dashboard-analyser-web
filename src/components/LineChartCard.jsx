import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

const LINE_COLOR = '#4f8df5';

const cardStyle = {
  background: '#fff',
  border: '1px solid #e5e4e7',
  borderRadius: '8px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  padding: '20px',
  minHeight: '300px',
  display: 'flex',
  flexDirection: 'column',
};

const titleStyle = {
  fontSize: '15px',
  fontWeight: 600,
  color: '#08060d',
  margin: '0 0 16px 0',
  fontFamily: 'var(--sans)',
};

const centeredStyle = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#888',
  fontSize: '14px',
  fontFamily: 'var(--sans)',
};

const spinnerStyle = {
  width: '28px',
  height: '28px',
  border: '3px solid #e5e4e7',
  borderTop: '3px solid #4f8df5',
  borderRadius: '50%',
  animation: 'line-card-spin 0.8s linear infinite',
};

const spinnerKeyframes = `
  @keyframes line-card-spin {
    to { transform: rotate(360deg); }
  }
`;

/**
 * @param {Object} props
 * @param {{ featureName: string, bucket: string, points: Array<{time: string, count: number}> }|null} props.data
 * @param {boolean} props.loading
 * @param {string|null} props.error
 * @param {string} props.bucket - 'day' or 'hour'
 * @param {(bucket: string) => void} props.onBucketChange
 */
export default function LineChartCard({ data, loading, error, bucket, onBucketChange, hourDisabled }) {
  const featureName = data?.featureName;
  const points = data?.points ?? [];

  const bucketLabel = bucket === 'hour' ? 'Hourly' : 'Daily';
  const title = featureName
    ? `${featureName} — ${bucketLabel} Trend`
    : `${bucketLabel} Trend`;

  const toggleStyle = (active) => ({
    padding: '3px 10px',
    border: '1px solid #e5e4e7',
    background: active ? '#4f8df5' : '#fff',
    color: active ? '#fff' : '#08060d',
    cursor: 'pointer',
    fontSize: '12px',
    fontFamily: 'var(--sans)',
  });

  const renderContent = () => {
    if (loading) {
      return (
        <div style={centeredStyle} role="status" aria-label="Loading line chart">
          <style>{spinnerKeyframes}</style>
          <div style={spinnerStyle} />
        </div>
      );
    }

    if (error) {
      return (
        <div style={{ ...centeredStyle, color: '#d32f2f' }} role="alert">
          {error}
        </div>
      );
    }

    if (points.length === 0) {
      return <div style={centeredStyle}>No data available</div>;
    }

    return (
      <ResponsiveContainer width="100%" height={250}>
        <LineChart
          data={points}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="count"
            stroke={LINE_COLOR}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ ...titleStyle, margin: 0 }}>{title}</h3>
        {onBucketChange && (
          <div style={{ display: 'flex' }}>
            <button
              type="button"
              onClick={() => onBucketChange('day')}
              style={{ ...toggleStyle(bucket === 'day'), borderRadius: '4px 0 0 4px' }}
            >
              Day
            </button>
            <button
              type="button"
              onClick={() => onBucketChange('hour')}
              disabled={hourDisabled}
              title={hourDisabled ? 'Select a single day to view hourly data' : ''}
              style={{ ...toggleStyle(bucket === 'hour'), borderRadius: '0 4px 4px 0', borderLeft: 'none', ...(hourDisabled ? { opacity: 0.4, cursor: 'not-allowed' } : {}) }}
            >
              Hour
            </button>
          </div>
        )}
      </div>
      {renderContent()}
    </div>
  );
}
