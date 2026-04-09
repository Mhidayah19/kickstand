import type { MaintenanceStatusItem } from '../maintenance-status/types';
import type { ComplianceStatusItem } from '../compliance-status/types';

export interface AttentionSummary {
  total: number;
  needsAttention: number;
  overdue: number;
  approaching: number;
  ok: number;
}

export type AttentionItem =
  | ({ category: 'maintenance' } & MaintenanceStatusItem)
  | ({ category: 'compliance' } & ComplianceStatusItem);

export interface AttentionResponse {
  bike: {
    id: string;
    model: string;
    currentMileage: number;
  };
  summary: AttentionSummary;
  items: AttentionItem[];
}
