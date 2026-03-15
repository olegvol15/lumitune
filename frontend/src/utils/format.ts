/** Formats seconds as M:SS — used for track durations and progress bars */
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** Formats seconds as "X год. Y хв." — used for podcast/audiobook durations */
export function formatLongDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours} год. ${minutes} хв.`;
}

/** Formats a play count with K/M/B abbreviations */
export function formatPlayCount(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

/** Formats a listener count with Ukrainian locale thousands separator */
export function formatListeners(count: number): string {
  return count.toLocaleString('uk-UA');
}
