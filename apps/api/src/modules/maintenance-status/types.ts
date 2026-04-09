// apps/api/src/modules/maintenance-status/types.ts
export type MaintenanceStatus = 'overdue' | 'approaching' | 'ok';

export interface MaintenanceStatusItem {
  key: string; // serviceType key, e.g. "oil_change"
  label: string; // human readable ("Oil Change")
  status: MaintenanceStatus;
  severity: number; // lower = more urgent; used for sorting
  lastMileage: number | null;
  lastDate: string | null; // ISO date
  currentMileage: number;
  intervalKm: number | null;
  intervalMonths: number | null;
  deltaKm: number | null; // negative = over interval, positive = km remaining, null if time-only
  deltaMonths: number | null; // negative = over interval, positive = months remaining, null if km-only
}
