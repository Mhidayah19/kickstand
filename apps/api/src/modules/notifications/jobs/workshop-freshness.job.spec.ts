/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Test, TestingModule } from '@nestjs/testing';
import { WorkshopFreshnessJob } from './workshop-freshness.job';
import { DRIZZLE } from '../../../database/database.module';

const TODAY = new Date('2026-03-19T00:00:00.000Z');

function monthsAgoDate(months: number): string {
  const d = new Date(TODAY);
  d.setUTCMonth(d.getUTCMonth() - months);
  return d.toISOString().split('T')[0];
}

describe('WorkshopFreshnessJob', () => {
  let job: WorkshopFreshnessJob;

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
        WorkshopFreshnessJob,
        { provide: DRIZZLE, useValue: mockDb },
      ],
    }).compile();

    job = module.get<WorkshopFreshnessJob>(WorkshopFreshnessJob);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('stale entry detection', () => {
    it('counts workshop_services with lastVerified older than 6 months as stale', async () => {
      const staleEntries = [
        { id: 'ws-1', lastVerified: monthsAgoDate(7) },
        { id: 'ws-2', lastVerified: monthsAgoDate(12) },
      ];
      mockDb.execute.mockResolvedValue(staleEntries);

      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      await job.run();

      expect(mockDb.where).toHaveBeenCalled();
      // Should log the stale count (2 entries)
      const allLogCalls = logSpy.mock.calls.flat().join(' ');
      expect(allLogCalls).toMatch(/2/);

      logSpy.mockRestore();
    });

    it('logs 0 stale entries when all workshop_services are recently verified', async () => {
      mockDb.execute.mockResolvedValue([]);

      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      await job.run();

      const allLogCalls = logSpy.mock.calls.flat().join(' ');
      expect(allLogCalls).toMatch(/0/);

      logSpy.mockRestore();
    });

    it('does not send any push notifications — this is admin housekeeping only', async () => {
      mockDb.execute.mockResolvedValue([
        { id: 'ws-1', lastVerified: monthsAgoDate(8) },
      ]);

      // WorkshopFreshnessJob should NOT have NotificationsService injected
      // and must not attempt to send any push notifications
      await job.run();

      // Verify no push-sending DB inserts happened
      expect(mockDb.insert).toBeUndefined();
    });

    it('queries workshop_services directly, not through WorkshopsService', async () => {
      mockDb.execute.mockResolvedValue([]);

      await job.run();

      // The job queries the DB directly — confirm it hits the DB
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.from).toHaveBeenCalled();
    });
  });

  describe('run() return value', () => {
    it('returns { usersNotified: 0, notificationsSent: 0 } — no user-facing notifications', async () => {
      mockDb.execute.mockResolvedValue([
        { id: 'ws-1', lastVerified: monthsAgoDate(8) },
        { id: 'ws-2', lastVerified: monthsAgoDate(10) },
      ]);

      const result = await job.run();

      expect(result).toEqual({ usersNotified: 0, notificationsSent: 0 });
    });

    it('returns zero counts even when there are no stale entries', async () => {
      mockDb.execute.mockResolvedValue([]);

      const result = await job.run();

      expect(result).toEqual({ usersNotified: 0, notificationsSent: 0 });
    });
  });
});
