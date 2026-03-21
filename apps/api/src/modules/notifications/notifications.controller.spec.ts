import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationsScanService } from './notifications-scan.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { ApiKeyGuard } from './guards/api-key.guard';

describe('NotificationsController', () => {
  let controller: NotificationsController;

  const mockService = {
    registerToken: jest.fn(),
  };

  const mockScanService = { run: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        { provide: NotificationsService, useValue: mockService },
        { provide: NotificationsScanService, useValue: mockScanService },
      ],
    })
      .overrideGuard(SupabaseAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(ApiKeyGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<NotificationsController>(NotificationsController);
  });

  describe('POST /notifications/register-token', () => {
    it('should register the expo token for the authenticated user', async () => {
      mockService.registerToken.mockResolvedValue(undefined);

      const result = await controller.registerToken({ id: 'user-1' } as any, {
        expoToken: 'ExponentPushToken[abc123]',
      });

      expect(mockService.registerToken).toHaveBeenCalledWith(
        'user-1',
        'ExponentPushToken[abc123]',
      );
      expect(result).toEqual({ success: true });
    });
  });

  describe('POST /notifications/trigger-scan', () => {
    it('should run only the compliance job when job=compliance', async () => {
      mockScanService.run.mockResolvedValue({
        job: 'compliance',
        usersNotified: 2,
        notificationsSent: 3,
      });

      const result = await controller.triggerScan('compliance');

      expect(mockScanService.run).toHaveBeenCalledWith('compliance');
      expect(result).toEqual({
        job: 'compliance',
        usersNotified: 2,
        notificationsSent: 3,
      });
    });

    it('should run only the maintenance job when job=maintenance', async () => {
      mockScanService.run.mockResolvedValue({
        job: 'maintenance',
        usersNotified: 1,
        notificationsSent: 2,
      });

      const result = await controller.triggerScan('maintenance');

      expect(mockScanService.run).toHaveBeenCalledWith('maintenance');
      expect(result).toEqual({
        job: 'maintenance',
        usersNotified: 1,
        notificationsSent: 2,
      });
    });

    it('should run only the freshness job when job=freshness', async () => {
      mockScanService.run.mockResolvedValue({
        job: 'freshness',
        usersNotified: 0,
        notificationsSent: 0,
      });

      const result = await controller.triggerScan('freshness');

      expect(mockScanService.run).toHaveBeenCalledWith('freshness');
      expect(result).toEqual({
        job: 'freshness',
        usersNotified: 0,
        notificationsSent: 0,
      });
    });

    it('should run all jobs and sum their counts when job=all', async () => {
      mockScanService.run.mockResolvedValue({
        job: 'all',
        usersNotified: 2,
        notificationsSent: 3,
      });

      const result = await controller.triggerScan('all');

      expect(mockScanService.run).toHaveBeenCalledWith('all');
      expect(result).toEqual({
        job: 'all',
        usersNotified: 2,
        notificationsSent: 3,
      });
    });

    it('should default to running all jobs when no job param is provided', async () => {
      mockScanService.run.mockResolvedValue({
        job: 'all',
        usersNotified: 0,
        notificationsSent: 0,
      });

      const result = await controller.triggerScan(undefined as any);

      expect(mockScanService.run).toHaveBeenCalledWith(undefined);
      expect(result).toMatchObject({ job: 'all' });
    });
  });
});
