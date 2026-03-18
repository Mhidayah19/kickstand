import { Injectable, Inject, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { or, and, gte, lte, eq, isNotNull } from 'drizzle-orm';
import { DRIZZLE } from '../../../database/database.module';
import type { DrizzleDB } from '../../../database/database.types';
import * as schema from '../../../database/schema';
import { NotificationsService } from '../notifications.service';

const DEADLINE_FIELDS = [
  'coeExpiry',
  'roadTaxExpiry',
  'insuranceExpiry',
  'inspectionDue',
] as const;

const DEADLINE_LABELS: Record<string, string> = {
  coeExpiry: 'COE',
  roadTaxExpiry: 'road tax',
  insuranceExpiry: 'insurance',
  inspectionDue: 'inspection',
};

const TIERS = [
  { name: '30d', minDays: 29, maxDays: 30 },
  { name: '14d', minDays: 13, maxDays: 14 },
  { name: '7d', minDays: 6, maxDays: 7 },
  { name: '1d', minDays: 0, maxDays: 1 },
] as const;

@Injectable()
export class ComplianceScannerJob {
  private readonly logger = new Logger(ComplianceScannerJob.name);

  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Cron('0 8 * * *', { timeZone: 'Asia/Singapore' })
  async handleCron() {
    await this.run();
  }

  async run(): Promise<{ usersNotified: number; notificationsSent: number }> {
    const today = new Date();
    let totalSent = 0;
    const notifiedUserIds = new Set<string>();

    for (const tier of TIERS) {
      const minDate = new Date(today);
      minDate.setUTCDate(minDate.getUTCDate() + tier.minDays);
      const maxDate = new Date(today);
      maxDate.setUTCDate(maxDate.getUTCDate() + tier.maxDays);

      const minStr = minDate.toISOString().split('T')[0];
      const maxStr = maxDate.toISOString().split('T')[0];

      const bikeColumns = {
        id: schema.bikes.id,
        userId: schema.bikes.userId,
        coeExpiry: schema.bikes.coeExpiry,
        roadTaxExpiry: schema.bikes.roadTaxExpiry,
        insuranceExpiry: schema.bikes.insuranceExpiry,
        inspectionDue: schema.bikes.inspectionDue,
        expoToken: schema.users.expoToken,
      };

      const rows = await this.db
        .select(bikeColumns)
        .from(schema.bikes)
        .innerJoin(schema.users, eq(schema.bikes.userId, schema.users.id))
        .where(
          and(
            isNotNull(schema.users.expoToken),
            or(
              and(
                gte(schema.bikes.coeExpiry, minStr),
                lte(schema.bikes.coeExpiry, maxStr),
              ),
              and(
                gte(schema.bikes.roadTaxExpiry, minStr),
                lte(schema.bikes.roadTaxExpiry, maxStr),
              ),
              and(
                gte(schema.bikes.insuranceExpiry, minStr),
                lte(schema.bikes.insuranceExpiry, maxStr),
              ),
              and(
                gte(schema.bikes.inspectionDue, minStr),
                lte(schema.bikes.inspectionDue, maxStr),
              ),
            ),
          ),
        )
        .execute();

      if (rows.length === 0) continue;

      const messages: { to: string; title: string; body: string }[] = [];

      for (const row of rows) {
        if (!row.expoToken) continue;

        const unsentFields: string[] = [];

        for (const field of DEADLINE_FIELDS) {
          const value = row[field] as string | null;
          if (!value) continue;

          const deadline = new Date(value);
          if (deadline < minDate || deadline > maxDate) continue;

          const alreadySent = await this.notificationsService.hasAlreadySent(
            row.userId,
            row.id,
            'compliance',
            field,
            tier.name,
          );

          if (!alreadySent) {
            unsentFields.push(field);
          }
        }

        if (unsentFields.length === 0) continue;

        const body = this.formatBody(unsentFields, tier.name, row);
        messages.push({
          to: row.expoToken,
          title: 'Kickstand Reminder',
          body,
        });

        for (const field of unsentFields) {
          await this.notificationsService.logNotification(
            row.userId,
            row.id,
            'compliance',
            field,
            tier.name,
          );
        }

        notifiedUserIds.add(row.userId);
        totalSent++;
      }

      if (messages.length > 0) {
        await this.notificationsService.sendBatchPush(messages);
      }
    }

    return {
      usersNotified: notifiedUserIds.size,
      notificationsSent: totalSent,
    };
  }

  private formatBody(
    fields: string[],
    tier: string,
    row: Record<string, any>,
  ): string {
    if (fields.length > 1) {
      const items = fields
        .map((f) => {
          const label = DEADLINE_LABELS[f] || f;
          const dateStr = row[f] as string;
          const formatted = this.formatDate(dateStr);
          return `${label} (${formatted})`;
        })
        .join(' and ');
      return `${fields.length} deadlines coming up: ${items}`;
    }

    const field = fields[0];
    const label = DEADLINE_LABELS[field] || field;
    const dateStr = row[field] as string;

    switch (tier) {
      case '30d':
        return `Heads up — your ${label} expires on ${this.formatDate(dateStr)}`;
      case '14d':
        return `Your ${label} expires in 2 weeks`;
      case '7d':
        return `${label.charAt(0).toUpperCase() + label.slice(1)} expires in 7 days — don't forget`;
      case '1d':
        return `${label.charAt(0).toUpperCase() + label.slice(1)} expires TOMORROW`;
      default:
        return `Your ${label} is expiring soon`;
    }
  }

  private formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    return `${d.getUTCDate()} ${months[d.getUTCMonth()]}`;
  }
}
