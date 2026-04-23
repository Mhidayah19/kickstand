const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatComplianceDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return `${d.getDate()} ${MONTHS[d.getMonth()].toUpperCase()} ${d.getFullYear()}`;
}

export function formatLogDate(dateStr: string): string {
  const [, monthStr, day] = dateStr.split('-');
  return `${parseInt(day)} ${MONTHS[parseInt(monthStr) - 1]}`;
}

/** Format a future day count as a tiered compact duration.
 *  > 1 year  → "3y 5m"   (day precision is noise)
 *  > 1 month → "5m"      (day precision is noise)
 *  ≤ 30 days → "29d"     (urgent — show exact days)
 */
export function formatCountdown(days: number): string {
  if (days > 365) {
    const y = Math.floor(days / 365);
    const m = Math.floor((days % 365) / 30);
    return m > 0 ? `${y}y ${m}m` : `${y}y`;
  }
  if (days > 30) {
    return `${Math.floor(days / 30)}m`;
  }
  return `${days}d`;
}

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
