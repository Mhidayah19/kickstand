/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Test, TestingModule } from '@nestjs/testing';
import { ComplianceScannerJob } from './compliance-scanner.job';
import { NotificationsService } from '../notifications.service';
import { DRIZZLE } from '../../../database/database.module';

// Fixed reference date: 2026-03-19
// Tier windows from today:
//   1d  → deadline on 2026-03-19 or 2026-03-20 (days 0–1)
//   7d  → deadline on 2026-03-25 or 2026-03-26 (days 6–7)
//   14d → deadline on 2026-04-01 or 2026-04-02 (days 13–14)
//   30d → deadline on 2026-04-17 or 2026-04-18 (days 29–30)
const TODAY = new Date('2026-03-19T00:00:00.000Z');

function dateOffset(days: number): string {
  const d = new Date(TODAY);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split('T')[0];
}

function makeBike(overrides: Record<string, unknown> = {}) {
  return {
    id: 'bike-1',
    userId: 'user-1',
    model: 'Honda CB400X',
    currentMileage: 15000,
    coeExpiry: null,
    roadTaxExpiry: null,
    insuranceExpiry: null,
    inspectionDue: null,
    expoToken: 'ExponentPushToken[abc123]',
    ...overrides,
  };
}

describe('ComplianceScannerJob', () => {
  let job: ComplianceScannerJob;

  const mockDb: any = {};
  mockDb.select = jest.fn(() => mockDb);
  mockDb.from = jest.fn(() => mockDb);
  mockDb.where = jest.fn(() => mockDb);
  mockDb.leftJoin = jest.fn(() => mockDb);
  mockDb.innerJoin = jest.fn(() => mockDb);
  mockDb.execute = jest.fn();

  const mockNotificationsService = {
    hasAlreadySent: jest.fn(),
    sendBatchPush: jest.fn(),
    logNotification: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(TODAY);

    mockNotificationsService.hasAlreadySent.mockResolvedValue(false);
    mockNotificationsService.sendBatchPush.mockResolvedValue(undefined);
    mockNotificationsService.logNotification.mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComplianceScannerJob,
        { provide: DRIZZLE, useValue: mockDb },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    job = module.get<ComplianceScannerJob>(ComplianceScannerJob);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // Helper: mock DB to return bikes for a specific tier and empty arrays for others.
  // Tiers are queried in order: 30d, 14d, 7d, 1d.
  function setupTierMocks(tierBikes: {
    '30d'?: object[];
    '14d'?: object[];
    '7d'?: object[];
    '1d'?: object[];
  }) {
    mockDb.execute
      .mockResolvedValueOnce(tierBikes['30d'] ?? [])
      .mockResolvedValueOnce(tierBikes['14d'] ?? [])
      .mockResolvedValueOnce(tierBikes['7d'] ?? [])
      .mockResolvedValueOnce(tierBikes['1d'] ?? []);
  }

  describe('tier window matching', () => {
    it('sends a 7d notification for road tax expiring in 7 days', async () => {
      const bike = makeBike({ roadTaxExpiry: dateOffset(7) });
      setupTierMocks({ '7d': [bike] });

      await job.run();

      expect(mockNotificationsService.sendBatchPush).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            to: 'ExponentPushToken[abc123]',
            body: expect.stringMatching(/road tax/i),
          }),
        ]),
      );
      expect(mockNotificationsService.logNotification).toHaveBeenCalledWith(
        'user-1',
        'bike-1',
        'compliance',
        'roadTaxExpiry',
        '7d',
      );
    });

    it('sends a 30d notification for COE expiring in 30 days', async () => {
      const bike = makeBike({ coeExpiry: dateOffset(30) });
      setupTierMocks({ '30d': [bike] });

      await job.run();

      expect(mockNotificationsService.sendBatchPush).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            to: 'ExponentPushToken[abc123]',
            body: expect.stringMatching(/coe/i),
          }),
        ]),
      );
      expect(mockNotificationsService.logNotification).toHaveBeenCalledWith(
        'user-1',
        'bike-1',
        'compliance',
        'coeExpiry',
        '30d',
      );
    });

    it('sends a 14d notification for insurance expiring in 14 days', async () => {
      const bike = makeBike({ insuranceExpiry: dateOffset(14) });
      setupTierMocks({ '14d': [bike] });

      await job.run();

      expect(mockNotificationsService.sendBatchPush).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            to: 'ExponentPushToken[abc123]',
            body: expect.stringMatching(/insurance/i),
          }),
        ]),
      );
      expect(mockNotificationsService.logNotification).toHaveBeenCalledWith(
        'user-1',
        'bike-1',
        'compliance',
        'insuranceExpiry',
        '14d',
      );
    });

    it('sends a 1d notification saying "TOMORROW" for inspection due in 1 day', async () => {
      const bike = makeBike({ inspectionDue: dateOffset(1) });
      setupTierMocks({ '1d': [bike] });

      await job.run();

      expect(mockNotificationsService.sendBatchPush).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            body: expect.stringMatching(/tomorrow/i),
          }),
        ]),
      );
    });

    it('does not send a notification for a deadline in the past', async () => {
      // DB should not return bikes with past deadlines (query filters them out)
      setupTierMocks({});

      await job.run();

      expect(mockNotificationsService.sendBatchPush).not.toHaveBeenCalled();
    });

    it('does not send a notification for a deadline 31 days away (outside all tier windows)', async () => {
      // 31 days away does not fall in any tier window
      setupTierMocks({});

      await job.run();

      expect(mockNotificationsService.sendBatchPush).not.toHaveBeenCalled();
    });

    it('sends a 1d notification for a deadline expiring today (day 0)', async () => {
      const bike = makeBike({ roadTaxExpiry: dateOffset(0) });
      setupTierMocks({ '1d': [bike] });

      await job.run();

      expect(mockNotificationsService.sendBatchPush).toHaveBeenCalled();
      expect(mockNotificationsService.logNotification).toHaveBeenCalledWith(
        'user-1',
        'bike-1',
        'compliance',
        'roadTaxExpiry',
        '1d',
      );
    });

    it('skips a bike with no expo token', async () => {
      const bike = makeBike({ roadTaxExpiry: dateOffset(7), expoToken: null });
      setupTierMocks({ '7d': [bike] });

      await job.run();

      expect(mockNotificationsService.sendBatchPush).not.toHaveBeenCalled();
    });
  });

  describe('dedup', () => {
    it('skips a deadline that was already sent for the same bike+field+tier', async () => {
      const bike = makeBike({ roadTaxExpiry: dateOffset(7) });
      setupTierMocks({ '7d': [bike] });
      mockNotificationsService.hasAlreadySent.mockResolvedValue(true);

      await job.run();

      expect(mockNotificationsService.sendBatchPush).not.toHaveBeenCalled();
      expect(mockNotificationsService.logNotification).not.toHaveBeenCalled();
    });

    it('sends when same bike+field has a different tier not yet logged', async () => {
      // Bike has road tax in both 30d AND 7d would not happen, but:
      // here same bike has been sent for 14d but not 7d
      const bike = makeBike({ roadTaxExpiry: dateOffset(7) });
      setupTierMocks({ '7d': [bike] });

      mockNotificationsService.hasAlreadySent.mockImplementation(
        async (_u, _b, _t, _field, tier) => tier === '14d',
      );

      await job.run();

      expect(mockNotificationsService.sendBatchPush).toHaveBeenCalled();
      expect(mockNotificationsService.logNotification).toHaveBeenCalledWith(
        'user-1',
        'bike-1',
        'compliance',
        'roadTaxExpiry',
        '7d',
      );
    });

    it('sends only unsent deadlines when some at the same tier are already logged', async () => {
      // Bike has two deadlines at 7d tier; road tax already sent, insurance not sent
      const bike = makeBike({
        roadTaxExpiry: dateOffset(7),
        insuranceExpiry: dateOffset(6),
      });
      setupTierMocks({ '7d': [bike] });

      mockNotificationsService.hasAlreadySent.mockImplementation(
        async (_u, _b, _t, field) => field === 'roadTaxExpiry',
      );

      await job.run();

      expect(mockNotificationsService.logNotification).toHaveBeenCalledTimes(1);
      expect(mockNotificationsService.logNotification).toHaveBeenCalledWith(
        'user-1',
        'bike-1',
        'compliance',
        'insuranceExpiry',
        '7d',
      );
    });
  });

  describe('batching', () => {
    it('batches two deadlines at the same tier into one notification per bike', async () => {
      const bike = makeBike({
        roadTaxExpiry: dateOffset(7),
        insuranceExpiry: dateOffset(6),
      });
      setupTierMocks({ '7d': [bike] });

      await job.run();

      // One batch call for the 7d tier containing one message for the bike
      const calls = mockNotificationsService.sendBatchPush.mock.calls;
      const allMessages = calls.flatMap(([msgs]: [any[]]) => msgs);
      const bikeMsgs = allMessages.filter(
        (m: any) => m.to === 'ExponentPushToken[abc123]',
      );

      expect(bikeMsgs).toHaveLength(1);
      expect(bikeMsgs[0].body).toMatch(/road tax/i);
      expect(bikeMsgs[0].body).toMatch(/insurance/i);
    });

    it('sends separate notifications for deadlines at different tiers', async () => {
      const bike7d = makeBike({ roadTaxExpiry: dateOffset(7) });
      const bike30d = makeBike({ coeExpiry: dateOffset(30) });
      setupTierMocks({ '30d': [bike30d], '7d': [bike7d] });

      await job.run();

      // sendBatchPush should have been called at least twice (once per tier with notifications)
      expect(mockNotificationsService.sendBatchPush).toHaveBeenCalledTimes(2);
    });
  });

  describe('notification copy', () => {
    it('30d notification body includes the expiry date', async () => {
      const bike = makeBike({ roadTaxExpiry: dateOffset(30) });
      setupTierMocks({ '30d': [bike] });

      await job.run();

      const [messages] =
        mockNotificationsService.sendBatchPush.mock.calls[0] as [any[]];
      expect(messages[0].body).toMatch(/\d{1,2} \w{3}|\d{4}-\d{2}-\d{2}/);
    });

    it('14d notification body says "2 weeks" or "14 days"', async () => {
      const bike = makeBike({ roadTaxExpiry: dateOffset(14) });
      setupTierMocks({ '14d': [bike] });

      await job.run();

      const [messages] =
        mockNotificationsService.sendBatchPush.mock.calls[0] as [any[]];
      expect(messages[0].body).toMatch(/2 weeks|14 days/i);
    });

    it('7d notification body says "7 days"', async () => {
      const bike = makeBike({ roadTaxExpiry: dateOffset(7) });
      setupTierMocks({ '7d': [bike] });

      await job.run();

      const [messages] =
        mockNotificationsService.sendBatchPush.mock.calls[0] as [any[]];
      expect(messages[0].body).toMatch(/7 days/i);
    });

    it('1d notification body says "TOMORROW"', async () => {
      const bike = makeBike({ roadTaxExpiry: dateOffset(1) });
      setupTierMocks({ '1d': [bike] });

      await job.run();

      const [messages] =
        mockNotificationsService.sendBatchPush.mock.calls[0] as [any[]];
      expect(messages[0].body).toMatch(/tomorrow/i);
    });
  });

  describe('run() return value', () => {
    it('returns usersNotified and notificationsSent counts after a normal run', async () => {
      const bike = makeBike({ roadTaxExpiry: dateOffset(7) });
      setupTierMocks({ '7d': [bike] });

      const result = await job.run();

      expect(result).toEqual(
        expect.objectContaining({
          usersNotified: expect.any(Number),
          notificationsSent: expect.any(Number),
        }),
      );
      expect(result.usersNotified).toBeGreaterThan(0);
      expect(result.notificationsSent).toBeGreaterThan(0);
    });

    it('returns zero counts when no deadlines fall in any tier window', async () => {
      setupTierMocks({});

      const result = await job.run();

      expect(result).toEqual({ usersNotified: 0, notificationsSent: 0 });
    });

    it('counts each notified user once even if they have multiple bikes', async () => {
      const bike1 = makeBike({ id: 'bike-1', roadTaxExpiry: dateOffset(7) });
      const bike2 = makeBike({ id: 'bike-2', roadTaxExpiry: dateOffset(7) });
      setupTierMocks({ '7d': [bike1, bike2] });

      const result = await job.run();

      expect(result.usersNotified).toBe(1);
      expect(result.notificationsSent).toBe(2);
    });
  });
});
