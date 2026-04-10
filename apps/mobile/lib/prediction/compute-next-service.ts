import type { ConfidenceLevel } from '../../components/prediction/confidence-badge';
import { resolveConfidence } from './resolve-confidence';

interface ComputeInput {
  currentMileage: number;
  lastServiceMileage: number | null;
  lastServiceDate: Date | null;
  /** Manufacturer default interval in km. Defaults to 6000 for most bikes. */
  intervalKm?: number;
  /** Manufacturer default interval in days. Defaults to 180 (~6 months). */
  intervalDays?: number;
}

interface ComputeResult {
  /** Km until next service, capped at 0. */
  kmUntil: number;
  /** Days until next service, capped at 0. */
  daysUntil: number;
  /** Confidence level based on data quality. */
  confidence: ConfidenceLevel;
  /** Whichever trigger is tighter, for headline display. */
  headline: {
    value: string;
    unit: string;
    supporting: string;
  };
}

/**
 * V1 heuristic — simple km + time intervals. No learned pace.
 * Returns 'high' confidence only when both prior service data and
 * recent riding data are present. Designed to degrade gracefully.
 *
 * Future: replace with a real prediction engine that uses riding
 * intensity, historical service timing, and per-user calibration.
 */
export function computeNextService({
  currentMileage,
  lastServiceMileage,
  lastServiceDate,
  intervalKm = 6000,
  intervalDays = 180,
}: ComputeInput): ComputeResult {
  const hasServiceHistory = lastServiceMileage !== null && lastServiceDate !== null;

  // km calculation
  const baseMileage = lastServiceMileage ?? 0;
  const nextAtKm = baseMileage + intervalKm;
  const kmUntil = Math.max(0, nextAtKm - currentMileage);

  // days calculation
  let daysUntil = intervalDays;
  if (lastServiceDate) {
    const elapsedMs = Date.now() - lastServiceDate.getTime();
    const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
    daysUntil = Math.max(0, intervalDays - elapsedDays);
  }

  const confidence = resolveConfidence({
    daysOfRidingData: lastServiceDate
      ? Math.floor((Date.now() - lastServiceDate.getTime()) / (1000 * 60 * 60 * 24))
      : 0,
    priorServicesForCategory: hasServiceHistory ? 1 : 0, // v1 approximation
  });

  // headline: whichever trigger is tighter
  // rough km/day based on manufacturer interval — 6000km / 180 days ≈ 33 km/day
  const kmPerDay = intervalKm / intervalDays;
  const kmFromDays = daysUntil * kmPerDay;

  let headline: ComputeResult['headline'];
  if (kmUntil <= kmFromDays) {
    headline = {
      value: kmUntil.toLocaleString('en-US'),
      unit: 'KM',
      supporting: `or ${daysUntil} days — whichever comes first`,
    };
  } else {
    headline = {
      value: daysUntil.toString(),
      unit: 'DAYS',
      supporting: `or ${kmUntil.toLocaleString('en-US')} km — whichever comes first`,
    };
  }

  return { kmUntil, daysUntil, confidence, headline };
}
