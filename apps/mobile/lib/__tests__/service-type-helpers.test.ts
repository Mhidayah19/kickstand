import { getFrequentServiceTypes, filterServiceTypes } from '../service-type-helpers';
import type { ServiceLog } from '../types/service-log';

function makeLog(serviceType: string, date: string): ServiceLog {
  return {
    id: Math.random().toString(),
    bikeId: 'bike-1',
    workshopId: null,
    serviceType,
    description: '',
    parts: null,
    cost: '0',
    mileageAt: 1000,
    date,
    receiptUrls: [],
    createdAt: date,
    updatedAt: date,
  };
}

describe('getFrequentServiceTypes', () => {
  it('returns empty array when no logs', () => {
    expect(getFrequentServiceTypes([], 3)).toEqual([]);
  });

  it('returns types sorted by frequency descending', () => {
    const logs = [
      makeLog('oil_change', '2026-01-01'),
      makeLog('oil_change', '2026-02-01'),
      makeLog('oil_change', '2026-03-01'),
      makeLog('chain_adjustment', '2026-01-15'),
      makeLog('chain_adjustment', '2026-02-15'),
      makeLog('brake_pads', '2026-03-10'),
    ];
    const result = getFrequentServiceTypes(logs, 3);
    expect(result).toEqual([
      { key: 'oil_change', count: 3 },
      { key: 'chain_adjustment', count: 2 },
      { key: 'brake_pads', count: 1 },
    ]);
  });

  it('limits results to maxCount', () => {
    const logs = [
      makeLog('oil_change', '2026-01-01'),
      makeLog('chain_adjustment', '2026-01-01'),
      makeLog('brake_pads', '2026-01-01'),
      makeLog('battery', '2026-01-01'),
    ];
    const result = getFrequentServiceTypes(logs, 2);
    expect(result).toHaveLength(2);
  });

  it('breaks ties by most recent log date', () => {
    const logs = [
      makeLog('oil_change', '2026-01-01'),
      makeLog('brake_pads', '2026-03-01'),
    ];
    const result = getFrequentServiceTypes(logs, 2);
    expect(result[0].key).toBe('brake_pads');
    expect(result[1].key).toBe('oil_change');
  });
});

describe('filterServiceTypes', () => {
  it('returns all groups when query is empty', () => {
    const result = filterServiceTypes('');
    expect(result).toHaveLength(4);
    expect(result.map((g) => g.label)).toEqual([
      'Engine', 'Drivetrain', 'Brakes & Wheels', 'Other',
    ]);
  });

  it('returns all groups when query is whitespace', () => {
    const result = filterServiceTypes('   ');
    expect(result).toHaveLength(4);
  });

  it('filters types by label match', () => {
    const result = filterServiceTypes('brake');
    const allKeys = result.flatMap((g) => g.keys);
    expect(allKeys).toContain('brake_pads');
    expect(allKeys).toContain('brake_fluid');
    expect(allKeys).not.toContain('oil_change');
  });

  it('is case-insensitive', () => {
    const result = filterServiceTypes('OIL');
    const allKeys = result.flatMap((g) => g.keys);
    expect(allKeys).toContain('oil_change');
    expect(allKeys).toContain('fork_oil');
  });

  it('omits groups with zero matches', () => {
    const result = filterServiceTypes('battery');
    expect(result).toHaveLength(1);
    expect(result[0].label).toBe('Other');
    expect(result[0].keys).toEqual(['battery']);
  });

  it('returns empty array when nothing matches', () => {
    const result = filterServiceTypes('zzz');
    expect(result).toEqual([]);
  });
});
