import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getConfig, getDashboard, getFeatureTrend } from '../services/analytics.js';
import { getToken, removeToken } from '../utils/tokenStorage.js';

/**
 * @param {Object} initialFilters
 * @param {{ fromDate: string, toDate: string }} initialFilters.dateRange
 * @param {number|null} initialFilters.ageBucketId
 * @param {number|null} initialFilters.genderId
 *
 * @returns {{
 *   config: { features, eventTypes, ageBuckets, genders } | null,
 *   configLoading: boolean,
 *   configError: string | null,
 *   barData: Array<{featureId, featureName, totalCount}>,
 *   lineData: { featureName, points } | null,
 *   selectedFeatureId: number | null,
 *   chartsLoading: boolean,
 *   chartsError: string | null,
 *   fetchDashboard: (filters) => Promise<void>,
 *   fetchTrend: (featureId) => Promise<void>,
 *   setSelectedFeatureId: (id) => void,
 * }}
 */
export function useDashboard(initialFilters) {
  const navigate = useNavigate();

  const [config, setConfig] = useState(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [configError, setConfigError] = useState(null);

  const [barData, setBarData] = useState([]);
  const [lineData, setLineData] = useState(null);
  const [selectedFeatureId, setSelectedFeatureId] = useState(null);
  const [chartsLoading, setChartsLoading] = useState(false);
  const [trendLoading, setTrendLoading] = useState(false);
  const [chartsError, setChartsError] = useState(null);

  function handleAuthError(err) {
    if (err && err.status === 401) {
      removeToken();
      navigate('/login');
      return true;
    }
    return false;
  }

  const fetchDashboard = useCallback(async (filters) => {
    const token = getToken();
    setChartsLoading(true);
    setChartsError(null);
    try {
      const data = await getDashboard(token, {
        fromDate: filters.dateRange.fromDate,
        toDate: filters.dateRange.toDate,
        selectedFeatureId: filters.selectedFeatureId ?? undefined,
        ageBucketId: filters.ageBucketId,
        genderId: filters.genderId,
      });
      setBarData(data.barChart);
      setLineData(data.lineChart);
    } catch (err) {
      if (!handleAuthError(err)) {
        setChartsError(err.message || 'Failed to load dashboard data');
      }
    } finally {
      setChartsLoading(false);
    }
  }, [navigate]);

  const fetchTrend = useCallback(async (featureId, currentFilters) => {
    const token = getToken();
    setTrendLoading(true);
    setChartsError(null);
    try {
      const f = currentFilters || initialFilters;
      const data = await getFeatureTrend(token, {
        featureId,
        fromDate: f.dateRange.fromDate,
        toDate: f.dateRange.toDate,
        bucket: 'day',
        ageBucketId: f.ageBucketId,
        genderId: f.genderId,
      });
      setLineData(data);
    } catch (err) {
      if (!handleAuthError(err)) {
        setChartsError(err.message || 'Failed to load trend data');
      }
    } finally {
      setTrendLoading(false);
    }
  }, [navigate, initialFilters]);

  // Fetch config on mount
  useEffect(() => {
    let cancelled = false;
    async function loadConfig() {
      const token = getToken();
      setConfigLoading(true);
      setConfigError(null);
      try {
        const data = await getConfig(token);
        if (cancelled) return;
        setConfig(data);
        // Default selectedFeatureId to first feature
        if (data.features && data.features.length > 0) {
          setSelectedFeatureId(data.features[0].id);
        }
      } catch (err) {
        if (cancelled) return;
        if (!handleAuthError(err)) {
          setConfigError(err.message || 'Failed to load configuration');
        }
      } finally {
        if (!cancelled) {
          setConfigLoading(false);
        }
      }
    }
    loadConfig();
    return () => { cancelled = true; };
  }, []);

  return {
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
  };
}
