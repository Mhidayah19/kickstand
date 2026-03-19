/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Test, TestingModule } from '@nestjs/testing';
import { MaintenanceReminderJob } from './maintenance-reminder.job';
import { NotificationsService } from '../notifications.service';
import { DRIZZLE } from '../../../database/database.module';

const TODAY = new Date('2026-03-19T00:00:00.000Z');

function monthsAgoDate(months: number): string {
  const d = new Date(TODAY);
  d.setUTCMonth(d.getUTCMonth() - months);
  return d.toISOString().split('T')[0];
}

describe('MaintenanceReminderJob', () => {
  let job: MaintenanceReminderJob;

  const mockDb: any = {};
  mockDb.select = jest.fn(() => mockDb);
  mockDb.from = jest.fn(() => mockDb);
  mockDb.where = jest.fn(() => mockDb);
  mockDb.leftJoin = jest.fn(() => mockDb);
  mockDb.innerJoin = jest.fn(() => mockDb);
  mockDb.orderBy = jest.fn(() => mockDb);
  mockDb.limit = jest.fn(() => mockDb);
  mockDb.execute = jest.fn();

  const mockNotificationsService = {
    hasAlreadySent: jest.fn(),
    sendBatchPush: jest.fn(),
    logNotification: jest.fn(),
  };

  // A default user+bike+schedule set for CB400X
  const baseUser = {
    id: 'user-1',
    expoToken: 'ExponentPushToken[abc123]',
  };

  const baseBike = {
    id: 'bike-1',
    userId: 'user-1',
    model: 'Honda CB400X',
    currentMileage: 15500,
  };

  const oilChangeSchedule = {
    bikeModel: 'Honda CB400X',
    serviceType: 'oil_change',
    intervalKm: 5000,
    intervalMonths: 6,
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
        MaintenanceReminderJob,
        { provide: DRIZZLE, useValue: mockDb },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    job = module.get<MaintenanceReminderJob>(MaintenanceReminderJob);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('due by mileage', () => {
    it('sends a "due" notification when currentMileage - lastServiceMileage >= intervalKm', async () => {
      // Last oil change at 10000km, now at 15500km, interval is 5000km → overdue
      const users = [baseUser];
      const bikes = [baseBike]; // currentMileage: 15500
      const schedules = [oilChangeSchedule];
      const lastLog = {
        serviceType: 'oil_change',
        mileageAt: 10000,
        date: monthsAgoDate(3), // 3 months ago
      };

      mockDb.execute
        .mockResolvedValueOnce(users)
        .mockResolvedValueOnce(bikes)
        .mockResolvedValueOnce(schedules)
        .mockResolvedValueOnce([lastLog]);

      await job.run();

      expect(mockNotificationsService.sendBatchPush).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            to: 'ExponentPushToken[abc123]',
            body: expect.stringMatching(/oil change/i),
          }),
        ]),
      );
      expect(mockNotificationsService.logNotification).toHaveBeenCalledWith(
        'user-1',
        'bike-1',
        'maintenance',
        'oil_change',
        'due',
      );
    });

    it('sends an "approaching" notification when >= 80% of mileage interval is used', async () => {
      // Last oil change at 11000km, now at 15000km (4000/5000 = 80%) → approaching
      const bike = { ...baseBike, currentMileage: 15000 };
      const lastLog = {
        serviceType: 'oil_change',
        mileageAt: 11000,
        date: monthsAgoDate(2),
      };

      mockDb.execute
        .mockResolvedValueOnce([baseUser])
        .mockResolvedValueOnce([bike])
        .mockResolvedValueOnce([oilChangeSchedule])
        .mockResolvedValueOnce([lastLog]);

      await job.run();

      expect(mockNotificationsService.sendBatchPush).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            body: expect.stringMatching(/approaching|km away/i),
          }),
        ]),
      );
      expect(mockNotificationsService.logNotification).toHaveBeenCalledWith(
        'user-1',
        'bike-1',
        'maintenance',
        'oil_change',
        'approaching',
      );
    });

    it('does not send when mileage interval is not yet 80% used', async () => {
      // Last oil change at 12000km, now at 15000km (3000/5000 = 60%) → nothing
      const bike = { ...baseBike, currentMileage: 15000 };
      const lastLog = {
        serviceType: 'oil_change',
        mileageAt: 12000,
        date: monthsAgoDate(2),
      };
      // Time-based: 2 months used of 6 month interval (33%) → nothing

      mockDb.execute
        .mockResolvedValueOnce([baseUser])
        .mockResolvedValueOnce([bike])
        .mockResolvedValueOnce([oilChangeSchedule])
        .mockResolvedValueOnce([lastLog]);

      await job.run();

      expect(mockNotificationsService.sendBatchPush).not.toHaveBeenCalled();
    });
  });

  describe('due by time', () => {
    it('sends a "due" notification when months since last service >= intervalMonths', async () => {
      // Last oil change 7 months ago (interval is 6 months) → overdue by time
      const bike = { ...baseBike, currentMileage: 12000 };
      const lastLog = {
        serviceType: 'oil_change',
        mileageAt: 11000, // only 1000km used (not due by mileage)
        date: monthsAgoDate(7),
      };

      mockDb.execute
        .mockResolvedValueOnce([baseUser])
        .mockResolvedValueOnce([bike])
        .mockResolvedValueOnce([oilChangeSchedule])
        .mockResolvedValueOnce([lastLog]);

      await job.run();

      expect(mockNotificationsService.sendBatchPush).toHaveBeenCalled();
      expect(mockNotificationsService.logNotification).toHaveBeenCalledWith(
        'user-1',
        'bike-1',
        'maintenance',
        'oil_change',
        'due',
      );
    });

    it('sends an "approaching" notification when >= 80% of time interval is used', async () => {
      // 5 months used of 6 month interval (83%) → approaching by time
      const bike = { ...baseBike, currentMileage: 12000 };
      const lastLog = {
        serviceType: 'oil_change',
        mileageAt: 11000, // only 1000km used (not due by mileage)
        date: monthsAgoDate(5),
      };

      mockDb.execute
        .mockResolvedValueOnce([baseUser])
        .mockResolvedValueOnce([bike])
        .mockResolvedValueOnce([oilChangeSchedule])
        .mockResolvedValueOnce([lastLog]);

      await job.run();

      expect(mockNotificationsService.sendBatchPush).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            body: expect.stringMatching(/approaching|month/i),
          }),
        ]),
      );
      expect(mockNotificationsService.logNotification).toHaveBeenCalledWith(
        'user-1',
        'bike-1',
        'maintenance',
        'oil_change',
        'approaching',
      );
    });
  });

  describe('no service log exists', () => {
    it('skips time-based check when no service log exists', async () => {
      // No log → no reference date for time-based check
      // Mileage: 15500 - 0 = 15500 >= 5000 → due by mileage
      mockDb.execute
        .mockResolvedValueOnce([baseUser])
        .mockResolvedValueOnce([baseBike])
        .mockResolvedValueOnce([oilChangeSchedule])
        .mockResolvedValueOnce([]); // no service logs

      await job.run();

      // Should still send (due by mileage using lastServiceMileage=0)
      expect(mockNotificationsService.sendBatchPush).toHaveBeenCalled();
      expect(mockNotificationsService.logNotification).toHaveBeenCalledWith(
        'user-1',
        'bike-1',
        'maintenance',
        'oil_change',
        'due',
      );
    });

    it('does not send when no log exists and currentMileage is below the mileage interval', async () => {
      // No log, currentMileage 3000 < intervalKm 5000 → not due by mileage
      // No log → skip time-based check
      const bike = { ...baseBike, currentMileage: 3000 };

      mockDb.execute
        .mockResolvedValueOnce([baseUser])
        .mockResolvedValueOnce([bike])
        .mockResolvedValueOnce([oilChangeSchedule])
        .mockResolvedValueOnce([]);

      await job.run();

      expect(mockNotificationsService.sendBatchPush).not.toHaveBeenCalled();
    });
  });

  describe('no maintenance schedule', () => {
    it('skips gracefully when no maintenance_schedule exists for the bike model', async () => {
      mockDb.execute
        .mockResolvedValueOnce([baseUser])
        .mockResolvedValueOnce([baseBike])
        .mockResolvedValueOnce([]); // no schedules for this model

      await job.run();

      expect(mockNotificationsService.sendBatchPush).not.toHaveBeenCalled();
    });
  });

  describe('dedup', () => {
    it('skips a service type that already has a "due" notification logged', async () => {
      const lastLog = {
        serviceType: 'oil_change',
        mileageAt: 10000,
        date: monthsAgoDate(7),
      };

      mockDb.execute
        .mockResolvedValueOnce([baseUser])
        .mockResolvedValueOnce([baseBike])
        .mockResolvedValueOnce([oilChangeSchedule])
        .mockResolvedValueOnce([lastLog]);

      mockNotificationsService.hasAlreadySent.mockResolvedValue(true);

      await job.run();

      expect(mockNotificationsService.sendBatchPush).not.toHaveBeenCalled();
      expect(mockNotificationsService.logNotification).not.toHaveBeenCalled();
    });

    it('sends when service type has "approaching" logged but is now "due"', async () => {
      const lastLog = {
        serviceType: 'oil_change',
        mileageAt: 10000,
        date: monthsAgoDate(7),
      };

      mockDb.execute
        .mockResolvedValueOnce([baseUser])
        .mockResolvedValueOnce([baseBike])
        .mockResolvedValueOnce([oilChangeSchedule])
        .mockResolvedValueOnce([lastLog]);

      // "approaching" already sent, "due" not yet sent
      mockNotificationsService.hasAlreadySent.mockImplementation(
        (_u, _b, _t, _field, tier) => Promise.resolve(tier === 'approaching'),
      );

      await job.run();

      expect(mockNotificationsService.logNotification).toHaveBeenCalledWith(
        'user-1',
        'bike-1',
        'maintenance',
        'oil_change',
        'due',
      );
    });
  });

  describe('batching', () => {
    it('batches multiple due/approaching items per bike into one notification', async () => {
      const chainSchedule = {
        bikeModel: 'Honda CB400X',
        serviceType: 'chain_adjustment',
        intervalKm: 1000,
        intervalMonths: 3,
      };

      const oilLog = {
        serviceType: 'oil_change',
        mileageAt: 10000,
        date: monthsAgoDate(7),
      };
      const chainLog = {
        serviceType: 'chain_adjustment',
        mileageAt: 14000,
        date: monthsAgoDate(4),
      };

      mockDb.execute
        .mockResolvedValueOnce([baseUser])
        .mockResolvedValueOnce([baseBike])
        .mockResolvedValueOnce([oilChangeSchedule, chainSchedule])
        .mockResolvedValueOnce([oilLog]) // last oil_change log
        .mockResolvedValueOnce([chainLog]); // last chain_adjustment log

      await job.run();

      // One batch send per bike (not one per service type)
      expect(mockNotificationsService.sendBatchPush).toHaveBeenCalledTimes(1);
      const [messages] = mockNotificationsService.sendBatchPush.mock
        .calls[0] as [any[]];
      expect(messages[0].body).toMatch(/oil change/i);
      expect(messages[0].body).toMatch(/chain/i);
    });
  });

  describe('notification copy', () => {
    it('"due" notification mentions the service type and last mileage', async () => {
      const lastLog = {
        serviceType: 'oil_change',
        mileageAt: 10000,
        date: monthsAgoDate(7),
      };

      mockDb.execute
        .mockResolvedValueOnce([baseUser])
        .mockResolvedValueOnce([baseBike])
        .mockResolvedValueOnce([oilChangeSchedule])
        .mockResolvedValueOnce([lastLog]);

      await job.run();

      const [messages] = mockNotificationsService.sendBatchPush.mock
        .calls[0] as [any[]];
      expect(messages[0].body).toMatch(/oil change/i);
      expect(messages[0].body).toMatch(/10.?000|10000/);
    });

    it('"approaching" notification mentions km remaining', async () => {
      const bike = { ...baseBike, currentMileage: 15000 };
      const lastLog = {
        serviceType: 'oil_change',
        mileageAt: 11000,
        date: monthsAgoDate(2),
      };

      mockDb.execute
        .mockResolvedValueOnce([baseUser])
        .mockResolvedValueOnce([bike])
        .mockResolvedValueOnce([oilChangeSchedule])
        .mockResolvedValueOnce([lastLog]);

      await job.run();

      const [messages] = mockNotificationsService.sendBatchPush.mock
        .calls[0] as [any[]];
      // 15000 - 11000 = 4000km used of 5000km → 1000km remaining
      expect(messages[0].body).toMatch(/1.?000\s*km|1000km/i);
    });
  });

  describe('run() return value', () => {
    it('returns usersNotified and notificationsSent when notifications were sent', async () => {
      const lastLog = {
        serviceType: 'oil_change',
        mileageAt: 10000,
        date: monthsAgoDate(7),
      };

      mockDb.execute
        .mockResolvedValueOnce([baseUser])
        .mockResolvedValueOnce([baseBike])
        .mockResolvedValueOnce([oilChangeSchedule])
        .mockResolvedValueOnce([lastLog]);

      const result = await job.run();

      expect(result).toEqual(
        expect.objectContaining({
          usersNotified: expect.any(Number),
          notificationsSent: expect.any(Number),
        }),
      );
      expect(result.usersNotified).toBe(1);
      expect(result.notificationsSent).toBe(1);
    });

    it('returns zero counts when no services are due', async () => {
      // No users or no bikes
      mockDb.execute.mockResolvedValueOnce([]);

      const result = await job.run();

      expect(result).toEqual({ usersNotified: 0, notificationsSent: 0 });
    });
  });
});
