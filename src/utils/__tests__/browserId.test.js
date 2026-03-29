/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getBrowserId } from '../browserId';

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

describe('getBrowserId', () => {
  beforeEach(() => {
    Object.keys(store).forEach((k) => delete store[k]);
    vi.clearAllMocks();
  });

  it('generates and stores a UUID when none exists', () => {
    const id = getBrowserId();
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );
    expect(storageMock.setItem).toHaveBeenCalledWith('browser_id', id);
    expect(store['browser_id']).toBe(id);
  });

  it('returns the existing UUID when one exists', () => {
    const existing = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
    store['browser_id'] = existing;
    expect(getBrowserId()).toBe(existing);
    expect(storageMock.setItem).not.toHaveBeenCalled();
  });

  it('returns the same value on consecutive calls', () => {
    const first = getBrowserId();
    const second = getBrowserId();
    expect(first).toBe(second);
  });
});
