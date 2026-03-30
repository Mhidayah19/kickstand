import { bikeSchema, updateMileageSchema } from '../validation/bike-schema';

const validBike = {
  model: 'Honda CB400X',
  year: 2023,
  plateNumber: 'FBX1234A',
  class: '2A' as const,
  currentMileage: 15000,
};

describe('bikeSchema', () => {
  it('accepts valid bike input', () => {
    expect(bikeSchema.safeParse(validBike).success).toBe(true);
  });
  it('rejects missing model', () => {
    const result = bikeSchema.safeParse({ ...validBike, model: '' });
    expect(result.success).toBe(false);
  });
  it('rejects invalid year (1980)', () => {
    const result = bikeSchema.safeParse({ ...validBike, year: 1980 });
    expect(result.success).toBe(false);
  });
  it('accepts valid ISO date for optional fields', () => {
    expect(bikeSchema.safeParse({ ...validBike, coeExpiry: '2025-12-31' }).success).toBe(true);
  });
  it('accepts empty string for optional date fields', () => {
    expect(bikeSchema.safeParse({ ...validBike, coeExpiry: '' }).success).toBe(true);
  });
  it('rejects invalid date format (DD-MM-YYYY)', () => {
    expect(bikeSchema.safeParse({ ...validBike, coeExpiry: '31-12-2025' }).success).toBe(false);
  });
  it('rejects garbage string for date field', () => {
    expect(bikeSchema.safeParse({ ...validBike, coeExpiry: 'not a date' }).success).toBe(false);
  });
});

describe('updateMileageSchema', () => {
  it('accepts valid mileage', () => {
    expect(updateMileageSchema.safeParse({ currentMileage: 1000 }).success).toBe(true);
  });
  it('rejects negative mileage', () => {
    expect(updateMileageSchema.safeParse({ currentMileage: -1 }).success).toBe(false);
  });
});
