import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DRIZZLE } from '../../database/database.module';
import type { DrizzleDB } from '../../database/database.types';
import * as schema from '../../database/schema';
import { CreateBikeDto } from './dto/create-bike.dto';
import { UpdateBikeDto } from './dto/update-bike.dto';
import { UpdateMileageDto } from './dto/update-mileage.dto';
import { BikeCatalogService } from '../bike-catalog/bike-catalog.service';

@Injectable()
export class BikesService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly bikeCatalogService: BikeCatalogService,
  ) {}

  async create(userId: string, dto: CreateBikeDto) {
    const values = await this.resolveCatalogFields(dto);
    const [bike] = await this.db
      .insert(schema.bikes)
      .values({ userId, ...values })
      .returning();
    return bike;
  }

  private async resolveCatalogFields(
    dto: CreateBikeDto,
  ): Promise<CreateBikeDto> {
    if (!dto.catalogId) return dto;
    const catalog = await this.bikeCatalogService.findOneById(dto.catalogId);
    return {
      ...dto,
      make: catalog.make,
      engineCc: catalog.engineCc ?? undefined,
      bikeType: catalog.bikeType,
      class: catalog.licenseClass,
    };
  }

  async findAllByUser(userId: string) {
    const rows = await this.db
      .select({
        bike: schema.bikes,
        imageUrl: schema.bikeCatalog.imageUrl,
      })
      .from(schema.bikes)
      .leftJoin(
        schema.bikeCatalog,
        eq(schema.bikes.catalogId, schema.bikeCatalog.id),
      )
      .where(eq(schema.bikes.userId, userId));

    return rows.map(({ bike, imageUrl }) => ({
      ...bike,
      imageUrl: imageUrl ?? null,
    }));
  }

  async findOneByUser(bikeId: string, userId: string) {
    const [row] = await this.db
      .select({
        bike: schema.bikes,
        imageUrl: schema.bikeCatalog.imageUrl,
      })
      .from(schema.bikes)
      .leftJoin(
        schema.bikeCatalog,
        eq(schema.bikes.catalogId, schema.bikeCatalog.id),
      )
      .where(and(eq(schema.bikes.id, bikeId), eq(schema.bikes.userId, userId)));

    if (!row) {
      throw new NotFoundException(`Bike ${bikeId} not found`);
    }
    return { ...row.bike, imageUrl: row.imageUrl ?? null };
  }

  async update(bikeId: string, userId: string, dto: UpdateBikeDto) {
    await this.findOneByUser(bikeId, userId);

    const [updated] = await this.db
      .update(schema.bikes)
      .set({ ...dto, updatedAt: new Date() })
      .where(and(eq(schema.bikes.id, bikeId), eq(schema.bikes.userId, userId)))
      .returning();
    return updated;
  }

  async updateMileage(bikeId: string, userId: string, dto: UpdateMileageDto) {
    const bike = await this.findOneByUser(bikeId, userId);

    if (dto.currentMileage < bike.currentMileage) {
      throw new BadRequestException(
        `New mileage (${dto.currentMileage}) cannot be less than current mileage (${bike.currentMileage})`,
      );
    }

    const [updated] = await this.db
      .update(schema.bikes)
      .set({ currentMileage: dto.currentMileage, updatedAt: new Date() })
      .where(and(eq(schema.bikes.id, bikeId), eq(schema.bikes.userId, userId)))
      .returning();
    return updated;
  }

  async remove(bikeId: string, userId: string) {
    await this.findOneByUser(bikeId, userId);

    const [deleted] = await this.db
      .delete(schema.bikes)
      .where(and(eq(schema.bikes.id, bikeId), eq(schema.bikes.userId, userId)))
      .returning();
    return deleted;
  }
}
