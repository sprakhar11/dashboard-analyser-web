const BROWSER_ID_KEY = 'browser_id';

/**
 * Returns the existing browser ID from localStorage, or generates a new UUID and stores it.
 * @returns {string} UUID string
 */
export function getBrowserId() {
  const existing = localStorage.getItem(BROWSER_ID_KEY);
  if (existing) {
    return existing;
  }
  const id = crypto.randomUUID();
  localStorage.setItem(BROWSER_ID_KEY, id);
  return id;
}
