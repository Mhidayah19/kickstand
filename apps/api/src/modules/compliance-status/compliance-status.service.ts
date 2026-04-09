import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '../../database/database.module';
import type { DrizzleDB } from '../../database/database.types';
import * as schema from '../../database/schema';
import type {
  ComplianceField,
  ComplianceStatus,
  ComplianceStatusItem,
} from './types';

const FIELDS: { key: ComplianceField; label: string }[] = [
  { key: 'roadTaxExpiry', label: 'Road Tax' },
  { key: 'insuranceExpiry', label: 'Insurance' },
  { key: 'inspectionDue', label: 'Inspection' },
  { key: 'coeExpiry', label: 'COE' },
];

const APPROACHING_WINDOW_DAYS = 30;

function daysBetween(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function severityFor(status: ComplianceStatus, daysRemaining: number): number {
  if (status === 'overdue') return daysRemaining;
  if (status === 'approaching') return 1_000_000 + daysRemaining;
  return 2_000_000 + daysRemaining;
}

@Injectable()
export class ComplianceStatusService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async computeForBike(bikeId: string): Promise<ComplianceStatusItem[]> {
    const bikes = await this.db
      .select()
      .from(schema.bikes)
      .where(eq(schema.bikes.id, bikeId))
      .execute();

    if (bikes.length === 0) {
      throw new NotFoundException('Bike not found');
    }
    const bike = bikes[0] as Record<ComplianceField, string | null> & {
      id: string;
    };

    const now = new Date();
    now.setUTCHours(0, 0, 0, 0);

    const items: ComplianceStatusItem[] = [];

    for (const { key, label } of FIELDS) {
      const value = bike[key];
      if (!value) continue;

      const expiry = new Date(value);
      const daysRemaining = daysBetween(now, expiry);

      let status: ComplianceStatus = 'ok';
      if (daysRemaining < 0) status = 'overdue';
      else if (daysRemaining <= APPROACHING_WINDOW_DAYS) status = 'approaching';

      items.push({
        key,
        label,
        status,
        severity: severityFor(status, daysRemaining),
        expiresAt: value,
        daysRemaining,
      });
    }

    items.sort((a, b) => a.severity - b.severity);
    return items;
  }
}
