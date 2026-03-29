/** Cookie keys for dashboard filter persistence */
export const COOKIE_KEYS = {
  fromDate: 'dashboard_fromDate',
  toDate: 'dashboard_toDate',
  ageBucketId: 'dashboard_ageBucketId',
  genderId: 'dashboard_genderId',
};

/**
 * Set a cookie with the given name, value, and expiry.
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {number} [days=30] - Expiry in days
 */
export function setCookie(name, value, days = 30) {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)};${expires};path=/`;
}

/**
 * Get a cookie value by name.
 * @param {string} name - Cookie name
 * @returns {string|null}
 */
export function getCookie(name) {
  const encoded = encodeURIComponent(name) + '=';
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const trimmed = cookie.trim();
    if (trimmed.startsWith(encoded)) {
      return decodeURIComponent(trimmed.substring(encoded.length));
    }
  }
  return null;
}

/**
 * Remove a cookie by name.
 * @param {string} name - Cookie name
 */
export function removeCookie(name) {
  document.cookie = `${encodeURIComponent(name)}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
}
