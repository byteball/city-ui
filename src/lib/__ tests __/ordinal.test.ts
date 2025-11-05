import { describe, expect, it } from 'vitest';
import { toOrdinal } from '../toOrdinal';

describe('toOrdinal', () => {
  it('returns correct suffixes for 1,2,3,4', () => {
    expect(toOrdinal(1)).toBe('1st');
    expect(toOrdinal(2)).toBe('2nd');
    expect(toOrdinal(3)).toBe('3rd');
    expect(toOrdinal(4)).toBe('4th');
  });

  it('handles teens (11-13) correctly', () => {
    expect(toOrdinal(11)).toBe('11th');
    expect(toOrdinal(12)).toBe('12th');
    expect(toOrdinal(13)).toBe('13th');
  });

  it('handles numbers beyond 20 correctly', () => {
    expect(toOrdinal(21)).toBe('21st');
    expect(toOrdinal(22)).toBe('22nd');
    expect(toOrdinal(23)).toBe('23rd');
    expect(toOrdinal(24)).toBe('24th');
    expect(toOrdinal(101)).toBe('101st');
    expect(toOrdinal(111)).toBe('111th');
  });

  it('handles zero and negatives', () => {
    expect(toOrdinal(0)).toBe('0th');
    expect(toOrdinal(-1)).toBe('-1st');
    expect(toOrdinal(-2)).toBe('-2nd');
    expect(toOrdinal(-11)).toBe('-11th');
  });

  it('handles non-integer numbers by flooring', () => {
    expect(toOrdinal(1.7)).toBe('1st');
    expect(toOrdinal(-2.3)).toBe('-2nd');
  });
});