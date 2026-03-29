const BASE_URL = import.meta.env.VITE_BASE_URL;

/**
 * Validates that the ping response has the expected shape.
 * @param {any} data
 * @returns {boolean}
 */
function isValidPingResponse(data) {
  return (
    data != null &&
    typeof data.appName === 'string' &&
    typeof data.appVersion === 'string' &&
    typeof data.timestamp === 'string' &&
    typeof data.databaseStatus === 'string'
  );
}

/**
 * @returns {Promise<{ appName: string, appVersion: string, timestamp: string, databaseStatus: string }>}
 * @throws {Error} on network failure, non-2xx response, or unexpected response shape
 */
export async function ping() {
  const response = await fetch(`${BASE_URL}/api/ping`);
  if (!response.ok) {
    throw new Error(`Ping failed: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  if (!isValidPingResponse(data)) {
    throw new Error('Unexpected response from ping endpoint');
  }
  return data;
}
