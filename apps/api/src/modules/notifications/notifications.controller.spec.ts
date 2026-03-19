import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { ApiKeyGuard } from './guards/api-key.guard';
import { ComplianceScannerJob } from './jobs/compliance-scanner.job';
import { MaintenanceReminderJob } from './jobs/maintenance-reminder.job';
import { WorkshopFreshnessJob } from './jobs/workshop-freshness.job';

describe('NotificationsController', () => {
  let controller: NotificationsController;

  const mockService = {
    registerToken: jest.fn(),
  };

  const mockComplianceJob = { run: jest.fn() };
  const mockMaintenanceJob = { run: jest.fn() };
  const mockFreshnessJob = { run: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        { provide: NotificationsService, useValue: mockService },
        { provide: ComplianceScannerJob, useValue: mockComplianceJob },
        { provide: MaintenanceReminderJob, useValue: mockMaintenanceJob },
        { provide: WorkshopFreshnessJob, useValue: mockFreshnessJob },
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

      const result = await controller.registerToken(
        { id: 'user-1' } as any,
        { expoToken: 'ExponentPushToken[abc123]' },
      );

      expect(mockService.registerToken).toHaveBeenCalledWith(
        'user-1',
        'ExponentPushToken[abc123]',
      );
      expect(result).toEqual({ success: true });
    });
  });

  describe('POST /notifications/trigger-scan', () => {
    it('should run only the compliance job when job=compliance', async () => {
      mockComplianceJob.run.mockResolvedValue({
        usersNotified: 2,
        notificationsSent: 3,
      });

      const result = await controller.triggerScan('compliance');

      expect(mockComplianceJob.run).toHaveBeenCalled();
      expect(mockMaintenanceJob.run).not.toHaveBeenCalled();
      expect(mockFreshnessJob.run).not.toHaveBeenCalled();
      expect(result).toEqual({
        job: 'compliance',
        usersNotified: 2,
        notificationsSent: 3,
      });
    });

    it('should run only the maintenance job when job=maintenance', async () => {
      mockMaintenanceJob.run.mockResolvedValue({
        usersNotified: 1,
        notificationsSent: 2,
      });

      const result = await controller.triggerScan('maintenance');

      expect(mockMaintenanceJob.run).toHaveBeenCalled();
      expect(mockComplianceJob.run).not.toHaveBeenCalled();
      expect(mockFreshnessJob.run).not.toHaveBeenCalled();
      expect(result).toEqual({
        job: 'maintenance',
        usersNotified: 1,
        notificationsSent: 2,
      });
    });

    it('should run only the freshness job when job=freshness', async () => {
      mockFreshnessJob.run.mockResolvedValue({
        usersNotified: 0,
        notificationsSent: 0,
      });

      const result = await controller.triggerScan('freshness');

      expect(mockFreshnessJob.run).toHaveBeenCalled();
      expect(mockComplianceJob.run).not.toHaveBeenCalled();
      expect(mockMaintenanceJob.run).not.toHaveBeenCalled();
      expect(result).toEqual({
        job: 'freshness',
        usersNotified: 0,
        notificationsSent: 0,
      });
    });

    it('should run all jobs and sum their counts when job=all', async () => {
      mockComplianceJob.run.mockResolvedValue({
        usersNotified: 2,
        notificationsSent: 3,
      });
      mockMaintenanceJob.run.mockResolvedValue({
        usersNotified: 1,
        notificationsSent: 2,
      });
      mockFreshnessJob.run.mockResolvedValue({
        usersNotified: 0,
        notificationsSent: 0,
      });

      const result = await controller.triggerScan('all');

      expect(mockComplianceJob.run).toHaveBeenCalled();
      expect(mockMaintenanceJob.run).toHaveBeenCalled();
      expect(mockFreshnessJob.run).toHaveBeenCalled();
      expect(result).toEqual({
        job: 'all',
        usersNotified: 3,
        notificationsSent: 5,
      });
    });

    it('should default to running all jobs when no job param is provided', async () => {
      mockComplianceJob.run.mockResolvedValue({
        usersNotified: 0,
        notificationsSent: 0,
      });
      mockMaintenanceJob.run.mockResolvedValue({
        usersNotified: 0,
        notificationsSent: 0,
      });
      mockFreshnessJob.run.mockResolvedValue({
        usersNotified: 0,
        notificationsSent: 0,
      });

      const result = await controller.triggerScan(undefined as any);

      expect(mockComplianceJob.run).toHaveBeenCalled();
      expect(mockMaintenanceJob.run).toHaveBeenCalled();
      expect(mockFreshnessJob.run).toHaveBeenCalled();
      expect(result).toMatchObject({ job: 'all' });
    });
  });
});
