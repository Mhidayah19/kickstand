/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Test, TestingModule } from '@nestjs/testing';
import { ComplianceScannerJob } from './compliance-scanner.job';
import { NotificationsService } from '../notifications.service';
import { DRIZZLE } from '../../../database/database.module';
import { ComplianceStatusService } from '../../compliance-status/compliance-status.service';

// Fixed reference date: 2026-03-19
const TODAY = new Date('2026-03-19T00:00:00.000Z');

function dateOffset(days: number): string {
  const d = new Date(TODAY);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split('T')[0];
}

function makeUser(overrides: Record<string, unknown> = {}) {
  return {
    id: 'user-1',
    expoToken: 'ExponentPushToken[abc123]',
    ...overrides,
  };
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
        ComplianceStatusService,
      ],
    }).compile();

    job = module.get<ComplianceScannerJob>(ComplianceScannerJob);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  /**
   * Mock the DB execute sequence for the new job flow:
   *   1. SELECT users
   *   2. SELECT bikes WHERE userId = user.id
   *   3. For each bike: SELECT bike WHERE id = bike.id  (computeForBike re-fetches)
   *
   * bikes is an array of bike objects.
   * Each bike is re-fetched once by computeForBike.
   */
  function setupMocks(user: object, bikes: object[]) {
    // 1. users query
    mockDb.execute.mockResolvedValueOnce([user]);
    // 2. bikes-for-user query
    mockDb.execute.mockResolvedValueOnce(bikes);
    // 3. per-bike re-fetch (computeForBike does SELECT bike WHERE id = ?)
    for (const bike of bikes) {
      mockDb.execute.mockResolvedValueOnce([bike]);
    }
  }

  function setupNoUsers() {
    mockDb.execute.mockResolvedValueOnce([]);
  }

  describe('tier window matching', () => {
    it('sends a 7d notification for road tax expiring in 7 days', async () => {
      const user = makeUser();
      const bike = makeBike({ roadTaxExpiry: dateOffset(7) });
      setupMocks(user, [bike]);

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
      const user = makeUser();
      const bike = makeBike({ coeExpiry: dateOffset(30) });
      setupMocks(user, [bike]);

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
      const user = makeUser();
      const bike = makeBike({ insuranceExpiry: dateOffset(14) });
      setupMocks(user, [bike]);

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

    it('sends a 1d notification for inspection due in 1 day', async () => {
      const user = makeUser();
      const bike = makeBike({ inspectionDue: dateOffset(1) });
      setupMocks(user, [bike]);

      await job.run();

      expect(mockNotificationsService.sendBatchPush).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            body: expect.stringMatching(/inspection/i),
          }),
        ]),
      );
    });

    it('does not send a notification when there are no users', async () => {
      setupNoUsers();

      await job.run();

      expect(mockNotificationsService.sendBatchPush).not.toHaveBeenCalled();
    });

    it('does not send a notification when no deadlines are set', async () => {
      const user = makeUser();
      const bike = makeBike(); // all deadline fields are null
      setupMocks(user, [bike]);

      await job.run();

      expect(mockNotificationsService.sendBatchPush).not.toHaveBeenCalled();
    });

    it('does not send a notification for a deadline 31 days away (outside all tier windows)', async () => {
      const user = makeUser();
      const bike = makeBike({ roadTaxExpiry: dateOffset(31) });
      setupMocks(user, [bike]);

      await job.run();

      expect(mockNotificationsService.sendBatchPush).not.toHaveBeenCalled();
    });

    it('sends a 1d notification for a deadline expiring today (day 0)', async () => {
      const user = makeUser();
      const bike = makeBike({ roadTaxExpiry: dateOffset(0) });
      setupMocks(user, [bike]);

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

    it('skips a user with no expo token', async () => {
      const user = makeUser({ expoToken: null });
      // No bikes query expected since user is skipped
      mockDb.execute.mockResolvedValueOnce([user]);

      await job.run();

      expect(mockNotificationsService.sendBatchPush).not.toHaveBeenCalled();
    });
  });

  describe('dedup', () => {
    it('skips a deadline that was already sent for the same bike+field+tier', async () => {
      const user = makeUser();
      const bike = makeBike({ roadTaxExpiry: dateOffset(7) });
      setupMocks(user, [bike]);
      mockNotificationsService.hasAlreadySent.mockResolvedValue(true);

      await job.run();

      expect(mockNotificationsService.sendBatchPush).not.toHaveBeenCalled();
      expect(mockNotificationsService.logNotification).not.toHaveBeenCalled();
    });

    it('sends when same bike+field has a different tier not yet logged', async () => {
      const user = makeUser();
      const bike = makeBike({ roadTaxExpiry: dateOffset(7) });
      setupMocks(user, [bike]);

      mockNotificationsService.hasAlreadySent.mockImplementation(
        (_u, _b, _t, _field, tier) => Promise.resolve(tier === '14d'),
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
      const user = makeUser();
      const bike = makeBike({
        roadTaxExpiry: dateOffset(7),
        insuranceExpiry: dateOffset(6),
      });
      setupMocks(user, [bike]);

      mockNotificationsService.hasAlreadySent.mockImplementation(
        (_u, _b, _t, field) => Promise.resolve(field === 'roadTaxExpiry'),
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

  describe('per-item notifications', () => {
    it('sends separate notifications for two deadlines at the same tier', async () => {
      const user = makeUser();
      const bike = makeBike({
        roadTaxExpiry: dateOffset(7),
        insuranceExpiry: dateOffset(6),
      });
      setupMocks(user, [bike]);

      await job.run();

      // Each deadline gets its own notification call
      expect(mockNotificationsService.sendBatchPush).toHaveBeenCalledTimes(2);
    });

    it('sends separate notifications for deadlines at different tiers', async () => {
      const user = makeUser();
      const bike7d = makeBike({ id: 'bike-1', roadTaxExpiry: dateOffset(7) });
      const bike30d = makeBike({ id: 'bike-2', coeExpiry: dateOffset(30) });
      // Two bikes: users → [bike7d, bike30d] → re-fetch bike7d → re-fetch bike30d
      mockDb.execute.mockResolvedValueOnce([user]);
      mockDb.execute.mockResolvedValueOnce([bike7d, bike30d]);
      mockDb.execute.mockResolvedValueOnce([bike7d]);
      mockDb.execute.mockResolvedValueOnce([bike30d]);

      await job.run();

      expect(mockNotificationsService.sendBatchPush).toHaveBeenCalledTimes(2);
    });
  });

  describe('notification copy', () => {
    it('30d notification body includes days remaining', async () => {
      const user = makeUser();
      const bike = makeBike({ roadTaxExpiry: dateOffset(30) });
      setupMocks(user, [bike]);

      await job.run();

      const [messages] = mockNotificationsService.sendBatchPush.mock
        .calls[0] as [any[]];
      expect(messages[0].body).toMatch(/30 days/i);
    });

    it('14d notification body mentions days remaining', async () => {
      const user = makeUser();
      const bike = makeBike({ roadTaxExpiry: dateOffset(14) });
      setupMocks(user, [bike]);

      await job.run();

      const [messages] = mockNotificationsService.sendBatchPush.mock
        .calls[0] as [any[]];
      expect(messages[0].body).toMatch(/14 days/i);
    });

    it('7d notification body says "7 days"', async () => {
      const user = makeUser();
      const bike = makeBike({ roadTaxExpiry: dateOffset(7) });
      setupMocks(user, [bike]);

      await job.run();

      const [messages] = mockNotificationsService.sendBatchPush.mock
        .calls[0] as [any[]];
      expect(messages[0].body).toMatch(/7 days/i);
    });

    it('1d notification body says "1 day"', async () => {
      const user = makeUser();
      const bike = makeBike({ roadTaxExpiry: dateOffset(1) });
      setupMocks(user, [bike]);

      await job.run();

      const [messages] = mockNotificationsService.sendBatchPush.mock
        .calls[0] as [any[]];
      expect(messages[0].body).toMatch(/1 day/i);
    });

    it('notification title is "Kickstand Compliance"', async () => {
      const user = makeUser();
      const bike = makeBike({ roadTaxExpiry: dateOffset(7) });
      setupMocks(user, [bike]);

      await job.run();

      const [messages] = mockNotificationsService.sendBatchPush.mock
        .calls[0] as [any[]];
      expect(messages[0].title).toBe('Kickstand Compliance');
    });
  });

  describe('run() return value', () => {
    it('returns usersNotified and notificationsSent counts after a normal run', async () => {
      const user = makeUser();
      const bike = makeBike({ roadTaxExpiry: dateOffset(7) });
      setupMocks(user, [bike]);

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

    it('returns zero counts when no users exist', async () => {
      setupNoUsers();

      const result = await job.run();

      expect(result).toEqual({ usersNotified: 0, notificationsSent: 0 });
    });

    it('counts each notified user once even if they have multiple bikes', async () => {
      const user = makeUser();
      const bike1 = makeBike({ id: 'bike-1', roadTaxExpiry: dateOffset(7) });
      const bike2 = makeBike({ id: 'bike-2', roadTaxExpiry: dateOffset(7) });
      // users → [bike1, bike2] → re-fetch bike1 → re-fetch bike2
      mockDb.execute.mockResolvedValueOnce([user]);
      mockDb.execute.mockResolvedValueOnce([bike1, bike2]);
      mockDb.execute.mockResolvedValueOnce([bike1]);
      mockDb.execute.mockResolvedValueOnce([bike2]);

      const result = await job.run();

      expect(result.usersNotified).toBe(1);
      expect(result.notificationsSent).toBe(2);
    });
  });
});
