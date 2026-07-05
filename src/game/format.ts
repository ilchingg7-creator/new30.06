function trimFixed(value: number, digits: number): string {
  return value.toFixed(digits).replace(/\.0$/, '');
}

export function formatCredits(value: number): string {
  if (value >= 1_000_000_000) {
    return `${trimFixed(value / 1_000_000_000, 1)}B`;
  }

  if (value >= 1_000_000) {
    return `${trimFixed(value / 1_000_000, 1)}M`;
  }

  if (value >= 1_000) {
    return `${trimFixed(value / 1_000, 1)}K`;
  }

  return Math.floor(value).toString();
}

export function formatRate(value: number, suffix: string = '/сек'): string {
  return `${trimFixed(value, 1)}${suffix}`;
}

export interface DurationSuffixes {
  hours?: string;
  minutes?: string;
  seconds?: string;
}

export function formatDuration(seconds: number, suffixes: DurationSuffixes = {}): string {
  const wholeSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(wholeSeconds / 3_600);
  const minutes = Math.floor((wholeSeconds % 3_600) / 60);
  const hoursSuffix = suffixes.hours ?? 'ч';
  const minutesSuffix = suffixes.minutes ?? 'м';
  const secondsSuffix = suffixes.seconds ?? 'с';

  if (hours > 0) {
    return `${hours}${hoursSuffix} ${minutes}${minutesSuffix}`;
  }

  if (minutes > 0) {
    return `${minutes}${minutesSuffix}`;
  }

  return `${wholeSeconds}${secondsSuffix}`;
}
