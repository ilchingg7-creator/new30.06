import { describe, expect, it } from 'vitest';
import { formatCredits, formatDuration, formatRate } from '../game/format';

describe('format helpers', () => {
  it('formats compact credit values', () => {
    expect(formatCredits(950)).toBe('950');
    expect(formatCredits(12_400)).toBe('12.4K');
    expect(formatCredits(8_100_000)).toBe('8.1M');
  });

  it('formats income rates', () => {
    expect(formatRate(12.34)).toBe('12.3/сек');
    expect(formatRate(12.34, '/sec')).toBe('12.3/sec');
  });

  it('formats durations as hours and minutes', () => {
    expect(formatDuration(59)).toBe('59с');
    expect(formatDuration(3_660)).toBe('1ч 1м');
  });
});
