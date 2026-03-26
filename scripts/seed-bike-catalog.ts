import 'dotenv/config';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as fs from 'fs';
import * as path from 'path';
import * as schema from '../apps/api/src/database/schema';

interface CatalogEntry {
  make: string;
  model: string;
  engineCc: number | null;
  bikeType: string;
  licenseClass: string;
}

async function seed() {
  const databaseUrl = process.env.SUPABASE_DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('SUPABASE_DATABASE_URL is required');
  }

  const client = postgres(databaseUrl);
  const db = drizzle(client, { schema });

  const dataPath = path.join(__dirname, 'data', 'bike-catalog-seed.json');
  const entries: CatalogEntry[] = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  console.log(`Seeding ${entries.length} catalog entries...`);

  // Upsert in batches of 100
  for (let i = 0; i < entries.length; i += 100) {
    const batch = entries.slice(i, i + 100);
    await db
      .insert(schema.bikeCatalog)
      .values(batch)
      .onConflictDoUpdate({
        target: [schema.bikeCatalog.make, schema.bikeCatalog.model],
        set: {
          engineCc: sql`excluded.engine_cc`,
          bikeType: sql`excluded.bike_type`,
          licenseClass: sql`excluded.license_class`,
          updatedAt: new Date(),
        },
      });
    console.log(`  Upserted ${Math.min(i + 100, entries.length)} / ${entries.length}`);
  }

  console.log('Done!');
  await client.end();
}

seed().catch(console.error);
