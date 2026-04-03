import { SERVICE_FILTER_GROUPS } from '../constants/service-types';
import type { FilterGroupKey, ServiceTypeKey } from '../constants/service-types';
import type { ServiceLog } from '../types/service-log';

// Invert SERVICE_FILTER_GROUPS: serviceType → FilterGroupKey
const SERVICE_TYPE_TO_GROUP: Record<string, FilterGroupKey> = {};
for (const [group, types] of Object.entries(SERVICE_FILTER_GROUPS) as [
  FilterGroupKey,
  readonly ServiceTypeKey[],
][]) {
  if (group === 'All') continue;
  for (const type of types) {
    SERVICE_TYPE_TO_GROUP[type] = group;
  }
}

export function getCategoryGroup(serviceType: string): FilterGroupKey {
  return SERVICE_TYPE_TO_GROUP[serviceType] ?? 'General';
}

export function computeByCategory(
  logs: ServiceLog[],
): { group: FilterGroupKey; total: number }[] {
  const acc: Partial<Record<FilterGroupKey, number>> = {};
  for (const log of logs) {
    const group = getCategoryGroup(log.serviceType);
    acc[group] = (acc[group] ?? 0) + parseFloat(log.cost);
  }
  return (Object.entries(acc) as [FilterGroupKey, number][])
    .map(([group, total]) => ({ group, total }))
    .sort((a, b) => b.total - a.total);
}

export function computeByMonth(
  logs: ServiceLog[],
): { month: string; total: number }[] {
  const acc: Record<string, number> = {};
  for (const log of logs) {
    const key = log.date.slice(0, 7); // "YYYY-MM"
    acc[key] = (acc[key] ?? 0) + parseFloat(log.cost);
  }
  return Object.entries(acc)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, total]) => ({ month, total }));
}

export function computeCostPerKm(logs: ServiceLog[], totalSpend: number): number | null {
  if (logs.length < 2) return null;
  let earliest = logs[0], latest = logs[0];
  for (const log of logs) {
    if (log.date < earliest.date) earliest = log;
    if (log.date > latest.date) latest = log;
  }
  const km = latest.mileageAt - earliest.mileageAt;
  if (km <= 0) return null;
  return (totalSpend / km) * 1000;
}

export const MONTH_ABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export function formatDateRangeLabel(from: string, to: string): string {
  const f = new Date(from + 'T00:00:00');
  const t = new Date(to + 'T00:00:00');
  const fStr = MONTH_ABBR[f.getMonth()];
  const tStr = MONTH_ABBR[t.getMonth()];
  if (f.getFullYear() !== t.getFullYear()) {
    return `${fStr} ${f.getFullYear()} – ${tStr} ${t.getFullYear()}`;
  }
  return `${fStr} – ${tStr}`;
}
