import { describe, expect, it } from 'vitest';
import { resolveConfidence } from '../resolve-confidence';

describe('resolveConfidence', () => {
  it('returns unknown when no service history exists', () => {
    expect(
      resolveConfidence({ daysOfRidingData: 200, priorServicesForCategory: 0 }),
    ).toBe('unknown');
  });

  it('returns low when less than 30 days of riding data', () => {
    expect(
      resolveConfidence({ daysOfRidingData: 18, priorServicesForCategory: 1 }),
    ).toBe('low');
  });

  it('returns medium with 30-60 days OR 1-2 prior services', () => {
    expect(
      resolveConfidence({ daysOfRidingData: 42, priorServicesForCategory: 1 }),
    ).toBe('medium');
    expect(
      resolveConfidence({ daysOfRidingData: 65, priorServicesForCategory: 2 }),
    ).toBe('medium');
  });

  it('returns high with 60+ days and 3+ prior services', () => {
    expect(
      resolveConfidence({ daysOfRidingData: 90, priorServicesForCategory: 3 }),
    ).toBe('high');
  });

  it('caps at medium if only one criterion is high', () => {
    expect(
      resolveConfidence({ daysOfRidingData: 90, priorServicesForCategory: 1 }),
    ).toBe('medium');
  });
});
