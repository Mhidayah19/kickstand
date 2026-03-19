import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '../database/schema';

const models = [
  'Honda CB400X',
  'Yamaha MT-07',
  'Kawasaki Ninja 400',
  'Honda PCX 160',
  'Yamaha NMAX',
];

const intervals = [
  { serviceType: 'oil_change', intervalKm: 5000, intervalMonths: 6 },
  { serviceType: 'chain_adjustment', intervalKm: 1000, intervalMonths: 3 },
  { serviceType: 'chain_replacement', intervalKm: 20000, intervalMonths: null },
  { serviceType: 'brake_pads', intervalKm: 15000, intervalMonths: 24 },
  { serviceType: 'brake_fluid', intervalKm: null, intervalMonths: 24 },
  { serviceType: 'coolant', intervalKm: null, intervalMonths: 24 },
  { serviceType: 'air_filter', intervalKm: 12000, intervalMonths: 12 },
  { serviceType: 'spark_plugs', intervalKm: 12000, intervalMonths: 12 },
  { serviceType: 'tire_front', intervalKm: 15000, intervalMonths: 24 },
  { serviceType: 'tire_rear', intervalKm: 12000, intervalMonths: 18 },
  { serviceType: 'general_service', intervalKm: 5000, intervalMonths: 6 },
];

async function seed() {
  const connectionString = process.env.SUPABASE_DATABASE_URL!;
  const client = postgres(connectionString);
  const db = drizzle(client, { schema });

  const data = models.flatMap((bikeModel) =>
    intervals.map((interval) => ({
      bikeModel,
      ...interval,
    })),
  );

  console.log('Seeding maintenance schedules...');

  await db
    .insert(schema.maintenanceSchedules)
    .values(data)
    .onConflictDoNothing();

  console.log(`Seeded ${data.length} maintenance schedule entries.`);
  await client.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
