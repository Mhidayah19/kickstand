import { Injectable, Inject, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { lt } from 'drizzle-orm';
import * as Sentry from '@sentry/nestjs';
import { DRIZZLE } from '../../../database/database.module';
import type { DrizzleDB } from '../../../database/database.types';
import * as schema from '../../../database/schema';

@Injectable()
export class WorkshopFreshnessJob {
  private readonly logger = new Logger(WorkshopFreshnessJob.name);

  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  @Cron('0 0 1 * *', { timeZone: 'Asia/Singapore' })
  async handleCron() {
    await this.run();
  }

  async run(): Promise<{ usersNotified: number; notificationsSent: number }> {
    this.logger.log('Starting workshop freshness check');
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const cutoff = sixMonthsAgo.toISOString().split('T')[0];

      const staleEntries = await this.db
        .select()
        .from(schema.workshopServices)
        .where(lt(schema.workshopServices.lastVerified, cutoff))
        .execute();

      this.logger.log(
        { staleEntries: staleEntries.length },
        'Workshop freshness check complete',
      );

      return { usersNotified: 0, notificationsSent: 0 };
    } catch (error: unknown) {
      this.logger.error({ error }, 'Workshop freshness check failed');
      Sentry.captureException(error);
      throw error;
    }
  }
}
