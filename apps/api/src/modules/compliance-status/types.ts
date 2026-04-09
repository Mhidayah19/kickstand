export type ComplianceStatus = 'overdue' | 'approaching' | 'ok';

export type ComplianceField =
  | 'coeExpiry'
  | 'roadTaxExpiry'
  | 'insuranceExpiry'
  | 'inspectionDue';

export interface ComplianceStatusItem {
  key: ComplianceField; // stable identifier for routing
  label: string; // "COE" / "Road Tax" / "Insurance" / "Inspection"
  status: ComplianceStatus;
  severity: number;
  expiresAt: string; // ISO date
  daysRemaining: number; // negative = overdue
}
