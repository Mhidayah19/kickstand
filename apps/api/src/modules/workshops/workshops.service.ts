// src/modules/workshops/workshops.service.ts
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq, and, sql, isNull, isNotNull, or } from 'drizzle-orm';
import { DRIZZLE } from '../../database/database.module';
import type { DrizzleDB } from '../../database/database.types';
import * as schema from '../../database/schema';

@Injectable()
export class WorkshopsService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  private haversineSQL(lat: number, lng: number) {
    return sql<number>`(
      6371 * acos(
        cos(radians(${lat}))
        * cos(radians(${schema.workshops.lat}))
        * cos(radians(${schema.workshops.lng}) - radians(${lng}))
        + sin(radians(${lat}))
        * sin(radians(${schema.workshops.lat}))
      )
    )`;
  }

  async findNearby(params: { lat?: string; lng?: string; radius?: string }) {
    const { lat, lng, radius = '10' } = params;

    if (lat && lng) {
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);
      const radiusNum = parseFloat(radius);
      const distanceExpr = this.haversineSQL(latNum, lngNum);

      return this.db.execute(sql`
        SELECT id, name, address, lat, lng, phone, rating, opening_hours AS "openingHours",
          ${distanceExpr} AS distance
        FROM workshops
        WHERE ${distanceExpr} < ${radiusNum}
        ORDER BY distance ASC
      `);
    }

    return this.db
      .select()
      .from(schema.workshops)
      .where(isNotNull(schema.workshops.id));
  }

  async findOne(workshopId: string) {
    const [workshop] = await this.db
      .select()
      .from(schema.workshops)
      .where(eq(schema.workshops.id, workshopId));

    if (!workshop) {
      throw new NotFoundException(`Workshop ${workshopId} not found`);
    }

    const services = await this.db
      .select()
      .from(schema.workshopServices)
      .where(eq(schema.workshopServices.workshopId, workshopId));

    return {
      workshop,
      services: services.map((s) => WorkshopsService.flagVerificationStatus(s)),
    };
  }

  async compareByService(serviceType: string, bikeModel?: string) {
    const conditions = [eq(schema.workshopServices.serviceType, serviceType)];

    if (bikeModel) {
      conditions.push(
        or(
          eq(schema.workshopServices.bikeModel, bikeModel),
          isNull(schema.workshopServices.bikeModel),
        )!,
      );
    }

    const results = await this.db
      .select({
        workshopId: schema.workshops.id,
        workshopName: schema.workshops.name,
        workshopAddress: schema.workshops.address,
        workshopRating: schema.workshops.rating,
        serviceType: schema.workshopServices.serviceType,
        bikeModel: schema.workshopServices.bikeModel,
        priceMin: schema.workshopServices.priceMin,
        priceMax: schema.workshopServices.priceMax,
        lastVerified: schema.workshopServices.lastVerified,
      })
      .from(schema.workshopServices)
      .innerJoin(
        schema.workshops,
        eq(schema.workshopServices.workshopId, schema.workshops.id),
      )
      .where(and(...conditions));

    return results.map((r) => ({
      ...r,
      ...WorkshopsService.flagVerificationStatus(r),
    }));
  }

  static flagVerificationStatus(entry: {
    lastVerified?: string | Date | null;
  }) {
    if (!entry.lastVerified) {
      return { ...entry, verified: false };
    }
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const lastVerifiedDate = new Date(entry.lastVerified);
    return {
      ...entry,
      verified: lastVerifiedDate >= sixMonthsAgo,
    };
  }
}
