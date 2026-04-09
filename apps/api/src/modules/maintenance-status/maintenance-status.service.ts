// apps/api/src/modules/maintenance-status/maintenance-status.service.ts
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { and, desc, eq, or } from 'drizzle-orm';
import { DRIZZLE } from '../../database/database.module';
import type { DrizzleDB } from '../../database/database.types';
import * as schema from '../../database/schema';
import type { MaintenanceStatus, MaintenanceStatusItem } from './types';

function formatLabel(key: string): string {
  return key
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function severityFor(
  status: MaintenanceStatus,
  deltaKm: number | null,
  deltaMonths: number | null,
): number {
  // Lower = more urgent. Overdue < approaching < ok.
  // Within a tier, more overdue (more negative delta) is more urgent.
  const magnitude = deltaKm ?? (deltaMonths != null ? deltaMonths * 1000 : 0);
  if (status === 'overdue') return magnitude; // e.g. -2500 comes first
  if (status === 'approaching') return 1_000_000 + magnitude;
  return 2_000_000 + magnitude;
}

@Injectable()
export class MaintenanceStatusService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async computeForBike(bikeId: string): Promise<MaintenanceStatusItem[]> {
    const bikes = await this.db
      .select()
      .from(schema.bikes)
      .where(eq(schema.bikes.id, bikeId))
      .execute();

    if (bikes.length === 0) {
      throw new NotFoundException('Bike not found');
    }
    const bike = bikes[0];

    const schedules = await this.db
      .select()
      .from(schema.maintenanceSchedules)
      .where(
        or(
          eq(schema.maintenanceSchedules.bikeModel, bike.model),
          bike.make
            ? eq(
                schema.maintenanceSchedules.bikeModel,
                `${bike.make} ${bike.model}`,
              )
            : undefined,
        ),
      )
      .execute();

    if (schedules.length === 0) return [];

    const now = new Date();
    const items: MaintenanceStatusItem[] = [];

    for (const schedule of schedules) {
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
      const lastDate = lastLog ? lastLog.date : null;
      const currentMileage = bike.currentMileage;

      let status: MaintenanceStatus = 'ok';
      let deltaKm: number | null = null;
      let deltaMonths: number | null = null;

      // Mileage-based evaluation
      if (schedule.intervalKm) {
        const used = currentMileage - lastMileage;
        deltaKm = schedule.intervalKm - used; // positive = remaining, negative = over
        if (used >= schedule.intervalKm) {
          status = 'overdue';
        } else if (used >= schedule.intervalKm * 0.8) {
          status = 'approaching';
        }
      }

      // Time-based evaluation (compute deltaMonths for display regardless of trigger)
      if (schedule.intervalMonths && lastDate) {
        const last = new Date(lastDate);
        const monthsElapsed =
          (now.getFullYear() - last.getFullYear()) * 12 +
          (now.getMonth() - last.getMonth());
        deltaMonths = schedule.intervalMonths - monthsElapsed;
        if (status === 'ok') {
          if (monthsElapsed >= schedule.intervalMonths) {
            status = 'overdue';
          } else if (monthsElapsed >= schedule.intervalMonths * 0.8) {
            status = 'approaching';
          }
        }
      }

      items.push({
        key: schedule.serviceType,
        label: formatLabel(schedule.serviceType),
        status,
        severity: severityFor(status, deltaKm, deltaMonths),
        lastMileage: lastLog ? lastMileage : null,
        lastDate,
        currentMileage,
        intervalKm: schedule.intervalKm,
        intervalMonths: schedule.intervalMonths,
        deltaKm,
        deltaMonths,
      });
    }

    items.sort((a, b) => a.severity - b.severity);
    return items;
  }
}
