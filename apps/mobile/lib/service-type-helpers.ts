import type { ServiceLog } from './types/service-log';
import type { ServiceTypeKey } from './constants/service-types';
import {
  SERVICE_TYPE_GROUPS,
  SERVICE_TYPE_KEYS,
  SERVICE_TYPE_LABELS,
} from './constants/service-types';

export interface FrequentType {
  key: ServiceTypeKey;
  count: number;
}

export function getFrequentServiceTypes(
  logs: ServiceLog[],
  maxCount: number,
): FrequentType[] {
  const knownKeys = new Set<string>(SERVICE_TYPE_KEYS);
  const counts = new Map<ServiceTypeKey, { count: number; latestDate: string }>();

  for (const log of logs) {
    if (!knownKeys.has(log.serviceType)) continue;
    const key = log.serviceType as ServiceTypeKey;
    const entry = counts.get(key);
    if (!entry) {
      counts.set(key, { count: 1, latestDate: log.date });
    } else {
      entry.count += 1;
      if (log.date > entry.latestDate) entry.latestDate = log.date;
    }
  }

  return Array.from(counts.entries())
    .map(([key, { count, latestDate }]) => ({ key, count, latestDate }))
    .sort((a, b) => b.count - a.count || b.latestDate.localeCompare(a.latestDate))
    .slice(0, maxCount)
    .map(({ key, count }) => ({ key, count }));
}

export function filterServiceTypes(
  query: string,
): { label: string; keys: ServiceTypeKey[] }[] {
  const q = query.trim().toLowerCase();
  if (!q) return SERVICE_TYPE_GROUPS;

  return SERVICE_TYPE_GROUPS
    .map((group) => ({
      label: group.label,
      keys: group.keys.filter((key) =>
        SERVICE_TYPE_LABELS[key].toLowerCase().includes(q),
      ),
    }))
    .filter((group) => group.keys.length > 0);
}
