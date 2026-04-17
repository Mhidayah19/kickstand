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
