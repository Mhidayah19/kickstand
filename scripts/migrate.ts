import 'dotenv/config';
import postgres from 'postgres';

async function migrate() {
  const databaseUrl = process.env.SUPABASE_DATABASE_URL;
  if (!databaseUrl) throw new Error('SUPABASE_DATABASE_URL is required');

  const sql = postgres(databaseUrl);

  console.log('Applying migration 0001_fat_owl...');
  await sql`
    CREATE TABLE IF NOT EXISTS "bike_catalog" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "make" text NOT NULL,
      "model" text NOT NULL,
      "engine_cc" integer,
      "bike_type" text NOT NULL,
      "license_class" text NOT NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
      CONSTRAINT "bike_catalog_make_model_unique" UNIQUE("make","model")
    )
  `;
  console.log('  ✓ bike_catalog table');

  await sql`ALTER TABLE "bikes" ADD COLUMN IF NOT EXISTS "make" text`;
  await sql`ALTER TABLE "bikes" ADD COLUMN IF NOT EXISTS "engine_cc" integer`;
  await sql`ALTER TABLE "bikes" ADD COLUMN IF NOT EXISTS "bike_type" text`;
  await sql`ALTER TABLE "bikes" ADD COLUMN IF NOT EXISTS "catalog_id" uuid`;

  // Add FK only if it doesn't exist
  await sql`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'bikes_catalog_id_bike_catalog_id_fk'
      ) THEN
        ALTER TABLE "bikes" ADD CONSTRAINT "bikes_catalog_id_bike_catalog_id_fk"
          FOREIGN KEY ("catalog_id") REFERENCES "public"."bike_catalog"("id");
      END IF;
    END $$
  `;
  console.log('  ✓ bikes table columns + FK');

  await sql.end();
  console.log('Migration complete!');
}

migrate().catch(console.error);
