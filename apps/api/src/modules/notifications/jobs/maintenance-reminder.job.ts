import { Injectable, Inject, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { eq } from 'drizzle-orm';
import * as Sentry from '@sentry/nestjs';
import { DRIZZLE } from '../../../database/database.module';
import type { DrizzleDB } from '../../../database/database.types';
import * as schema from '../../../database/schema';
import { NotificationsService } from '../notifications.service';
import { MaintenanceStatusService } from '../../maintenance-status/maintenance-status.service';
import type { MaintenanceStatusItem } from '../../maintenance-status/types';

@Injectable()
export class MaintenanceReminderJob {
  private readonly logger = new Logger(MaintenanceReminderJob.name);

  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly notificationsService: NotificationsService,
    private readonly maintenanceStatusService: MaintenanceStatusService,
  ) {}

  @Cron('0 8 * * 1', { timeZone: 'Asia/Singapore' })
  async handleCron() {
    await this.run();
  }

  async run(): Promise<{ usersNotified: number; notificationsSent: number }> {
    this.logger.log('Starting maintenance reminder scan');
    try {
      const users = await this.db.select().from(schema.users).execute();
      if (users.length === 0) {
        this.logger.log('No users found, skipping maintenance reminder scan');
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
          const items = await this.maintenanceStatusService.computeForBike(
            bike.id,
          );
          const dueItems: MaintenanceStatusItem[] = [];

          for (const item of items) {
            if (item.status === 'ok') continue;

            const alreadySent = await this.notificationsService.hasAlreadySent(
              user.id,
              bike.id,
              'maintenance',
              item.key,
              item.status === 'overdue' ? 'due' : 'approaching',
            );
            if (alreadySent) continue;

            dueItems.push(item);
          }

          if (dueItems.length === 0) continue;

          const body = this.formatBody(dueItems, bike.model);
          await this.notificationsService.sendBatchPush([
            { to: user.expoToken, title: 'Kickstand Maintenance', body },
          ]);

          for (const item of dueItems) {
            await this.notificationsService.logNotification(
              user.id,
              bike.id,
              'maintenance',
              item.key,
              item.status === 'overdue' ? 'due' : 'approaching',
            );
          }

          notifiedUserIds.add(user.id);
          notificationsSent++;
        }
      }

      this.logger.log(
        { usersNotified: notifiedUserIds.size, notificationsSent },
        'Maintenance reminder scan complete',
      );

      return { usersNotified: notifiedUserIds.size, notificationsSent };
    } catch (error: unknown) {
      this.logger.error({ error }, 'Maintenance reminder scan failed');
      Sentry.captureException(error);
      throw error;
    }
  }

  private formatBody(
    items: MaintenanceStatusItem[],
    bikeModel: string,
  ): string {
    if (items.length > 1) {
      const parts = items
        .map(
          (i) =>
            `${i.label} (${i.status === 'overdue' ? 'overdue' : 'approaching'})`,
        )
        .join(', ');
      return `${items.length} services due on your ${bikeModel}: ${parts}`;
    }

    const item = items[0];

    if (item.status === 'overdue') {
      return `${item.label} overdue — last done at ${this.formatKm(item.lastMileage ?? 0)}km, you're now at ${this.formatKm(item.currentMileage)}km`;
    }

    // Detect time-triggered approaching: schedule has intervalKm but km used < 80% threshold
    const kmUsed =
      item.intervalKm != null && item.deltaKm != null
        ? item.intervalKm - item.deltaKm
        : null;
    const kmTriggered =
      kmUsed != null &&
      item.intervalKm != null &&
      kmUsed >= item.intervalKm * 0.8;

    if (!kmTriggered) {
      return `${item.label} approaching — service due soon based on time elapsed`;
    }

    const remaining = item.deltaKm ?? 0;
    return `You're ${this.formatKm(remaining)}km away from your next ${item.label}`;
  }

  private formatKm(km: number): string {
    return km >= 1000 ? km.toLocaleString('en-SG') : String(km);
  }
}
