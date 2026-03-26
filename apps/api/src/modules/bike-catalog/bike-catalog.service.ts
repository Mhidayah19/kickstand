import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { asc, eq } from 'drizzle-orm';
import { DRIZZLE } from '../../database/database.module';
import type { DrizzleDB } from '../../database/database.types';
import * as schema from '../../database/schema';

@Injectable()
export class BikeCatalogService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findAllMakes(): Promise<string[]> {
    const rows = await this.db
      .selectDistinct({ make: schema.bikeCatalog.make })
      .from(schema.bikeCatalog)
      .orderBy(asc(schema.bikeCatalog.make));

    return rows.map((r) => r.make);
  }

  async findModelsByMake(make: string) {
    return this.db
      .select()
      .from(schema.bikeCatalog)
      .where(eq(schema.bikeCatalog.make, make))
      .orderBy(asc(schema.bikeCatalog.model));
  }

  async findOneById(id: string) {
    const [entry] = await this.db
      .select()
      .from(schema.bikeCatalog)
      .where(eq(schema.bikeCatalog.id, id));

    if (!entry) {
      throw new NotFoundException(`Catalog entry ${id} not found`);
    }
    return entry;
  }
}
