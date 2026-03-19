import { Injectable, Inject, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { eq, and, desc } from 'drizzle-orm';
import { DRIZZLE } from '../../../database/database.module';
import type { DrizzleDB } from '../../../database/database.types';
import * as schema from '../../../database/schema';
import { NotificationsService } from '../notifications.service';

interface DueItem {
  serviceType: string;
  tier: 'due' | 'approaching';
  lastMileage: number;
  currentMileage: number;
  intervalKm: number | null;
  timeBased?: boolean;
}

@Injectable()
export class MaintenanceReminderJob {
  private readonly logger = new Logger(MaintenanceReminderJob.name);

  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Cron('0 8 * * 1', { timeZone: 'Asia/Singapore' })
  async handleCron() {
    await this.run();
  }

  async run(): Promise<{ usersNotified: number; notificationsSent: number }> {
    const users = await this.db
      .select()
      .from(schema.users)
      .execute();

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
        const schedules = await this.db
          .select()
          .from(schema.maintenanceSchedules)
          .where(eq(schema.maintenanceSchedules.bikeModel, bike.model))
          .execute();

        if (schedules.length === 0) continue;

        const dueItems: DueItem[] = [];

        for (const schedule of schedules) {
          // Find most recent service_log for this type
          const logs = await this.db
            .select()
            .from(schema.serviceLogs)
            .where(
              and(
                eq(schema.serviceLogs.bikeId, bike.id),
                eq(schema.serviceLogs.serviceType, schedule.serviceType),
              ),
            )
            .orderBy(desc(schema.serviceLogs.date))
            .limit(1)
            .execute();

          const lastLog = logs[0] ?? null;
          const lastMileage = lastLog ? lastLog.mileageAt : 0;
          const currentMileage = bike.currentMileage;

          let tier: 'due' | 'approaching' | null = null;
          let timeBased = false;

          // Check mileage-based
          if (schedule.intervalKm) {
            const used = currentMileage - lastMileage;
            if (used >= schedule.intervalKm) {
              tier = 'due';
            } else if (used >= schedule.intervalKm * 0.8) {
              tier = 'approaching';
            }
          }

          // Check time-based (only if we have a reference date from a log)
          if (!tier && schedule.intervalMonths && lastLog) {
            const lastDate = new Date(lastLog.date);
            const now = new Date();
            const monthsElapsed =
              (now.getFullYear() - lastDate.getFullYear()) * 12 +
              (now.getMonth() - lastDate.getMonth());

            if (monthsElapsed >= schedule.intervalMonths) {
              tier = 'due';
              timeBased = true;
            } else if (monthsElapsed >= schedule.intervalMonths * 0.8) {
              tier = 'approaching';
              timeBased = true;
            }
          }

          if (!tier) continue;

          // Dedup check
          const alreadySent = await this.notificationsService.hasAlreadySent(
            user.id,
            bike.id,
            'maintenance',
            schedule.serviceType,
            tier,
          );

          if (alreadySent) continue;

          dueItems.push({
            serviceType: schedule.serviceType,
            tier,
            lastMileage,
            currentMileage,
            intervalKm: schedule.intervalKm,
            timeBased,
          });
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
            item.serviceType,
            item.tier,
          );
        }

        notifiedUserIds.add(user.id);
        notificationsSent++;
      }
    }

    return {
      usersNotified: notifiedUserIds.size,
      notificationsSent,
    };
  }

  private formatBody(items: DueItem[], bikeModel: string): string {
    if (items.length > 1) {
      const parts = items
        .map((i) => {
          const label = i.serviceType.replace(/_/g, ' ');
          return `${label} (${i.tier === 'due' ? 'overdue' : 'approaching'})`;
        })
        .join(', ');
      return `${items.length} services due on your ${bikeModel}: ${parts}`;
    }

    const item = items[0];
    const label = item.serviceType.replace(/_/g, ' ');

    if (item.tier === 'due') {
      return `${label.charAt(0).toUpperCase() + label.slice(1)} overdue — last done at ${this.formatKm(item.lastMileage)}km, you're now at ${this.formatKm(item.currentMileage)}km`;
    }

    // Approaching — time-based: mention "approaching" explicitly
    if (item.timeBased) {
      return `${label.charAt(0).toUpperCase() + label.slice(1)} approaching — service due soon based on time elapsed`;
    }

    // Approaching — mileage-based: mention km remaining
    const remaining = item.intervalKm
      ? item.intervalKm - (item.currentMileage - item.lastMileage)
      : 0;
    return `You're ${this.formatKm(remaining)}km away from your next ${label}`;
  }

  private formatKm(km: number): string {
    return km >= 1000 ? km.toLocaleString('en-SG') : String(km);
  }
}
