const AUTH_BASE_URL = import.meta.env.VITE_AUTH_BASE_URL;

async function handleResponse(response) {
  if (!response.ok) {
    const body = await response.json();
    const err = new Error(body.message);
    err.code = body.error;
    err.status = response.status;
    throw err;
  }
  return response.json();
}

/**
 * @param {string} name
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ userId: number, email: string, message: string }>}
 */
export async function register(name, email, password) {
  const response = await fetch(`${AUTH_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  return handleResponse(response);
}

/**
 * @param {string} email
 * @param {string} password
 * @param {string} browserId
 * @returns {Promise<{ userId: number, email: string, token: string, expiryDate: string, sameBrowserReuse: boolean }>}
 */
export async function login(email, password, browserId) {
  const response = await fetch(`${AUTH_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, browserId }),
  });
  return handleResponse(response);
}

/**
 * @param {string} token
 * @returns {Promise<{ userId: number, name: string, email: string }>}
 */
export async function getProfile(token) {
  const response = await fetch(`${AUTH_BASE_URL}/api/auth/me`, {
    headers: { 'auth-token': token },
  });
  return handleResponse(response);
}

/**
 * @param {string} token
 * @returns {Promise<{ message: string }>}
 */
export async function logout(token) {
  const response = await fetch(`${AUTH_BASE_URL}/api/auth/logout`, {
    method: 'POST',
    headers: { 'auth-token': token },
  });
  return handleResponse(response);
}
