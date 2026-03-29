/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { setCookie, getCookie, COOKIE_KEYS } from '../cookieStorage';

/**
 * Feature: product-analytics-dashboard, Property 4: Cookie filter round-trip
 * Validates: Requirements 7.1
 *
 * For any valid filter state (fromDate as YYYY-MM-DD string, toDate as YYYY-MM-DD string,
 * ageBucketId as number or null, genderId as number or null), saving the filter state to
 * cookies via setCookie and then reading it back via getCookie should produce the original values.
 */

/** Arbitrary that generates a valid YYYY-MM-DD date string */
const dateStringArb = fc
  .integer({ min: 0, max: 4102444800000 }) // 0 = 1970-01-01, max ≈ 2099-12-31 in ms
  .map((ms) => new Date(ms).toISOString().slice(0, 10));

/** Arbitrary that generates a positive integer or null (for ageBucketId / genderId) */
const nullableIdArb = fc.oneof(
  fc.constant(null),
  fc.integer({ min: 1, max: 10000 })
);

function clearAllCookies() {
  document.cookie.split(';').forEach((c) => {
    const name = c.split('=')[0].trim();
    if (name) {
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    }
  });
}

describe('cookieStorage - Property Tests', () => {
  beforeEach(() => {
    clearAllCookies();
  });

  it('round-trips any valid filter state through setCookie / getCookie', () => {
    fc.assert(
      fc.property(
        dateStringArb,
        dateStringArb,
        nullableIdArb,
        nullableIdArb,
        (fromDate, toDate, ageBucketId, genderId) => {
          // Save filter state to cookies
          setCookie(COOKIE_KEYS.fromDate, fromDate);
          setCookie(COOKIE_KEYS.toDate, toDate);
          setCookie(COOKIE_KEYS.ageBucketId, ageBucketId != null ? String(ageBucketId) : '');
          setCookie(COOKIE_KEYS.genderId, genderId != null ? String(genderId) : '');

          // Read back and assert equality
          expect(getCookie(COOKIE_KEYS.fromDate)).toBe(fromDate);
          expect(getCookie(COOKIE_KEYS.toDate)).toBe(toDate);

          const storedAge = getCookie(COOKIE_KEYS.ageBucketId);
          if (ageBucketId != null) {
            expect(storedAge).toBe(String(ageBucketId));
          } else {
            expect(storedAge).toBe('');
          }

          const storedGender = getCookie(COOKIE_KEYS.genderId);
          if (genderId != null) {
            expect(storedGender).toBe(String(genderId));
          } else {
            expect(storedGender).toBe('');
          }

          // Clean up for next iteration
          clearAllCookies();
        }
      ),
      { numRuns: 100 }
    );
  });
});
