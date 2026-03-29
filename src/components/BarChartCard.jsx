import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
} from 'recharts';

const SELECTED_COLOR = '#4f8df5';
const DEFAULT_COLOR = '#c4c4c4';

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
  animation: 'bar-card-spin 0.8s linear infinite',
};

const spinnerKeyframes = `
  @keyframes bar-card-spin {
    to { transform: rotate(360deg); }
  }
`;

/**
 * @param {Object} props
 * @param {Array<{featureId: number, featureName: string, totalCount: number}>} props.data
 * @param {number|null} props.selectedFeatureId - Currently selected bar
 * @param {(featureId: number) => void} props.onBarClick
 * @param {boolean} props.loading
 * @param {string|null} props.error
 */
export default function BarChartCard({
  data,
  selectedFeatureId,
  onBarClick,
  loading,
  error,
}) {
  const renderContent = () => {
    if (loading) {
      return (
        <div style={centeredStyle} role="status" aria-label="Loading bar chart">
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

    if (!data || data.length === 0) {
      return (
        <div style={centeredStyle}>
          No data available for the selected filters
        </div>
      );
    }

    const chartHeight = Math.max(data.length * 40, 200);

    return (
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" />
          <YAxis
            type="category"
            dataKey="featureName"
            width={120}
            tick={{ fontSize: 13 }}
          />
          <Tooltip />
          <Bar
            dataKey="totalCount"
            name="Total Clicks"
            cursor="pointer"
            onClick={(entry) => {
              if (entry && entry.featureId != null) {
                onBarClick(entry.featureId);
              }
            }}
          >
            {data.map((entry) => (
              <Cell
                key={entry.featureId}
                fill={
                  selectedFeatureId === entry.featureId
                    ? SELECTED_COLOR
                    : DEFAULT_COLOR
                }
                opacity={
                  selectedFeatureId != null &&
                  selectedFeatureId !== entry.featureId
                    ? 0.5
                    : 1
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div style={cardStyle}>
      <h3 style={titleStyle}>Feature Usage</h3>
      {renderContent()}
    </div>
  );
}
