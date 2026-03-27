import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq, and, desc, count } from 'drizzle-orm';
import { DRIZZLE } from '../../database/database.module';
import type { DrizzleDB } from '../../database/database.types';
import * as schema from '../../database/schema';
import { BikesService } from '../bikes/bikes.service';
import { CreateServiceLogDto } from './dto/create-service-log.dto';

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

    const data = await this.db
      .select()
      .from(schema.serviceLogs)
      .where(eq(schema.serviceLogs.bikeId, bikeId))
      .orderBy(desc(schema.serviceLogs.date))
      .limit(limit)
      .offset(offset);

    return { data, meta: { page, limit, total } };
  }

  async findAllByUser(userId: string, page: number, limit: number) {
    const offset = (page - 1) * limit;

    const [totalResult] = await this.db
      .select({ count: count() })
      .from(schema.serviceLogs)
      .innerJoin(schema.bikes, eq(schema.serviceLogs.bikeId, schema.bikes.id))
      .where(eq(schema.bikes.userId, userId));

    const total = totalResult?.count ?? 0;

    const data = await this.db
      .select({
        id: schema.serviceLogs.id,
        bikeId: schema.serviceLogs.bikeId,
        workshopId: schema.serviceLogs.workshopId,
        serviceType: schema.serviceLogs.serviceType,
        description: schema.serviceLogs.description,
        cost: schema.serviceLogs.cost,
        mileageAt: schema.serviceLogs.mileageAt,
        date: schema.serviceLogs.date,
        receiptUrl: schema.serviceLogs.receiptUrl,
        createdAt: schema.serviceLogs.createdAt,
        updatedAt: schema.serviceLogs.updatedAt,
      })
      .from(schema.serviceLogs)
      .innerJoin(schema.bikes, eq(schema.serviceLogs.bikeId, schema.bikes.id))
      .where(eq(schema.bikes.userId, userId))
      .orderBy(desc(schema.serviceLogs.date))
      .limit(limit)
      .offset(offset);

    return { data, meta: { page, limit, total } };
  }

  async create(bikeId: string, userId: string, dto: CreateServiceLogDto) {
    await this.bikesService.findOneByUser(bikeId, userId);

    const [log] = await this.db
      .insert(schema.serviceLogs)
      .values({ bikeId, ...dto })
      .returning();

    return log;
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
      throw new NotFoundException(`Service log ${logId} not found`);
    }

    const [deleted] = await this.db
      .delete(schema.serviceLogs)
      .where(eq(schema.serviceLogs.id, logId))
      .returning();

    return deleted;
  }
}
