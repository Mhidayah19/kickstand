import { Injectable, Inject, Logger } from '@nestjs/common';
import { Expo, ExpoPushMessage, ExpoPushErrorTicket } from 'expo-server-sdk';
import { eq, and } from 'drizzle-orm';
import { DRIZZLE } from '../../database/database.module';
import type { DrizzleDB } from '../../database/database.types';
import * as schema from '../../database/schema';

@Injectable()
export class NotificationsService {
  private readonly expo = new Expo();
  private readonly logger = new Logger(NotificationsService.name);

  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async registerToken(userId: string, expoToken: string): Promise<void> {
    await this.db
      .update(schema.users)
      .set({ expoToken })
      .where(eq(schema.users.id, userId));
  }

  async hasAlreadySent(
    userId: string,
    bikeId: string,
    type: string,
    deadlineField: string,
    tier: string,
  ): Promise<boolean> {
    const rows = await this.db
      .select()
      .from(schema.notificationLogs)
      .where(
        and(
          eq(schema.notificationLogs.userId, userId),
          eq(schema.notificationLogs.bikeId, bikeId),
          eq(schema.notificationLogs.type, type),
          eq(schema.notificationLogs.deadlineField, deadlineField),
          eq(schema.notificationLogs.tier, tier),
        ),
      );
    return rows.length > 0;
  }

  async logNotification(
    userId: string,
    bikeId: string,
    type: string,
    deadlineField: string,
    tier: string,
  ): Promise<void> {
    await this.db
      .insert(schema.notificationLogs)
      .values({ userId, bikeId, type, deadlineField, tier });
  }

  async sendPush(
    expoToken: string,
    title: string,
    body: string,
  ): Promise<void> {
    if (!this.expo.isExpoPushToken(expoToken)) {
      console.warn(`Invalid Expo push token: ${expoToken}`);
      return;
    }

    try {
      const tickets = await this.expo.sendPushNotificationsAsync([
        { to: expoToken, title, body },
      ]);

      for (const ticket of tickets) {
        if (
          ticket.status === 'error' &&
          (ticket as ExpoPushErrorTicket).details?.error === 'DeviceNotRegistered'
        ) {
          await this.clearToken(expoToken);
        }
      }
    } catch (error) {
      console.error('Expo push failed:', error);
    }
  }

  async sendBatchPush(messages: ExpoPushMessage[]): Promise<void> {
    const chunks = this.expo.chunkPushNotifications(messages);

    for (const chunk of chunks) {
      try {
        const tickets = await this.expo.sendPushNotificationsAsync(chunk);

        for (let i = 0; i < tickets.length; i++) {
          const ticket = tickets[i];
          if (
            ticket.status === 'error' &&
            (ticket as ExpoPushErrorTicket).details?.error === 'DeviceNotRegistered'
          ) {
            const token = chunk[i].to as string;
            await this.clearToken(token);
          }
        }
      } catch (error) {
        this.logger.error('Expo batch push failed:', error);
      }
    }
  }

  private async clearToken(expoToken: string): Promise<void> {
    await this.db
      .update(schema.users)
      .set({ expoToken: null })
      .where(eq(schema.users.expoToken, expoToken));
  }
}
