/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Test, TestingModule } from '@nestjs/testing';
import { ComplianceStatusService } from './compliance-status.service';
import { DRIZZLE } from '../../database/database.module';

const TODAY = new Date('2026-04-09T00:00:00.000Z');

function addDays(days: number): string {
  const d = new Date(TODAY);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split('T')[0];
}

describe('ComplianceStatusService', () => {
  let service: ComplianceStatusService;

  const mockDb: any = {};
  mockDb.select = jest.fn(() => mockDb);
  mockDb.from = jest.fn(() => mockDb);
  mockDb.where = jest.fn(() => mockDb);
  mockDb.execute = jest.fn();

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(TODAY);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComplianceStatusService,
        { provide: DRIZZLE, useValue: mockDb },
      ],
    }).compile();

    service = module.get(ComplianceStatusService);
  });

  afterEach(() => jest.useRealTimers());

  function mockBike(bike: any) {
    mockDb.execute.mockResolvedValueOnce([bike]);
  }

  it('returns empty array when all compliance fields are null', async () => {
    mockBike({
      id: 'bike-1',
      coeExpiry: null,
      roadTaxExpiry: null,
      insuranceExpiry: null,
      inspectionDue: null,
    });
    const items = await service.computeForBike('bike-1');
    expect(items).toEqual([]);
  });

  it('marks a field as overdue when the expiry is in the past', async () => {
    mockBike({
      id: 'bike-1',
      coeExpiry: null,
      roadTaxExpiry: addDays(-3),
      insuranceExpiry: null,
      inspectionDue: null,
    });
    const items = await service.computeForBike('bike-1');
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      key: 'roadTaxExpiry',
      label: 'Road Tax',
      status: 'overdue',
      daysRemaining: -3,
    });
  });

  it('marks a field as approaching when within 30 days', async () => {
    mockBike({
      id: 'bike-1',
      coeExpiry: null,
      roadTaxExpiry: addDays(20),
      insuranceExpiry: null,
      inspectionDue: null,
    });
    const items = await service.computeForBike('bike-1');
    expect(items[0]).toMatchObject({
      status: 'approaching',
      daysRemaining: 20,
    });
  });

  it('marks a field as ok when more than 30 days away', async () => {
    mockBike({
      id: 'bike-1',
      coeExpiry: null,
      roadTaxExpiry: addDays(60),
      insuranceExpiry: null,
      inspectionDue: null,
    });
    const items = await service.computeForBike('bike-1');
    expect(items[0]).toMatchObject({ status: 'ok', daysRemaining: 60 });
  });

  it('returns all four fields when all are populated, sorted by severity', async () => {
    mockBike({
      id: 'bike-1',
      coeExpiry: addDays(365),
      roadTaxExpiry: addDays(-5),
      insuranceExpiry: addDays(10),
      inspectionDue: addDays(90),
    });
    const items = await service.computeForBike('bike-1');
    expect(items).toHaveLength(4);
    expect(items.map((i) => i.key)).toEqual([
      'roadTaxExpiry',
      'insuranceExpiry',
      'inspectionDue',
      'coeExpiry',
    ]);
  });

  it('throws NotFoundException when bike not found', async () => {
    mockDb.execute.mockResolvedValueOnce([]);
    await expect(service.computeForBike('nope')).rejects.toThrow(
      'Bike not found',
    );
  });
});
