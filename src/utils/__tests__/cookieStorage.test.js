/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { setCookie, getCookie, removeCookie, COOKIE_KEYS } from '../cookieStorage';

describe('cookieStorage', () => {
  beforeEach(() => {
    // Clear all cookies before each test
    document.cookie.split(';').forEach((c) => {
      const name = c.split('=')[0].trim();
      if (name) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      }
    });
  });

  describe('setCookie / getCookie round-trip', () => {
    it('stores and retrieves a simple value', () => {
      setCookie('testKey', 'testValue');
      expect(getCookie('testKey')).toBe('testValue');
    });

    it('stores and retrieves a date string', () => {
      setCookie(COOKIE_KEYS.fromDate, '2025-01-15');
      expect(getCookie(COOKIE_KEYS.fromDate)).toBe('2025-01-15');
    });

    it('stores and retrieves a numeric string', () => {
      setCookie(COOKIE_KEYS.ageBucketId, '3');
      expect(getCookie(COOKIE_KEYS.ageBucketId)).toBe('3');
    });

    it('stores and retrieves an empty string', () => {
      setCookie(COOKIE_KEYS.genderId, '');
      expect(getCookie(COOKIE_KEYS.genderId)).toBe('');
    });

    it('handles special characters in values', () => {
      setCookie('special', 'hello world & foo=bar;baz');
      expect(getCookie('special')).toBe('hello world & foo=bar;baz');
    });
  });

  describe('getCookie', () => {
    it('returns null for a non-existent cookie', () => {
      expect(getCookie('nonExistent')).toBeNull();
    });

    it('returns the correct value when multiple cookies exist', () => {
      setCookie('first', 'aaa');
      setCookie('second', 'bbb');
      setCookie('third', 'ccc');
      expect(getCookie('second')).toBe('bbb');
    });
  });

  describe('removeCookie', () => {
    it('removes an existing cookie', () => {
      setCookie('toRemove', 'value');
      expect(getCookie('toRemove')).toBe('value');
      removeCookie('toRemove');
      expect(getCookie('toRemove')).toBeNull();
    });

    it('does not throw when removing a non-existent cookie', () => {
      expect(() => removeCookie('doesNotExist')).not.toThrow();
    });
  });

  describe('COOKIE_KEYS', () => {
    it('defines all expected filter keys', () => {
      expect(COOKIE_KEYS.fromDate).toBe('dashboard_fromDate');
      expect(COOKIE_KEYS.toDate).toBe('dashboard_toDate');
      expect(COOKIE_KEYS.ageBucketId).toBe('dashboard_ageBucketId');
      expect(COOKIE_KEYS.genderId).toBe('dashboard_genderId');
    });
  });
});
