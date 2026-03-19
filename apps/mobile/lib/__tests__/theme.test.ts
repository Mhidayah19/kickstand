import { getComplianceVariant, daysUntil } from '../theme';

describe('getComplianceVariant', () => {
  it('returns expired for negative days', () => expect(getComplianceVariant(-1)).toBe('expired'));
  it('returns expired for 0 days', () => expect(getComplianceVariant(0)).toBe('expired'));
  it('returns danger for 1-7 days', () => expect(getComplianceVariant(7)).toBe('danger'));
  it('returns warning for 8-30 days', () => expect(getComplianceVariant(14)).toBe('warning'));
  it('returns neutral for >30 days', () => expect(getComplianceVariant(31)).toBe('neutral'));
  it('returns neutral for null', () => expect(getComplianceVariant(null)).toBe('neutral'));
});

describe('daysUntil', () => {
  it('returns null for null input', () => expect(daysUntil(null)).toBeNull());
  it('returns null for undefined input', () => expect(daysUntil(undefined)).toBeNull());
  it('returns a number for valid date string', () => {
    const future = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const result = daysUntil(future);
    expect(result).toBeGreaterThanOrEqual(9);
    expect(result).toBeLessThanOrEqual(10);
  });
});
