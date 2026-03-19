import { bikeSchema, updateMileageSchema } from '../validation/bike-schema';

const validBike = {
  model: 'Honda CB400X',
  year: 2022,
  plateNumber: 'FBR1234A',
  class: '2A' as const,
  currentMileage: 15000,
};

describe('bikeSchema', () => {
  it('passes with valid input', () => {
    const result = bikeSchema.safeParse(validBike);
    expect(result.success).toBe(true);
  });

  it('fails with missing model', () => {
    const result = bikeSchema.safeParse({ ...validBike, model: 'X' });
    expect(result.success).toBe(false);
  });

  it('fails with year before 1990', () => {
    const result = bikeSchema.safeParse({ ...validBike, year: 1985 });
    expect(result.success).toBe(false);
  });

  it('passes with optional date fields', () => {
    const result = bikeSchema.safeParse({ ...validBike, coeExpiry: '2031-03-20' });
    expect(result.success).toBe(true);
  });
});

describe('updateMileageSchema', () => {
  it('passes with valid mileage', () => {
    const result = updateMileageSchema.safeParse({ mileage: 16000 });
    expect(result.success).toBe(true);
  });

  it('fails with negative mileage', () => {
    const result = updateMileageSchema.safeParse({ mileage: -1 });
    expect(result.success).toBe(false);
  });
});
