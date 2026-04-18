import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq, and, desc, count } from 'drizzle-orm';
import { DRIZZLE } from '../../database/database.module';
import type { DrizzleDB } from '../../database/database.types';
import * as schema from '../../database/schema';
import { BikesService } from '../bikes/bikes.service';
import { CreateServiceLogDto } from './dto/create-service-log.dto';
import { UpdateServiceLogDto } from './dto/update-service-log.dto';

function normalizeWorkshop<
  T extends {
    workshop: {
      id: string | null;
      name: string | null;
      address: string | null;
    } | null;
  },
>(row: T) {
  const { workshop } = row;
  return {
    ...row,
    workshop:
      workshop && workshop.id
        ? { id: workshop.id, name: workshop.name!, address: workshop.address! }
        : null,
  };
}

const logWithWorkshopColumns = {
  id: schema.serviceLogs.id,
  bikeId: schema.serviceLogs.bikeId,
  workshopId: schema.serviceLogs.workshopId,
  serviceType: schema.serviceLogs.serviceType,
  description: schema.serviceLogs.description,
  parts: schema.serviceLogs.parts,
  cost: schema.serviceLogs.cost,
  mileageAt: schema.serviceLogs.mileageAt,
  date: schema.serviceLogs.date,
  receiptUrls: schema.serviceLogs.receiptUrls,
  createdAt: schema.serviceLogs.createdAt,
  updatedAt: schema.serviceLogs.updatedAt,
  workshop: {
    id: schema.workshops.id,
    name: schema.workshops.name,
    address: schema.workshops.address,
  },
} as const;

@Injectable()
export class ServiceLogsService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly bikesService: BikesService,
  ) {}

  async findAllByBike(
    bikeId: string,
    userId: string,
    page: number,
    limit: number,
  ) {
    await this.bikesService.findOneByUser(bikeId, userId);

    const offset = (page - 1) * limit;

    const [totalResult] = await this.db
      .select({ count: count() })
      .from(schema.serviceLogs)
      .where(eq(schema.serviceLogs.bikeId, bikeId));

    const total = totalResult?.count ?? 0;

    const rows = await this.db
      .select(logWithWorkshopColumns)
      .from(schema.serviceLogs)
      .leftJoin(
        schema.workshops,
        eq(schema.serviceLogs.workshopId, schema.workshops.id),
      )
      .where(eq(schema.serviceLogs.bikeId, bikeId))
      .orderBy(desc(schema.serviceLogs.date))
      .limit(limit)
      .offset(offset);

    return {
      data: rows.map((row) => normalizeWorkshop(row)),
      meta: { page, limit, total },
    };
  }

  async findAllByUser(userId: string, page: number, limit: number) {
    const offset = (page - 1) * limit;

    const [totalResult] = await this.db
      .select({ count: count() })
      .from(schema.serviceLogs)
      .innerJoin(schema.bikes, eq(schema.serviceLogs.bikeId, schema.bikes.id))
      .where(eq(schema.bikes.userId, userId));

    const total = totalResult?.count ?? 0;

    const rows = await this.db
      .select(logWithWorkshopColumns)
      .from(schema.serviceLogs)
      .innerJoin(schema.bikes, eq(schema.serviceLogs.bikeId, schema.bikes.id))
      .leftJoin(
        schema.workshops,
        eq(schema.serviceLogs.workshopId, schema.workshops.id),
      )
      .where(eq(schema.bikes.userId, userId))
      .orderBy(desc(schema.serviceLogs.date))
      .limit(limit)
      .offset(offset);

    return {
      data: rows.map((row) => normalizeWorkshop(row)),
      meta: { page, limit, total },
    };
  }

  async create(bikeId: string, userId: string, dto: CreateServiceLogDto) {
    await this.bikesService.findOneByUser(bikeId, userId);

    const [log] = await this.db
      .insert(schema.serviceLogs)
      .values({ bikeId, ...dto })
      .returning();

    return log;
  }

  async findOne(logId: string, bikeId: string, userId: string) {
    await this.bikesService.findOneByUser(bikeId, userId);

    const [row] = await this.db
      .select(logWithWorkshopColumns)
      .from(schema.serviceLogs)
      .leftJoin(
        schema.workshops,
        eq(schema.serviceLogs.workshopId, schema.workshops.id),
      )
      .where(
        and(
          eq(schema.serviceLogs.id, logId),
          eq(schema.serviceLogs.bikeId, bikeId),
        ),
      );

    if (!row) {
      throw new NotFoundException('Service log not found');
    }

    return normalizeWorkshop(row);
  }

  async update(
    logId: string,
    bikeId: string,
    userId: string,
    dto: UpdateServiceLogDto,
  ) {
    await this.bikesService.findOneByUser(bikeId, userId);

    return this.db.transaction(async (tx) => {
      const scope = and(
        eq(schema.serviceLogs.id, logId),
        eq(schema.serviceLogs.bikeId, bikeId),
      );

      const [existing] = await tx
        .select()
        .from(schema.serviceLogs)
        .where(scope);

      if (!existing) {
        throw new NotFoundException('Service log not found');
      }

      const patch = Object.fromEntries(
        Object.entries(dto).filter(([, v]) => v !== undefined),
      );
      await tx.update(schema.serviceLogs).set(patch).where(scope);

      const [row] = await tx
        .select(logWithWorkshopColumns)
        .from(schema.serviceLogs)
        .leftJoin(
          schema.workshops,
          eq(schema.serviceLogs.workshopId, schema.workshops.id),
        )
        .where(scope);

      return normalizeWorkshop(row);
    });
  }

  async remove(logId: string, bikeId: string, userId: string) {
    await this.bikesService.findOneByUser(bikeId, userId);

    const [existing] = await this.db
      .select()
      .from(schema.serviceLogs)
      .where(
        and(
          eq(schema.serviceLogs.id, logId),
          eq(schema.serviceLogs.bikeId, bikeId),
        ),
      );

    if (!existing) {
      throw new NotFoundException('Service log not found');
    }

    const [deleted] = await this.db
      .delete(schema.serviceLogs)
      .where(eq(schema.serviceLogs.id, logId))
      .returning();

    return deleted;
  }
}
