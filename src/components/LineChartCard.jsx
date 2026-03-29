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
 * @param {{ featureName: string, points: Array<{time: string, count: number}> }|null} props.data
 * @param {boolean} props.loading
 * @param {string|null} props.error
 */
export default function LineChartCard({ data, loading, error }) {
  const featureName = data?.featureName;
  const points = data?.points ?? [];

  const title = featureName
    ? `${featureName} — Daily Trend`
    : 'Daily Trend';

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
      <h3 style={titleStyle}>{title}</h3>
      {renderContent()}
    </div>
  );
}
