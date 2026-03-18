import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DRIZZLE } from '../../database/database.module';
import { DrizzleDB } from '../../database/database.types';
import * as schema from '../../database/schema';
import { CreateBikeDto } from './dto/create-bike.dto';
import { UpdateBikeDto } from './dto/update-bike.dto';
import { UpdateMileageDto } from './dto/update-mileage.dto';

@Injectable()
export class BikesService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async create(userId: string, dto: CreateBikeDto) {
    const [bike] = await this.db
      .insert(schema.bikes)
      .values({ userId, ...dto })
      .returning();
    return bike;
  }

  async findAllByUser(userId: string) {
    return this.db
      .select()
      .from(schema.bikes)
      .where(eq(schema.bikes.userId, userId));
  }

  async findOneByUser(bikeId: string, userId: string) {
    const [bike] = await this.db
      .select()
      .from(schema.bikes)
      .where(and(eq(schema.bikes.id, bikeId), eq(schema.bikes.userId, userId)));

    if (!bike) {
      throw new NotFoundException(`Bike ${bikeId} not found`);
    }
    return bike;
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
