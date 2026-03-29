const BASE_URL = import.meta.env.VITE_BASE_URL;

/**
 * Handles non-OK responses by parsing the error body and throwing
 * a structured error with `status` and `code` properties.
 */
async function handleErrorResponse(response) {
  let body;
  try {
    body = await response.json();
  } catch {
    const err = new Error(`Request failed: ${response.status} ${response.statusText}`);
    err.status = response.status;
    err.code = 'UNKNOWN_ERROR';
    throw err;
  }
  const err = new Error(body.message || `Request failed: ${response.status}`);
  err.status = response.status;
  err.code = body.error || 'UNKNOWN_ERROR';
  throw err;
}

/**
 * Validates that config response has the expected shape.
 */
function isValidConfigResponse(data) {
  return (
    data != null &&
    Array.isArray(data.features) &&
    Array.isArray(data.eventTypes) &&
    Array.isArray(data.ageBuckets) &&
    Array.isArray(data.genders)
  );
}

/**
 * Validates that dashboard response has the expected shape.
 */
function isValidDashboardResponse(data) {
  return (
    data != null &&
    data.summary != null &&
    Array.isArray(data.barChart) &&
    data.lineChart != null
  );
}

/**
 * Validates that trend response has the expected shape.
 */
function isValidTrendResponse(data) {
  return (
    data != null &&
    typeof data.featureId === 'number' &&
    typeof data.featureName === 'string' &&
    typeof data.bucket === 'string' &&
    Array.isArray(data.points)
  );
}

/**
 * Fetches analytics configuration (features, event types, age buckets, genders).
 * @param {string} token
 * @returns {Promise<{features: Array, eventTypes: Array, ageBuckets: Array, genders: Array}>}
 */
export async function getConfig(token) {
  const response = await fetch(`${BASE_URL}/api/analytics/config`, {
    headers: { 'auth-token': token },
  });
  if (!response.ok) {
    await handleErrorResponse(response);
  }
  const json = await response.json();
  const data = json.success && json.data ? json.data : json;
  if (!isValidConfigResponse(data)) {
    throw new Error('Unexpected response from analytics config endpoint');
  }
  return data;
}

/**
 * Fetches dashboard data (bar chart + line chart) with filter params.
 * @param {string} token
 * @param {{ fromDate: string, toDate: string, selectedFeatureId?: number, ageBucketId?: number, genderId?: number }} params
 * @returns {Promise<{summary: object, barChart: Array, lineChart: object}>}
 */
export async function getDashboard(token, params) {
  const query = new URLSearchParams();
  if (params.fromDate) query.set('fromDate', params.fromDate);
  if (params.toDate) query.set('toDate', params.toDate);
  if (params.selectedFeatureId != null) query.set('selectedFeatureId', String(params.selectedFeatureId));
  if (params.ageBucketId != null) query.set('ageBucketId', String(params.ageBucketId));
  if (params.genderId != null) query.set('genderId', String(params.genderId));

  const response = await fetch(`${BASE_URL}/api/analytics/dashboard?${query.toString()}`, {
    headers: { 'auth-token': token },
  });
  if (!response.ok) {
    await handleErrorResponse(response);
  }
  const json = await response.json();
  const data = json.success && json.data ? json.data : json;
  if (!isValidDashboardResponse(data)) {
    throw new Error('Unexpected response from analytics dashboard endpoint');
  }
  return data;
}

/**
 * Fetches trend data for a specific feature.
 * @param {string} token
 * @param {{ featureId: number, fromDate?: string, toDate?: string, bucket?: string, ageBucketId?: number, genderId?: number }} params
 * @returns {Promise<{featureId: number, featureName: string, bucket: string, points: Array}>}
 */
export async function getFeatureTrend(token, params) {
  const { featureId, ...rest } = params;
  const query = new URLSearchParams();
  if (rest.fromDate) query.set('fromDate', rest.fromDate);
  if (rest.toDate) query.set('toDate', rest.toDate);
  if (rest.bucket) query.set('bucket', rest.bucket);
  if (rest.ageBucketId != null) query.set('ageBucketId', String(rest.ageBucketId));
  if (rest.genderId != null) query.set('genderId', String(rest.genderId));

  const response = await fetch(`${BASE_URL}/api/analytics/features/${featureId}/trend?${query.toString()}`, {
    headers: { 'auth-token': token },
  });
  if (!response.ok) {
    await handleErrorResponse(response);
  }
  const json = await response.json();
  const data = json.success && json.data ? json.data : json;
  if (!isValidTrendResponse(data)) {
    throw new Error('Unexpected response from analytics trend endpoint');
  }
  return data;
}
