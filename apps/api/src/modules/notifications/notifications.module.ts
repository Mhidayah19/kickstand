import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationsScanService } from './notifications-scan.service';
import { ComplianceScannerJob } from './jobs/compliance-scanner.job';
import { MaintenanceReminderJob } from './jobs/maintenance-reminder.job';
import { WorkshopFreshnessJob } from './jobs/workshop-freshness.job';

@Module({
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationsScanService,
    ComplianceScannerJob,
    MaintenanceReminderJob,
    WorkshopFreshnessJob,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
