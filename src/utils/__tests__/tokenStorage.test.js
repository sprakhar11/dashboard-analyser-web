/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getToken, setToken, removeToken } from '../tokenStorage';

// Node 25+ has a built-in localStorage that overrides jsdom's.
// Provide a proper Storage mock for tests.
const store = {};
const storageMock = {
  getItem: vi.fn((key) => store[key] ?? null),
  setItem: vi.fn((key, value) => { store[key] = String(value); }),
  removeItem: vi.fn((key) => { delete store[key]; }),
  clear: vi.fn(() => { Object.keys(store).forEach((k) => delete store[k]); }),
};

Object.defineProperty(globalThis, 'localStorage', {
  value: storageMock,
  writable: true,
  configurable: true,
});

describe('tokenStorage', () => {
  beforeEach(() => {
    Object.keys(store).forEach((k) => delete store[k]);
    vi.clearAllMocks();
  });

  it('setToken / getToken round trip', () => {
    setToken('my-test-token');
    expect(getToken()).toBe('my-test-token');
    expect(storageMock.setItem).toHaveBeenCalledWith('auth_token', 'my-test-token');
  });

  it('removeToken clears the token', () => {
    setToken('token-to-remove');
    removeToken();
    expect(getToken()).toBeNull();
    expect(storageMock.removeItem).toHaveBeenCalledWith('auth_token');
  });

  it('getToken returns null when no token stored', () => {
    expect(getToken()).toBeNull();
  });
});
