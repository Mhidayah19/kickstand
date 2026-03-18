import { Injectable, Inject, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { lt } from 'drizzle-orm';
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
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const cutoff = sixMonthsAgo.toISOString().split('T')[0];

    const staleEntries = await this.db
      .select()
      .from(schema.workshopServices)
      .where(lt(schema.workshopServices.lastVerified, cutoff))
      .execute();

    console.log(
      `Workshop freshness check: ${staleEntries.length} stale entries found`,
    );

    return { usersNotified: 0, notificationsSent: 0 };
  }
}
