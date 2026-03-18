import { getComplianceVariant, daysUntil } from '../theme';

describe('getComplianceVariant', () => {
  it('returns expired for negative days', () => expect(getComplianceVariant(-1)).toBe('expired'));
  it('returns expired for 0 days', () => expect(getComplianceVariant(0)).toBe('expired'));
  it('returns danger for 1-7 days', () => expect(getComplianceVariant(7)).toBe('danger'));
  it('returns warning for 8-30 days', () => expect(getComplianceVariant(14)).toBe('warning'));
  it('returns neutral for >30 days', () => expect(getComplianceVariant(31)).toBe('neutral'));
  it('returns neutral for null', () => expect(getComplianceVariant(null)).toBe('neutral'));
});
