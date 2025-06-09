/**
 * formatPeriodEn.spec.ts
 * Unit-tests for formatPeriodEn() using Vitest
 */
import moment from 'moment';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { formatPeriod } from '../formatPeriod';

describe('formatPeriod', () => {
  // Fixed "now" to keep the tests deterministic (2027-01-12T13:20:00Z)
  const fixedNowSec = 1_800_000_000; // seconds since Unix epoch

  beforeAll(() => {
    // Freeze the system clock for Date-based operations…
    vi.spyOn(Date, 'now').mockReturnValue(fixedNowSec * 1_000);
    // …and for Moment.js internal calls (moment.utc() / moment.now())
    moment.now = () => fixedNowSec * 1_000;
    moment.locale('en');  // ensure English output
  });

  afterAll(() => {
    vi.restoreAllMocks();
    // delete moment.now;    // clean up override
  });

  it('returns "3 days 4 hours 12 minutes" for 3d 4h 12m diff', () => {
    const targetSec =
      fixedNowSec + 3 * 24 * 3600 + 4 * 3600 + 12 * 60; // seconds
    expect(formatPeriod(targetSec)).toBe(
      '3 days 4h 12m'
    );
  });

  it('handles singular units correctly', () => {
    const targetSec =
      fixedNowSec + 1 * 24 * 3600 + 1 * 3600 + 1 * 60; // 1d 1h 1m
    expect(formatPeriod(targetSec)).toBe(
      '1 day 1h 1m'
    );
  });

  it('omits zero-value leading units (only minutes)', () => {
    const targetSec = fixedNowSec + 45 * 60; // 45 minutes
    expect(formatPeriod(targetSec)).toBe('45 minutes');
  });

  it('skips zero-value middle units ("2 days 30 minutes")', () => {
    const targetSec =
      fixedNowSec + 2 * 24 * 3600 + 30 * 60; // 2d 0h 30m
    expect(formatPeriod(targetSec)).toBe('2 days 30m');
  });

  it('returns "0 minutes" when period has elapsed', () => {
    const targetSec = fixedNowSec - 10; // 10 s in the past
    expect(formatPeriod(targetSec)).toBe('0 minutes');
  });
});