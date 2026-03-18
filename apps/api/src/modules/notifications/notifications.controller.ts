import {
  Controller,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { ApiKeyGuard } from './guards/api-key.guard';
import {
  CurrentUser,
  AuthUser,
} from '../../common/decorators/current-user.decorator';
import { NotificationsService } from './notifications.service';
import { RegisterTokenDto } from './dto/register-token.dto';
import { ComplianceScannerJob } from './jobs/compliance-scanner.job';
import { MaintenanceReminderJob } from './jobs/maintenance-reminder.job';
import { WorkshopFreshnessJob } from './jobs/workshop-freshness.job';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly complianceJob: ComplianceScannerJob,
    private readonly maintenanceJob: MaintenanceReminderJob,
    private readonly freshnessJob: WorkshopFreshnessJob,
  ) {}

  @Post('register-token')
  @UseGuards(SupabaseAuthGuard)
  async registerToken(
    @CurrentUser() user: AuthUser,
    @Body() dto: RegisterTokenDto,
  ) {
    await this.notificationsService.registerToken(user.id, dto.expoToken);
    return { success: true };
  }

  @Post('trigger-scan')
  @UseGuards(ApiKeyGuard)
  async triggerScan(@Query('job') job?: string) {
    const jobName = job || 'all';

    if (jobName === 'compliance') {
      const result = await this.complianceJob.run();
      return { job: 'compliance', ...result };
    }

    if (jobName === 'maintenance') {
      const result = await this.maintenanceJob.run();
      return { job: 'maintenance', ...result };
    }

    if (jobName === 'freshness') {
      const result = await this.freshnessJob.run();
      return { job: 'freshness', ...result };
    }

    // Default: run all
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
}
