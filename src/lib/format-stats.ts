/**
 * Format utilities for token counts, durations, and costs
 */

export function formatTokens(count: number): string {
  if (count < 1000) {
    return `${count} token${count === 1 ? '' : 's'}`;
  }
  const k = count / 1000;
  // If it's a whole number (e.g. 1.0k), we could show 1k, but .toFixed(1) matches "1.2k tokens".
  return `${k.toFixed(1).replace(/\.0$/, '')}k tokens`;
}

export function formatDuration(ms: number): string {
  if (ms < 0) ms = 0;
  if (ms < 60000) {
    const s = ms / 1000;
    return `${s.toFixed(1)}s`;
  }
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

export function formatCost(cents: number): string {
  const dollars = cents / 100;
  if (dollars === 0) return '$0.00';
  
  // Format with 3 decimal places to support precision (e.g., $0.042)
  // If the cost is less than 0.001 dollars (0.1 cents), we can show more decimals.
  if (dollars > 0 && dollars < 0.001) {
    return `$${dollars.toFixed(4)}`;
  }
  return `$${dollars.toFixed(3)}`;
}
