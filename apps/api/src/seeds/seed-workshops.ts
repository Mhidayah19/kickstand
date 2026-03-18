import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '../database/schema';

const workshopsData = [
  {
    name: 'Ah Boy Motor',
    address: '10 Ubi Crescent, #01-35 Ubi Techpark, Singapore 408564',
    lat: '1.3297800',
    lng: '103.8983100',
    phone: '+65 6744 1234',
    rating: '4.4',
    openingHours: 'Mon-Sat 9am-7pm',
  },
  {
    name: 'Ban Leong Motor',
    address: '15 Jalan Kilang Barat, #01-02, Singapore 159357',
    lat: '1.2882300',
    lng: '103.8197400',
    phone: '+65 6272 5678',
    rating: '4.2',
    openingHours: 'Mon-Sat 9am-6:30pm',
  },
  {
    name: 'Revology Motorcycles',
    address: '3 Toh Guan Road East, #01-08, Singapore 608831',
    lat: '1.3334500',
    lng: '103.7448200',
    phone: '+65 6896 2233',
    rating: '4.6',
    openingHours: 'Mon-Sat 10am-7pm, Sun 10am-5pm',
  },
  {
    name: 'Wee & Wee Motorcycle',
    address: '61 Ubi Ave 2, #01-20 Automobile Megamart, Singapore 408898',
    lat: '1.3264700',
    lng: '103.8942600',
    phone: '+65 6745 8899',
    rating: '4.3',
    openingHours: 'Mon-Sat 9am-6pm',
  },
  {
    name: 'LHN Motor',
    address: '2 Bukit Batok Street 23, #01-05, Singapore 659554',
    lat: '1.3492100',
    lng: '103.7507800',
    phone: '+65 6566 3344',
    rating: '4.1',
    openingHours: 'Mon-Sat 9am-7pm',
  },
  {
    name: 'Speed Zone Motorcycles',
    address: '30 Woodlands Industrial Park E1, #01-03, Singapore 757700',
    lat: '1.4327600',
    lng: '103.7937400',
    phone: '+65 6369 5566',
    rating: '4.5',
    openingHours: 'Mon-Sat 9am-7pm, Sun 10am-4pm',
  },
  {
    name: 'Fong Kim Motor',
    address: '107 Jalan Besar, Singapore 208839',
    lat: '1.3058900',
    lng: '103.8563200',
    phone: '+65 6293 7788',
    rating: '4.0',
    openingHours: 'Mon-Sat 9am-6pm',
  },
  {
    name: 'Yong Xing Motor',
    address: '208 Balestier Road, Singapore 329685',
    lat: '1.3232500',
    lng: '103.8468700',
    phone: '+65 6252 9900',
    rating: '4.2',
    openingHours: 'Mon-Sat 9:30am-6:30pm',
  },
];

async function seed() {
  const connectionString = process.env.SUPABASE_DATABASE_URL!;
  const client = postgres(connectionString);
  const db = drizzle(client, { schema });

  console.log('Seeding workshops...');

  const insertedWorkshops = await db
    .insert(schema.workshops)
    .values(workshopsData)
    .onConflictDoNothing()
    .returning();

  console.log(`Seeded ${insertedWorkshops.length} workshops.`);

  if (insertedWorkshops.length === 0) {
    console.log(
      'No new workshops inserted (already exist). Skipping services.',
    );
    await client.end();
    return;
  }

  // Map workshop names to their inserted IDs
  const workshopIdByName = new Map(
    insertedWorkshops.map((w) => [w.name, w.id]),
  );

  const lastVerified = '2026-03-18';

  const workshopServicesData = [
    // Ah Boy Motor (4 services)
    {
      workshopId: workshopIdByName.get('Ah Boy Motor')!,
      serviceType: 'oil_change',
      bikeModel: null,
      priceMin: '35.00',
      priceMax: '65.00',
      lastVerified,
    },
    {
      workshopId: workshopIdByName.get('Ah Boy Motor')!,
      serviceType: 'chain_adjustment',
      bikeModel: null,
      priceMin: '15.00',
      priceMax: '25.00',
      lastVerified,
    },
    {
      workshopId: workshopIdByName.get('Ah Boy Motor')!,
      serviceType: 'brake_pads',
      bikeModel: null,
      priceMin: '40.00',
      priceMax: '80.00',
      lastVerified,
    },
    {
      workshopId: workshopIdByName.get('Ah Boy Motor')!,
      serviceType: 'battery',
      bikeModel: null,
      priceMin: '60.00',
      priceMax: '120.00',
      lastVerified,
    },

    // Ban Leong Motor (4 services)
    {
      workshopId: workshopIdByName.get('Ban Leong Motor')!,
      serviceType: 'oil_change',
      bikeModel: null,
      priceMin: '38.00',
      priceMax: '70.00',
      lastVerified,
    },
    {
      workshopId: workshopIdByName.get('Ban Leong Motor')!,
      serviceType: 'spark_plugs',
      bikeModel: null,
      priceMin: '20.00',
      priceMax: '45.00',
      lastVerified,
    },
    {
      workshopId: workshopIdByName.get('Ban Leong Motor')!,
      serviceType: 'air_filter',
      bikeModel: null,
      priceMin: '25.00',
      priceMax: '50.00',
      lastVerified,
    },
    {
      workshopId: workshopIdByName.get('Ban Leong Motor')!,
      serviceType: 'general_service',
      bikeModel: null,
      priceMin: '80.00',
      priceMax: '150.00',
      lastVerified,
    },

    // Revology Motorcycles (5 services)
    {
      workshopId: workshopIdByName.get('Revology Motorcycles')!,
      serviceType: 'oil_change',
      bikeModel: null,
      priceMin: '45.00',
      priceMax: '80.00',
      lastVerified,
    },
    {
      workshopId: workshopIdByName.get('Revology Motorcycles')!,
      serviceType: 'tire_front',
      bikeModel: null,
      priceMin: '120.00',
      priceMax: '220.00',
      lastVerified,
    },
    {
      workshopId: workshopIdByName.get('Revology Motorcycles')!,
      serviceType: 'tire_rear',
      bikeModel: null,
      priceMin: '130.00',
      priceMax: '240.00',
      lastVerified,
    },
    {
      workshopId: workshopIdByName.get('Revology Motorcycles')!,
      serviceType: 'valve_clearance',
      bikeModel: null,
      priceMin: '80.00',
      priceMax: '160.00',
      lastVerified,
    },
    {
      workshopId: workshopIdByName.get('Revology Motorcycles')!,
      serviceType: 'fork_oil',
      bikeModel: null,
      priceMin: '60.00',
      priceMax: '120.00',
      lastVerified,
    },

    // Wee & Wee Motorcycle (4 services)
    {
      workshopId: workshopIdByName.get('Wee & Wee Motorcycle')!,
      serviceType: 'chain_replacement',
      bikeModel: null,
      priceMin: '80.00',
      priceMax: '160.00',
      lastVerified,
    },
    {
      workshopId: workshopIdByName.get('Wee & Wee Motorcycle')!,
      serviceType: 'brake_fluid',
      bikeModel: null,
      priceMin: '30.00',
      priceMax: '55.00',
      lastVerified,
    },
    {
      workshopId: workshopIdByName.get('Wee & Wee Motorcycle')!,
      serviceType: 'coolant',
      bikeModel: null,
      priceMin: '35.00',
      priceMax: '65.00',
      lastVerified,
    },
    {
      workshopId: workshopIdByName.get('Wee & Wee Motorcycle')!,
      serviceType: 'general_service',
      bikeModel: null,
      priceMin: '90.00',
      priceMax: '160.00',
      lastVerified,
    },

    // LHN Motor (4 services)
    {
      workshopId: workshopIdByName.get('LHN Motor')!,
      serviceType: 'oil_change',
      bikeModel: null,
      priceMin: '32.00',
      priceMax: '60.00',
      lastVerified,
    },
    {
      workshopId: workshopIdByName.get('LHN Motor')!,
      serviceType: 'brake_pads',
      bikeModel: null,
      priceMin: '38.00',
      priceMax: '75.00',
      lastVerified,
    },
    {
      workshopId: workshopIdByName.get('LHN Motor')!,
      serviceType: 'chain_adjustment',
      bikeModel: null,
      priceMin: '12.00',
      priceMax: '20.00',
      lastVerified,
    },
    {
      workshopId: workshopIdByName.get('LHN Motor')!,
      serviceType: 'battery',
      bikeModel: null,
      priceMin: '55.00',
      priceMax: '110.00',
      lastVerified,
    },

    // Speed Zone Motorcycles (4 services)
    {
      workshopId: workshopIdByName.get('Speed Zone Motorcycles')!,
      serviceType: 'tire_front',
      bikeModel: null,
      priceMin: '110.00',
      priceMax: '200.00',
      lastVerified,
    },
    {
      workshopId: workshopIdByName.get('Speed Zone Motorcycles')!,
      serviceType: 'tire_rear',
      bikeModel: null,
      priceMin: '120.00',
      priceMax: '220.00',
      lastVerified,
    },
    {
      workshopId: workshopIdByName.get('Speed Zone Motorcycles')!,
      serviceType: 'clutch',
      bikeModel: null,
      priceMin: '150.00',
      priceMax: '300.00',
      lastVerified,
    },
    {
      workshopId: workshopIdByName.get('Speed Zone Motorcycles')!,
      serviceType: 'fork_oil',
      bikeModel: null,
      priceMin: '55.00',
      priceMax: '110.00',
      lastVerified,
    },

    // Fong Kim Motor (4 services)
    {
      workshopId: workshopIdByName.get('Fong Kim Motor')!,
      serviceType: 'oil_change',
      bikeModel: null,
      priceMin: '30.00',
      priceMax: '55.00',
      lastVerified,
    },
    {
      workshopId: workshopIdByName.get('Fong Kim Motor')!,
      serviceType: 'spark_plugs',
      bikeModel: null,
      priceMin: '18.00',
      priceMax: '40.00',
      lastVerified,
    },
    {
      workshopId: workshopIdByName.get('Fong Kim Motor')!,
      serviceType: 'air_filter',
      bikeModel: null,
      priceMin: '22.00',
      priceMax: '45.00',
      lastVerified,
    },
    {
      workshopId: workshopIdByName.get('Fong Kim Motor')!,
      serviceType: 'chain_replacement',
      bikeModel: null,
      priceMin: '75.00',
      priceMax: '150.00',
      lastVerified,
    },

    // Yong Xing Motor (4 services)
    {
      workshopId: workshopIdByName.get('Yong Xing Motor')!,
      serviceType: 'general_service',
      bikeModel: null,
      priceMin: '85.00',
      priceMax: '155.00',
      lastVerified,
    },
    {
      workshopId: workshopIdByName.get('Yong Xing Motor')!,
      serviceType: 'valve_clearance',
      bikeModel: null,
      priceMin: '75.00',
      priceMax: '145.00',
      lastVerified,
    },
    {
      workshopId: workshopIdByName.get('Yong Xing Motor')!,
      serviceType: 'coolant',
      bikeModel: null,
      priceMin: '30.00',
      priceMax: '60.00',
      lastVerified,
    },
    {
      workshopId: workshopIdByName.get('Yong Xing Motor')!,
      serviceType: 'brake_fluid',
      bikeModel: null,
      priceMin: '28.00',
      priceMax: '50.00',
      lastVerified,
    },
  ];

  console.log('Seeding workshop_services...');

  await db
    .insert(schema.workshopServices)
    .values(workshopServicesData)
    .onConflictDoNothing();

  console.log(`Seeded ${workshopServicesData.length} workshop services.`);

  await client.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
