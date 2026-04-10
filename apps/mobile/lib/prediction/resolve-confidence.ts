import type { ConfidenceLevel } from '../../components/prediction/confidence-badge';

interface Input {
  daysOfRidingData: number;
  priorServicesForCategory: number;
}

/**
 * Decides the confidence level of a prediction from data quality alone.
 * Rules (see docs/research/reference-app-patterns.md §6.3):
 * - unknown: no prior services for this category
 * - low:     <30 days of riding data
 * - medium:  30-59 days of data OR 1-2 prior services
 * - high:    60+ days of data AND 3+ prior services
 */
export function resolveConfidence({
  daysOfRidingData,
  priorServicesForCategory,
}: Input): ConfidenceLevel {
  if (priorServicesForCategory === 0) return 'unknown';
  if (daysOfRidingData < 30) return 'low';
  if (daysOfRidingData >= 60 && priorServicesForCategory >= 3) return 'high';
  return 'medium';
}
