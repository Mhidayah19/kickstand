import { Injectable, Inject, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { eq } from 'drizzle-orm';
import * as Sentry from '@sentry/nestjs';
import { DRIZZLE } from '../../../database/database.module';
import type { DrizzleDB } from '../../../database/database.types';
import * as schema from '../../../database/schema';
import { NotificationsService } from '../notifications.service';
import { ComplianceStatusService } from '../../compliance-status/compliance-status.service';
import type { ComplianceStatusItem } from '../../compliance-status/types';

const TIERS = [
  { name: '1d', maxDays: 1 },
  { name: '7d', maxDays: 7 },
  { name: '14d', maxDays: 14 },
  { name: '30d', maxDays: 30 },
] as const;

function tierFor(daysRemaining: number): string | null {
  if (daysRemaining < 0) return 'due';
  for (const tier of TIERS) {
    if (daysRemaining <= tier.maxDays) return tier.name;
  }
  return null;
}

@Injectable()
export class ComplianceScannerJob {
  private readonly logger = new Logger(ComplianceScannerJob.name);

  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly notificationsService: NotificationsService,
    private readonly complianceStatusService: ComplianceStatusService,
  ) {}

  @Cron('0 8 * * *', { timeZone: 'Asia/Singapore' })
  async handleCron() {
    await this.run();
  }

  async run(): Promise<{ usersNotified: number; notificationsSent: number }> {
    this.logger.log('Starting compliance scan');
    try {
      const users = await this.db.select().from(schema.users).execute();
      if (users.length === 0) {
        return { usersNotified: 0, notificationsSent: 0 };
      }

      let notificationsSent = 0;
      const notifiedUserIds = new Set<string>();

      for (const user of users) {
        if (!user.expoToken) continue;

        const bikes = await this.db
          .select()
          .from(schema.bikes)
          .where(eq(schema.bikes.userId, user.id))
          .execute();

        for (const bike of bikes) {
          const items = await this.complianceStatusService.computeForBike(
            bike.id,
          );
          for (const item of items) {
            if (item.status === 'ok') continue;

            const tier = tierFor(item.daysRemaining);
            if (!tier) continue;

            const alreadySent = await this.notificationsService.hasAlreadySent(
              user.id,
              bike.id,
              'compliance',
              item.key,
              tier,
            );
            if (alreadySent) continue;

            const body = this.formatBody(item, bike.model);
            await this.notificationsService.sendBatchPush([
              { to: user.expoToken, title: 'Kickstand Compliance', body },
            ]);

            await this.notificationsService.logNotification(
              user.id,
              bike.id,
              'compliance',
              item.key,
              tier, // tier is string: 'due' for overdue, '1d'/'7d'/'14d'/'30d' for approaching windows
            );

            notifiedUserIds.add(user.id);
            notificationsSent++;
          }
        }
      }

      this.logger.log(
        { usersNotified: notifiedUserIds.size, notificationsSent },
        'Compliance scan complete',
      );

      return { usersNotified: notifiedUserIds.size, notificationsSent };
    } catch (error: unknown) {
      this.logger.error({ error }, 'Compliance scan failed');
      Sentry.captureException(error);
      throw error;
    }
  }

  private formatBody(item: ComplianceStatusItem, bikeModel: string): string {
    if (item.status === 'overdue') {
      return `${item.label} overdue on your ${bikeModel} — expired ${Math.abs(item.daysRemaining)} day${Math.abs(item.daysRemaining) === 1 ? '' : 's'} ago`;
    }
    return `${item.label} due in ${item.daysRemaining} day${item.daysRemaining === 1 ? '' : 's'} on your ${bikeModel}`;
  }
}
