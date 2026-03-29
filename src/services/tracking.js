const BASE_URL = import.meta.env.VITE_BASE_URL;

/**
 * Sends a fire-and-forget tracking event to POST /api/track.
 * Silently swallows all errors — never blocks UI or surfaces failures.
 *
 * @param {string} token - Auth token
 * @param {{ featureId: number, eventTypeId: number, metaInfo?: object }} params
 * @returns {Promise<void>}
 */
export async function trackEvent(token, { featureId, eventTypeId, metaInfo }) {
  try {
    const body = {
      featureId,
      eventTypeId,
      eventTime: new Date().toISOString(),
    };
    if (metaInfo !== undefined) {
      body.metaInfo = metaInfo;
    }
    await fetch(`${BASE_URL}/api/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': token,
      },
      body: JSON.stringify(body),
    });
  } catch {
    // fire-and-forget: silently ignore all errors
  }
}
