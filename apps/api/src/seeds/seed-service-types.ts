import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '../database/schema';

const serviceTypes = [
  { key: 'oil_change', label: 'Oil Change' },
  { key: 'chain_adjustment', label: 'Chain Adjustment' },
  { key: 'chain_replacement', label: 'Chain & Sprocket Replacement' },
  { key: 'brake_pads', label: 'Brake Pads Replacement' },
  { key: 'brake_fluid', label: 'Brake Fluid Change' },
  { key: 'coolant', label: 'Coolant Change' },
  { key: 'air_filter', label: 'Air Filter Replacement' },
  { key: 'spark_plugs', label: 'Spark Plugs Replacement' },
  { key: 'tire_front', label: 'Front Tire Replacement' },
  { key: 'tire_rear', label: 'Rear Tire Replacement' },
  { key: 'valve_clearance', label: 'Valve Clearance Adjustment' },
  { key: 'battery', label: 'Battery Replacement' },
  { key: 'general_service', label: 'General Service / Inspection' },
  { key: 'fork_oil', label: 'Fork Oil Change' },
  { key: 'clutch', label: 'Clutch Replacement' },
];

async function seed() {
  const connectionString = process.env.SUPABASE_DATABASE_URL!;
  const client = postgres(connectionString);
  const db = drizzle(client, { schema });

  console.log('Seeding service_types...');

  await db
    .insert(schema.serviceTypes)
    .values(serviceTypes)
    .onConflictDoNothing();

  console.log(`Seeded ${serviceTypes.length} service types.`);
  await client.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
