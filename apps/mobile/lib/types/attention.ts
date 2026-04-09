export type AttentionStatus = 'overdue' | 'approaching' | 'ok';

export interface MaintenanceAttentionItem {
  category: 'maintenance';
  key: string;
  label: string;
  status: AttentionStatus;
  severity: number;
  lastMileage: number | null;
  lastDate: string | null;
  currentMileage: number;
  intervalKm: number | null;
  intervalMonths: number | null;
  deltaKm: number | null;
  deltaMonths: number | null;
}

export type ComplianceField =
  | 'coeExpiry'
  | 'roadTaxExpiry'
  | 'insuranceExpiry'
  | 'inspectionDue';

export interface ComplianceAttentionItem {
  category: 'compliance';
  key: ComplianceField;
  label: string;
  status: AttentionStatus;
  severity: number;
  expiresAt: string;
  daysRemaining: number;
}

export type AttentionItem = MaintenanceAttentionItem | ComplianceAttentionItem;

export interface AttentionSummary {
  total: number;
  needsAttention: number;
  overdue: number;
  approaching: number;
  ok: number;
}

export interface AttentionResponse {
  bike: { id: string; model: string; currentMileage: number };
  summary: AttentionSummary;
  items: AttentionItem[];
}
