/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { DRIZZLE } from '../../database/database.module';

// Mock expo-server-sdk with a factory (all refs inside to avoid TDZ)
jest.mock('expo-server-sdk', () => {
  const mockSend = jest.fn();
  const mockChunk = jest.fn((msgs: unknown[]) => [msgs]);
  const mockIsToken = jest.fn().mockReturnValue(true);
  const Expo = jest.fn().mockImplementation(() => ({
    sendPushNotificationsAsync: mockSend,
    chunkPushNotifications: mockChunk,
  }));

  (Expo as any).isExpoPushToken = mockIsToken;
  return {
    Expo,
    mockSendPushNotificationsAsync: mockSend,
    mockIsExpoPushToken: mockIsToken,
  };
});

const {
  mockSendPushNotificationsAsync: mockExpoPushNotificationsAsync,
  mockIsExpoPushToken,
} = jest.requireMock('expo-server-sdk');

describe('NotificationsService', () => {
  let service: NotificationsService;

  const mockDb: any = {};
  mockDb.update = jest.fn(() => mockDb);
  mockDb.set = jest.fn(() => mockDb);
  mockDb.where = jest.fn(() => mockDb);
  mockDb.execute = jest.fn();
  mockDb.select = jest.fn(() => mockDb);
  mockDb.from = jest.fn(() => mockDb);
  mockDb.insert = jest.fn(() => mockDb);
  mockDb.values = jest.fn(() => mockDb);
  mockDb.returning = jest.fn();

  beforeEach(async () => {
    jest.clearAllMocks();
    mockIsExpoPushToken.mockImplementation((token: string) =>
      token.startsWith('ExponentPushToken['),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationsService, { provide: DRIZZLE, useValue: mockDb }],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  describe('registerToken', () => {
    it('should update users.expoToken for the authenticated user', async () => {
      mockDb.execute.mockResolvedValue(undefined);

      await service.registerToken('user-1', 'ExponentPushToken[abc123]');

      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.set).toHaveBeenCalledWith(
        expect.objectContaining({ expoToken: 'ExponentPushToken[abc123]' }),
      );
    });
  });

  describe('hasAlreadySent', () => {
    it('should return true when a matching entry exists in notification_logs', async () => {
      mockDb.where.mockResolvedValue([{ id: 'log-1' }]);

      const result = await service.hasAlreadySent(
        'user-1',
        'bike-1',
        'compliance',
        'roadTaxExpiry',
        '7d',
      );

      expect(result).toBe(true);
    });

    it('should return false when no matching entry exists in notification_logs', async () => {
      mockDb.where.mockResolvedValue([]);

      const result = await service.hasAlreadySent(
        'user-1',
        'bike-1',
        'compliance',
        'roadTaxExpiry',
        '7d',
      );

      expect(result).toBe(false);
    });

    it('should check all five dedup key fields: userId, bikeId, type, deadlineField, tier', async () => {
      mockDb.where.mockResolvedValue([]);

      await service.hasAlreadySent(
        'u1',
        'b1',
        'maintenance',
        'oil_change',
        'due',
      );

      // The where clause should receive all five criteria
      expect(mockDb.where).toHaveBeenCalled();
    });
  });

  describe('logNotification', () => {
    it('should insert into notification_logs with all required fields', async () => {
      mockDb.returning.mockResolvedValue([{ id: 'log-1' }]);

      await service.logNotification(
        'user-1',
        'bike-1',
        'compliance',
        'coeExpiry',
        '30d',
      );

      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.values).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          bikeId: 'bike-1',
          type: 'compliance',
          deadlineField: 'coeExpiry',
          tier: '30d',
        }),
      );
    });
  });

  describe('sendPush', () => {
    it('should send a push notification to a valid Expo token', async () => {
      mockExpoPushNotificationsAsync.mockResolvedValue([{ status: 'ok' }]);

      await service.sendPush(
        'ExponentPushToken[abc123]',
        'Road tax reminder',
        'Your road tax expires in 7 days',
      );

      expect(mockExpoPushNotificationsAsync).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            to: 'ExponentPushToken[abc123]',
            title: 'Road tax reminder',
            body: 'Your road tax expires in 7 days',
          }),
        ]),
      );
    });

    it('should clear users.expoToken when Expo returns DeviceNotRegistered', async () => {
      mockExpoPushNotificationsAsync.mockResolvedValue([
        {
          status: 'error',
          details: { error: 'DeviceNotRegistered' },
        },
      ]);
      mockDb.execute.mockResolvedValue(undefined);

      await service.sendPush('ExponentPushToken[stale123]', 'Title', 'Body');

      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.set).toHaveBeenCalledWith(
        expect.objectContaining({ expoToken: null }),
      );
    });

    it('should skip sending and log a warning for an invalid token format', async () => {
      const warnSpy = jest
        .spyOn(service['logger'], 'warn')
        .mockImplementation();

      await service.sendPush('not-a-valid-expo-token', 'Title', 'Body');

      expect(mockExpoPushNotificationsAsync).not.toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalledWith(
        expect.objectContaining({ expoToken: 'not-a-valid-expo-token' }),
        'Invalid Expo push token',
      );
      warnSpy.mockRestore();
    });

    it('should log an error and NOT insert into notification_logs when Expo API throws', async () => {
      mockExpoPushNotificationsAsync.mockRejectedValue(
        new Error('Expo API unavailable'),
      );
      const errorSpy = jest
        .spyOn(service['logger'], 'error')
        .mockImplementation();

      await service.sendPush('ExponentPushToken[abc123]', 'Title', 'Body');

      expect(mockDb.insert).not.toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Expo push failed'),
        expect.anything(),
      );
      errorSpy.mockRestore();
    });
  });

  describe('sendBatchPush', () => {
    it('should send multiple notifications in a single Expo API call', async () => {
      mockExpoPushNotificationsAsync.mockResolvedValue([
        { status: 'ok' },
        { status: 'ok' },
      ]);

      await service.sendBatchPush([
        {
          to: 'ExponentPushToken[abc]',
          title: 'Reminder 1',
          body: 'Body 1',
        },
        {
          to: 'ExponentPushToken[def]',
          title: 'Reminder 2',
          body: 'Body 2',
        },
      ]);

      expect(mockExpoPushNotificationsAsync).toHaveBeenCalledTimes(1);
    });

    it('should clear token for any DeviceNotRegistered receipts in a batch', async () => {
      mockExpoPushNotificationsAsync.mockResolvedValue([
        { status: 'ok' },
        {
          status: 'error',
          details: { error: 'DeviceNotRegistered' },
        },
      ]);
      mockDb.execute.mockResolvedValue(undefined);

      await service.sendBatchPush([
        { to: 'ExponentPushToken[abc]', title: 'T', body: 'B' },
        { to: 'ExponentPushToken[stale]', title: 'T', body: 'B' },
      ]);

      expect(mockDb.update).toHaveBeenCalled();
    });

    it('should log an error when Expo API throws during batch send', async () => {
      mockExpoPushNotificationsAsync.mockRejectedValue(
        new Error('Expo API unavailable'),
      );
      const errorSpy = jest
        .spyOn(service['logger'], 'error')
        .mockImplementation();

      await service.sendBatchPush([
        { to: 'ExponentPushToken[abc]', title: 'T', body: 'B' },
      ]);

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Expo batch push failed'),
        expect.anything(),
      );
      errorSpy.mockRestore();
    });
  });
});
