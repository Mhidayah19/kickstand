/** Format a number of days into a compact relative string. */
export function formatDaysAgo(days: number): string {
  if (days === 0) return 'Today';
  if (days < 60) return `${days}d ago`;
  return `${Math.round(days / 30)}mo ago`;
}

/** Compute the number of whole days between an ISO date and now. */
export function daysAgo(dateIso: string): number {
  const delta = Date.now() - new Date(dateIso).getTime();
  return Math.max(0, Math.floor(delta / (1000 * 60 * 60 * 24)));
}
