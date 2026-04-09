/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Test, TestingModule } from '@nestjs/testing';
import { MaintenanceStatusService } from './maintenance-status.service';
import { DRIZZLE } from '../../database/database.module';

const TODAY = new Date('2026-04-09T00:00:00.000Z');

function monthsAgoDate(months: number): string {
  const d = new Date(TODAY);
  d.setUTCMonth(d.getUTCMonth() - months);
  return d.toISOString().split('T')[0];
}

describe('MaintenanceStatusService', () => {
  let service: MaintenanceStatusService;

  const mockDb: any = {};
  mockDb.select = jest.fn(() => mockDb);
  mockDb.from = jest.fn(() => mockDb);
  mockDb.where = jest.fn(() => mockDb);
  mockDb.orderBy = jest.fn(() => mockDb);
  mockDb.limit = jest.fn(() => mockDb);
  mockDb.execute = jest.fn();

  const bike = {
    id: 'bike-1',
    userId: 'user-1',
    model: 'Honda CB400X',
    make: 'Honda',
    currentMileage: 17500,
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(TODAY);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MaintenanceStatusService,
        { provide: DRIZZLE, useValue: mockDb },
      ],
    }).compile();

    service = module.get(MaintenanceStatusService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  function mockLoadSequence(opts: {
    bike: typeof bike | null;
    schedules: Array<{
      bikeModel: string;
      serviceType: string;
      intervalKm: number | null;
      intervalMonths: number | null;
    }>;
    latestLogs: Record<string, { mileageAt: number; date: string } | null>;
  }) {
    // Call 1: load bike
    mockDb.execute.mockResolvedValueOnce(opts.bike ? [opts.bike] : []);
    // Call 2: load schedules for bike model
    mockDb.execute.mockResolvedValueOnce(opts.schedules);
    // Subsequent calls: one per schedule, to load the latest log
    for (const schedule of opts.schedules) {
      const latest = opts.latestLogs[schedule.serviceType];
      mockDb.execute.mockResolvedValueOnce(latest ? [latest] : []);
    }
  }

  it('returns empty array when bike has no matching schedules', async () => {
    mockLoadSequence({
      bike,
      schedules: [],
      latestLogs: {},
    });

    const items = await service.computeForBike('bike-1');
    expect(items).toEqual([]);
  });

  it('marks a service as overdue when used mileage exceeds interval', async () => {
    mockLoadSequence({
      bike,
      schedules: [
        {
          bikeModel: 'Honda CB400X',
          serviceType: 'oil_change',
          intervalKm: 5000,
          intervalMonths: 6,
        },
      ],
      latestLogs: {
        oil_change: { mileageAt: 12000, date: monthsAgoDate(3) },
      },
    });

    const items = await service.computeForBike('bike-1');
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      key: 'oil_change',
      status: 'overdue',
      lastMileage: 12000,
      currentMileage: 17500,
      intervalKm: 5000,
      deltaKm: -500, // used 5500 vs interval 5000 → 500km over
    });
  });

  it('marks a service as approaching when used mileage ≥ 80% of interval', async () => {
    mockLoadSequence({
      bike,
      schedules: [
        {
          bikeModel: 'Honda CB400X',
          serviceType: 'oil_change',
          intervalKm: 5000,
          intervalMonths: 6,
        },
      ],
      latestLogs: {
        oil_change: { mileageAt: 13500, date: monthsAgoDate(2) },
      },
    });

    const items = await service.computeForBike('bike-1');
    expect(items[0]).toMatchObject({
      key: 'oil_change',
      status: 'approaching',
      deltaKm: 1000, // used 4000 of 5000 → 1000 remaining
    });
  });

  it('marks a service as ok when used mileage < 80% of interval', async () => {
    mockLoadSequence({
      bike,
      schedules: [
        {
          bikeModel: 'Honda CB400X',
          serviceType: 'oil_change',
          intervalKm: 5000,
          intervalMonths: 6,
        },
      ],
      latestLogs: {
        oil_change: { mileageAt: 16000, date: monthsAgoDate(1) },
      },
    });

    const items = await service.computeForBike('bike-1');
    expect(items[0]).toMatchObject({
      status: 'ok',
      deltaKm: 3500,
    });
  });

  it('falls back to time-based status when schedule has intervalMonths and no km-trigger fires', async () => {
    mockLoadSequence({
      bike,
      schedules: [
        {
          bikeModel: 'Honda CB400X',
          serviceType: 'coolant',
          intervalKm: null,
          intervalMonths: 24,
        },
      ],
      latestLogs: {
        coolant: { mileageAt: 1000, date: monthsAgoDate(25) },
      },
    });

    const items = await service.computeForBike('bike-1');
    expect(items[0]).toMatchObject({
      key: 'coolant',
      status: 'overdue',
      deltaMonths: -1,
    });
  });

  it('sorts overdue before approaching before ok, by magnitude', async () => {
    mockLoadSequence({
      bike,
      schedules: [
        {
          bikeModel: 'Honda CB400X',
          serviceType: 'oil_change',
          intervalKm: 5000,
          intervalMonths: 6,
        },
        {
          bikeModel: 'Honda CB400X',
          serviceType: 'air_filter',
          intervalKm: 12000,
          intervalMonths: 12,
        },
        {
          bikeModel: 'Honda CB400X',
          serviceType: 'chain_replacement',
          intervalKm: 20000,
          intervalMonths: null,
        },
      ],
      latestLogs: {
        oil_change: { mileageAt: 12000, date: monthsAgoDate(3) }, // overdue 500km
        air_filter: { mileageAt: 7000, date: monthsAgoDate(4) }, // approaching
        chain_replacement: { mileageAt: 2000, date: monthsAgoDate(6) }, // ok
      },
    });

    const items = await service.computeForBike('bike-1');
    expect(items.map((i) => i.key)).toEqual([
      'oil_change',
      'air_filter',
      'chain_replacement',
    ]);
  });

  it('throws NotFoundException when bike does not exist', async () => {
    mockLoadSequence({
      bike: null,
      schedules: [],
      latestLogs: {},
    });

    await expect(service.computeForBike('nope')).rejects.toThrow(
      'Bike not found',
    );
  });
});
