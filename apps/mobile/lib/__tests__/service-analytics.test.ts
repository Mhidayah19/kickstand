import {
  getCategoryGroup,
  computeByCategory,
  computeByMonth,
  computeCostPerKm,
} from '../utils/service-analytics';
import type { ServiceLog } from '../types/service-log';

function makeLog(overrides: Partial<ServiceLog> = {}): ServiceLog {
  return {
    id: Math.random().toString(),
    bikeId: 'bike-1',
    workshopId: null,
    serviceType: 'oil_change',
    description: '',
    parts: null,
    cost: '0',
    mileageAt: 1000,
    date: '2026-01-01',
    receiptUrls: [],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('getCategoryGroup', () => {
  it('maps oil_change to Oil & Fluids', () => {
    expect(getCategoryGroup('oil_change')).toBe('Oil & Fluids');
  });
  it('maps brake_pads to Brakes', () => {
    expect(getCategoryGroup('brake_pads')).toBe('Brakes');
  });
  it('maps chain_adjustment to Drivetrain', () => {
    expect(getCategoryGroup('chain_adjustment')).toBe('Drivetrain');
  });
  it('maps general_service to General', () => {
    expect(getCategoryGroup('general_service')).toBe('General');
  });
  it('returns General for unknown service types', () => {
    expect(getCategoryGroup('unknown_type')).toBe('General');
  });
});

describe('computeByCategory', () => {
  it('returns empty array for no logs', () => {
    expect(computeByCategory([])).toEqual([]);
  });
  it('sums costs by category', () => {
    const logs = [
      makeLog({ serviceType: 'oil_change', cost: '50' }),
      makeLog({ serviceType: 'oil_change', cost: '30' }),
      makeLog({ serviceType: 'brake_pads', cost: '120' }),
    ];
    const result = computeByCategory(logs);
    const oilEntry = result.find((r) => r.group === 'Oil & Fluids');
    const brakeEntry = result.find((r) => r.group === 'Brakes');
    expect(oilEntry?.total).toBe(80);
    expect(brakeEntry?.total).toBe(120);
  });
  it('sorts by total descending', () => {
    const logs = [
      makeLog({ serviceType: 'brake_pads', cost: '50' }),
      makeLog({ serviceType: 'oil_change', cost: '200' }),
    ];
    const result = computeByCategory(logs);
    expect(result[0].group).toBe('Oil & Fluids');
    expect(result[1].group).toBe('Brakes');
  });
  it('handles zero cost logs', () => {
    const logs = [makeLog({ serviceType: 'oil_change', cost: '0' })];
    const result = computeByCategory(logs);
    expect(result[0].total).toBe(0);
  });
});

describe('computeByMonth', () => {
  it('returns empty array for no logs', () => {
    expect(computeByMonth([])).toEqual([]);
  });
  it('sums multiple logs in the same month', () => {
    const logs = [
      makeLog({ date: '2026-01-01', cost: '50' }),
      makeLog({ date: '2026-01-15', cost: '30' }),
    ];
    const result = computeByMonth(logs);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ month: '2026-01', total: 80 });
  });
  it('returns at most 6 months (last 6 by date)', () => {
    const logs = [
      makeLog({ date: '2025-01-01', cost: '10' }),
      makeLog({ date: '2025-02-01', cost: '10' }),
      makeLog({ date: '2025-03-01', cost: '10' }),
      makeLog({ date: '2025-04-01', cost: '10' }),
      makeLog({ date: '2025-05-01', cost: '10' }),
      makeLog({ date: '2025-06-01', cost: '10' }),
      makeLog({ date: '2025-07-01', cost: '10' }),
    ];
    const result = computeByMonth(logs);
    expect(result).toHaveLength(6);
    expect(result[0].month).toBe('2025-02');
    expect(result[5].month).toBe('2025-07');
  });
  it('returns results sorted oldest to newest', () => {
    const logs = [
      makeLog({ date: '2026-03-01', cost: '100' }),
      makeLog({ date: '2026-01-01', cost: '50' }),
    ];
    const result = computeByMonth(logs);
    expect(result[0].month).toBe('2026-01');
    expect(result[1].month).toBe('2026-03');
  });
});

describe('computeCostPerKm', () => {
  it('returns null for empty logs', () => {
    expect(computeCostPerKm([], 0)).toBeNull();
  });
  it('returns null for a single log', () => {
    expect(computeCostPerKm([makeLog({ mileageAt: 1000 })], 50)).toBeNull();
  });
  it('returns null when earliest and latest mileage are equal', () => {
    const logs = [
      makeLog({ date: '2026-01-01', mileageAt: 1000 }),
      makeLog({ date: '2026-06-01', mileageAt: 1000 }),
    ];
    expect(computeCostPerKm(logs, 100)).toBeNull();
  });
  it('computes cost per 1000km correctly', () => {
    const logs = [
      makeLog({ date: '2026-01-01', mileageAt: 0 }),
      makeLog({ date: '2026-06-01', mileageAt: 5000 }),
    ];
    expect(computeCostPerKm(logs, 500)).toBe(100);
  });
  it('uses mileage from earliest and latest dated log (not first in array)', () => {
    const logs = [
      makeLog({ date: '2026-06-01', mileageAt: 5000 }),
      makeLog({ date: '2026-01-01', mileageAt: 0 }),
    ];
    expect(computeCostPerKm(logs, 500)).toBe(100);
  });
});
