import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq, count } from 'drizzle-orm';
import { DRIZZLE } from '../../database/database.module';
import type { DrizzleDB } from '../../database/database.types';
import * as schema from '../../database/schema';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  private readonly profileColumns = {
    id: schema.users.id,
    email: schema.users.email,
    name: schema.users.name,
    avatarUrl: schema.users.avatarUrl,
    createdAt: schema.users.createdAt,
  };

  private async getBikeCount(userId: string): Promise<number> {
    const [row] = await this.db
      .select({ count: count() })
      .from(schema.bikes)
      .where(eq(schema.bikes.userId, userId));
    return row?.count ?? 0;
  }

  async getProfile(userId: string) {
    const [[user], bikeCount] = await Promise.all([
      this.db
        .select(this.profileColumns)
        .from(schema.users)
        .where(eq(schema.users.id, userId)),
      this.getBikeCount(userId),
    ]);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return { ...user, bikeCount };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const fields: Record<string, unknown> = {};
    if (dto.name !== undefined) fields.name = dto.name;
    if (dto.avatarUrl !== undefined) fields.avatarUrl = dto.avatarUrl || null;

    if (Object.keys(fields).length > 0) {
      const [updated] = await this.db
        .update(schema.users)
        .set({ ...fields, updatedAt: new Date() })
        .where(eq(schema.users.id, userId))
        .returning({ id: schema.users.id });

      if (!updated) {
        throw new NotFoundException('User not found');
      }
    }

    return this.getProfile(userId);
  }
}
