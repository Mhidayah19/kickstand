import { computeNextService } from '../compute-next-service';

const DAY = 1000 * 60 * 60 * 24;

describe('computeNextService', () => {
  describe('progress fractions', () => {
    it('returns 0 for both when no service history', () => {
      const result = computeNextService({
        currentMileage: 5000,
        lastServiceMileage: null,
        lastServiceDate: null,
      });
      expect(result.actualProgress).toBe(0);
      expect(result.idealProgress).toBe(0);
    });

    it('computes actualProgress as km ridden over the km interval', () => {
      const result = computeNextService({
        currentMileage: 13000,
        lastServiceMileage: 10000,
        lastServiceDate: new Date(Date.now() - 90 * DAY),
      });
      // 3000 / 6000 = 0.5
      expect(result.actualProgress).toBeCloseTo(0.5, 5);
    });

    it('computes idealProgress as days elapsed over the day interval', () => {
      const result = computeNextService({
        currentMileage: 10500,
        lastServiceMileage: 10000,
        lastServiceDate: new Date(Date.now() - 90 * DAY),
      });
      // 90 / 180 = 0.5
      expect(result.idealProgress).toBeCloseTo(0.5, 2);
    });

    it('clamps progress values to [0, 1]', () => {
      const result = computeNextService({
        currentMileage: 100000,
        lastServiceMileage: 10000,
        lastServiceDate: new Date(Date.now() - 400 * DAY),
      });
      expect(result.actualProgress).toBe(1);
      expect(result.idealProgress).toBe(1);
    });

    it('actual exceeds ideal when rider covers km faster than calendar pace', () => {
      const result = computeNextService({
        currentMileage: 14000,
        lastServiceMileage: 10000,
        lastServiceDate: new Date(Date.now() - 30 * DAY),
      });
      // actual = 4000/6000 ≈ 0.67, ideal = 30/180 ≈ 0.17
      expect(result.actualProgress).toBeGreaterThan(result.idealProgress);
    });

    it('ideal exceeds actual when rider covers km slower than calendar pace', () => {
      const result = computeNextService({
        currentMileage: 10500,
        lastServiceMileage: 10000,
        lastServiceDate: new Date(Date.now() - 150 * DAY),
      });
      // actual = 500/6000 ≈ 0.08, ideal = 150/180 ≈ 0.83
      expect(result.idealProgress).toBeGreaterThan(result.actualProgress);
    });

    it('respects custom intervalKm and intervalDays', () => {
      const result = computeNextService({
        currentMileage: 5000,
        lastServiceMileage: 4000,
        lastServiceDate: new Date(Date.now() - 50 * DAY),
        intervalKm: 2000,
        intervalDays: 100,
      });
      // actual = 1000/2000 = 0.5, ideal = 50/100 = 0.5
      expect(result.actualProgress).toBeCloseTo(0.5, 5);
      expect(result.idealProgress).toBeCloseTo(0.5, 2);
    });
  });

  describe('existing behavior is preserved', () => {
    it('still reports kmUntil and daysUntil correctly', () => {
      const result = computeNextService({
        currentMileage: 12000,
        lastServiceMileage: 10000,
        lastServiceDate: new Date(Date.now() - 60 * DAY),
      });
      expect(result.kmUntil).toBe(4000);
      expect(result.daysUntil).toBe(120);
    });

    it('returns full intervals when no prior service', () => {
      const result = computeNextService({
        currentMileage: 0,
        lastServiceMileage: null,
        lastServiceDate: null,
      });
      expect(result.kmUntil).toBe(6000);
      expect(result.daysUntil).toBe(180);
    });
  });
});
