// src/modules/workshops/workshops.service.ts
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq, and, sql, isNull, or, ilike } from 'drizzle-orm';
import { DRIZZLE } from '../../database/database.module';
import type { DrizzleDB } from '../../database/database.types';
import * as schema from '../../database/schema';
import { PlacesClient } from './places/places.client';
import type {
  AutocompleteParams,
  PlacesAutocompleteSuggestion,
} from './places/places.types';

@Injectable()
export class WorkshopsService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly places: PlacesClient,
  ) {}

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

    return this.db.select().from(schema.workshops);
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

  async searchPlaces(
    params: AutocompleteParams,
  ): Promise<PlacesAutocompleteSuggestion[]> {
    return this.places.autocomplete(params);
  }

  async upsertFromPlace(params: { placeId: string; sessionToken: string }) {
    const [existing] = await this.db
      .select()
      .from(schema.workshops)
      .where(eq(schema.workshops.googlePlaceId, params.placeId));

    if (existing) return existing;

    const details = await this.places.getDetails(
      params.placeId,
      params.sessionToken,
    );

    const [inserted] = await this.db
      .insert(schema.workshops)
      .values({
        googlePlaceId: details.placeId,
        name: details.name,
        address: details.address,
        lat: String(details.lat),
        lng: String(details.lng),
        phone: details.phone,
        openingHours: details.openingHours,
        rating: details.rating != null ? String(details.rating) : null,
      })
      .returning();

    return inserted;
  }

  async createManual(params: { name: string; address?: string }) {
    const normalizedName = params.name.trim();
    const normalizedAddress = params.address?.trim() ?? '';

    const conditions = [ilike(schema.workshops.name, normalizedName)];
    if (normalizedAddress) {
      conditions.push(ilike(schema.workshops.address, normalizedAddress));
    } else {
      conditions.push(isNull(schema.workshops.googlePlaceId));
    }

    const [existing] = await this.db
      .select()
      .from(schema.workshops)
      .where(and(...conditions));

    if (existing) return existing;

    const [inserted] = await this.db
      .insert(schema.workshops)
      .values({
        name: normalizedName,
        address: normalizedAddress || '',
        lat: '0',
        lng: '0',
        googlePlaceId: null,
      })
      .returning();

    return inserted;
  }

  async findMine(userId: string) {
    return this.db.execute(sql`
      SELECT DISTINCT w.id, w.name, w.address, w.lat, w.lng, w.phone, w.rating,
             w.opening_hours AS "openingHours", w.google_place_id AS "googlePlaceId"
      FROM workshops w
      INNER JOIN service_logs sl ON sl.workshop_id = w.id
      INNER JOIN bikes b ON b.id = sl.bike_id
      WHERE b.user_id = ${userId}
      ORDER BY w.name ASC
    `);
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
