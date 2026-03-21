import { Injectable } from '@nestjs/common';
import { ComplianceScannerJob } from './jobs/compliance-scanner.job';
import { MaintenanceReminderJob } from './jobs/maintenance-reminder.job';
import { WorkshopFreshnessJob } from './jobs/workshop-freshness.job';

type ScanJobName = 'compliance' | 'maintenance' | 'freshness';
type ScanTarget = ScanJobName | 'all';

export interface ScanResult {
  usersNotified: number;
  notificationsSent: number;
}

@Injectable()
export class NotificationsScanService {
  constructor(
    private readonly complianceJob: ComplianceScannerJob,
    private readonly maintenanceJob: MaintenanceReminderJob,
    private readonly freshnessJob: WorkshopFreshnessJob,
  ) {}

  async run(job?: string): Promise<{ job: ScanTarget } & ScanResult> {
    const target = this.normalizeJob(job);

    if (target !== 'all') {
      return { job: target, ...(await this.runJob(target)) };
    }

    const [compliance, maintenance, freshness] = await Promise.all([
      this.complianceJob.run(),
      this.maintenanceJob.run(),
      this.freshnessJob.run(),
    ]);

    return {
      job: 'all',
      usersNotified:
        compliance.usersNotified +
        maintenance.usersNotified +
        freshness.usersNotified,
      notificationsSent:
        compliance.notificationsSent +
        maintenance.notificationsSent +
        freshness.notificationsSent,
    };
  }

  private normalizeJob(job?: string): ScanTarget {
    if (job === 'compliance' || job === 'maintenance' || job === 'freshness') {
      return job;
    }

    return 'all';
  }

  private async runJob(job: ScanJobName): Promise<ScanResult> {
    switch (job) {
      case 'compliance':
        return this.complianceJob.run();
      case 'maintenance':
        return this.maintenanceJob.run();
      case 'freshness':
        return this.freshnessJob.run();
    }
  }
}
