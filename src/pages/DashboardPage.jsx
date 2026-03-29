import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useDashboard } from '../hooks/useDashboard.js';
import { getCookie, setCookie, COOKIE_KEYS } from '../utils/cookieStorage.js';
import { getToken } from '../utils/tokenStorage.js';
import { trackEvent } from '../services/tracking.js';
import FilterPanel from '../components/FilterPanel.jsx';
import BarChartCard from '../components/BarChartCard.jsx';
import LineChartCard from '../components/LineChartCard.jsx';

const dashboardStyles = `
  .dashboard-page {
    min-height: 100vh;
    background: #f8f8fa;
    padding: 24px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color-scheme: light;
    color: #08060d;
  }
  .dashboard-header {
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }
  .dashboard-header h1 {
    font-size: 20px;
    font-weight: 700;
    color: #08060d;
    margin: 0 0 4px 0;
  }
  .dashboard-header p {
    font-size: 14px;
    color: #666;
    margin: 0;
  }
  .dashboard-charts {
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;
    margin-top: 20px;
  }
  @media (min-width: 768px) {
    .dashboard-charts {
      grid-template-columns: 1fr 1fr;
    }
  }
  .dashboard-error {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    color: #d32f2f;
    font-size: 15px;
    text-align: center;
  }
  .dashboard-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 300px;
  }
  .dashboard-spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #e5e4e7;
    border-top: 3px solid #4f8df5;
    border-radius: 50%;
    animation: dash-spin 0.8s linear infinite;
  }
  @keyframes dash-spin {
    to { transform: rotate(360deg); }
  }
`;

function readFiltersFromCookies() {
  const savedFrom = getCookie(COOKIE_KEYS.fromDate);
  const savedTo = getCookie(COOKIE_KEYS.toDate);
  const savedAge = getCookie(COOKIE_KEYS.ageBucketId);
  const savedGender = getCookie(COOKIE_KEYS.genderId);

  return {
    dateRange: {
      fromDate: savedFrom || null,
      toDate: savedTo || null,
    },
    ageBucketId: savedAge ? Number(savedAge) : null,
    genderId: savedGender ? Number(savedGender) : null,
  };
}

export default function DashboardPage() {
  const [filters, setFilters] = useState(readFiltersFromCookies);
  const [bucket, setBucket] = useState('day');
  const { logout } = useAuth();
  const navigateTo = useNavigate();

  const handleLogout = useCallback(async () => {
    await logout();
    navigateTo('/login');
  }, [logout, navigateTo]);

  const {
    config,
    configLoading,
    configError,
    barData,
    lineData,
    selectedFeatureId,
    chartsLoading,
    trendLoading,
    chartsError,
    fetchDashboard,
    fetchTrend,
    setSelectedFeatureId,
  } = useDashboard(filters);

  // Fetch dashboard data once config is loaded
  useEffect(() => {
    if (!config) return;
    const featureId = selectedFeatureId ?? (config.features?.[0]?.id || undefined);
    fetchDashboard({ ...filters, selectedFeatureId: featureId });
  }, [config]);

  const handleDateRangeChange = useCallback((range) => {
    const next = { ...filters, dateRange: range };
    setFilters(next);
    setCookie(COOKIE_KEYS.fromDate, range.fromDate || '');
    setCookie(COOKIE_KEYS.toDate, range.toDate || '');

    // Reset to day bucket if dates are no longer the same day
    const fromDay = range.fromDate ? range.fromDate.slice(0, 10) : null;
    const toDay = range.toDate ? range.toDate.slice(0, 10) : null;
    if (fromDay !== toDay && bucket === 'hour') {
      setBucket('day');
    }

    const featureId = selectedFeatureId ?? undefined;
    fetchDashboard({ ...next, selectedFeatureId: featureId });

    const token = getToken();
    if (token) {
      trackEvent(token, { featureId: 1, eventTypeId: 2 });
    }
  }, [filters, selectedFeatureId, fetchDashboard, bucket]);

  const handleAgeBucketChange = useCallback((id) => {
    const next = { ...filters, ageBucketId: id };
    setFilters(next);
    setCookie(COOKIE_KEYS.ageBucketId, id != null ? String(id) : '');

    const featureId = selectedFeatureId ?? undefined;
    fetchDashboard({ ...next, selectedFeatureId: featureId });

    const token = getToken();
    if (token) {
      trackEvent(token, { featureId: 2, eventTypeId: 3 });
    }
  }, [filters, selectedFeatureId, fetchDashboard]);

  const handleGenderChange = useCallback((id) => {
    const next = { ...filters, genderId: id };
    setFilters(next);
    setCookie(COOKIE_KEYS.genderId, id != null ? String(id) : '');

    const featureId = selectedFeatureId ?? undefined;
    fetchDashboard({ ...next, selectedFeatureId: featureId });

    const token = getToken();
    if (token) {
      trackEvent(token, { featureId: 3, eventTypeId: 3 });
    }
  }, [filters, selectedFeatureId, fetchDashboard]);

  const handleBarClick = useCallback((featureId) => {
    setSelectedFeatureId(featureId);
    fetchDashboard({ ...filters, selectedFeatureId: featureId });
    fetchTrend(featureId, filters, bucket);

    const token = getToken();
    if (token) {
      trackEvent(token, { featureId: 4, eventTypeId: 1 });
    }
  }, [fetchDashboard, fetchTrend, setSelectedFeatureId, filters, bucket]);

  const fromDay = filters.dateRange.fromDate ? filters.dateRange.fromDate.slice(0, 10) : null;
  const toDay = filters.dateRange.toDate ? filters.dateRange.toDate.slice(0, 10) : null;
  const isSameDay = fromDay != null && toDay != null && fromDay === toDay;

  const handleBucketChange = useCallback((newBucket) => {
    setBucket(newBucket);
    if (selectedFeatureId != null) {
      fetchTrend(selectedFeatureId, filters, newBucket);
    }
  }, [selectedFeatureId, filters, fetchTrend]);

  // Full-page error if config fails
  if (configError) {
    return (
      <>
        <style>{dashboardStyles}</style>
        <div className="dashboard-page">
          <div className="dashboard-error" role="alert">
            {configError}
          </div>
        </div>
      </>
    );
  }

  // Loading state while config loads
  if (configLoading) {
    return (
      <>
        <style>{dashboardStyles}</style>
        <div className="dashboard-page">
          <div className="dashboard-loading" role="status" aria-label="Loading dashboard">
            <div className="dashboard-spinner" />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{dashboardStyles}</style>
      <div className="dashboard-page">
        <div className="dashboard-header">
          <div>
            <h1>Frontend</h1>
            <p>Interactive product analytics dashboard</p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              padding: '6px 16px',
              border: '1px solid #e5e4e7',
              borderRadius: '6px',
              background: '#fff',
              cursor: 'pointer',
              fontSize: '13px',
              color: '#08060d',
              fontFamily: 'var(--sans)',
            }}
          >
            Logout
          </button>
        </div>

        <FilterPanel
          dateRange={filters.dateRange}
          ageBucketId={filters.ageBucketId}
          genderId={filters.genderId}
          ageBuckets={config?.ageBuckets ?? []}
          genders={config?.genders ?? []}
          onDateRangeChange={handleDateRangeChange}
          onAgeBucketChange={handleAgeBucketChange}
          onGenderChange={handleGenderChange}
        />

        <div className="dashboard-charts">
          <BarChartCard
            data={barData}
            selectedFeatureId={selectedFeatureId}
            onBarClick={handleBarClick}
            loading={chartsLoading}
            error={chartsError}
          />
          <LineChartCard
            data={lineData}
            loading={chartsLoading || trendLoading}
            error={chartsError}
            bucket={bucket}
            onBucketChange={handleBucketChange}
            hourDisabled={!isSameDay}
          />
        </div>
      </div>
    </>
  );
}
