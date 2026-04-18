import {
  pgTable,
  pgPolicy,
  uuid,
  text,
  integer,
  date,
  timestamp,
  decimal,
  jsonb,
  unique,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { authenticatedRole, authUid } from 'drizzle-orm/supabase';

export const serviceTypes = pgTable('service_types', {
  key: text('key').primaryKey(),
  label: text('label').notNull(),
});

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  expoToken: text('expo_token'),
  activeBikeId: uuid('active_bike_id'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const bikeCatalog = pgTable(
  'bike_catalog',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    make: text('make').notNull(),
    model: text('model').notNull(),
    engineCc: integer('engine_cc'),
    bikeType: text('bike_type').notNull(),
    licenseClass: text('license_class').notNull(),
    imageUrl: text('image_url'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique('bike_catalog_make_model_unique').on(table.make, table.model),
  ],
);

export const bikes = pgTable(
  'bikes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    model: text('model').notNull(),
    year: integer('year').notNull(),
    plateNumber: text('plate_number').notNull(),
    class: text('class').notNull(),
    currentMileage: integer('current_mileage').notNull().default(0),
    coeExpiry: date('coe_expiry'),
    roadTaxExpiry: date('road_tax_expiry'),
    insuranceExpiry: date('insurance_expiry'),
    inspectionDue: date('inspection_due'),
    make: text('make'),
    engineCc: integer('engine_cc'),
    bikeType: text('bike_type'),
    catalogId: uuid('catalog_id').references(() => bikeCatalog.id),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    pgPolicy('bikes_user_isolation', {
      for: 'all',
      to: authenticatedRole,
      using: sql`${authUid} = ${table.userId}`,
      withCheck: sql`${authUid} = ${table.userId}`,
    }),
  ],
);

export const maintenanceSchedules = pgTable('maintenance_schedules', {
  id: uuid('id').primaryKey().defaultRandom(),
  bikeModel: text('bike_model').notNull(),
  serviceType: text('service_type')
    .notNull()
    .references(() => serviceTypes.key),
  intervalKm: integer('interval_km'),
  intervalMonths: integer('interval_months'),
  notes: text('notes'),
});

export const workshops = pgTable('workshops', {
  id: uuid('id').primaryKey().defaultRandom(),
  googlePlaceId: text('google_place_id').unique(),
  name: text('name').notNull(),
  address: text('address').notNull(),
  lat: decimal('lat', { precision: 10, scale: 7 }).notNull(),
  lng: decimal('lng', { precision: 10, scale: 7 }).notNull(),
  phone: text('phone'),
  rating: decimal('rating', { precision: 2, scale: 1 }),
  openingHours: text('opening_hours'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const serviceLogs = pgTable(
  'service_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    bikeId: uuid('bike_id')
      .notNull()
      .references(() => bikes.id, { onDelete: 'cascade' }),
    workshopId: uuid('workshop_id').references(() => workshops.id),
    serviceType: text('service_type')
      .notNull()
      .references(() => serviceTypes.key),
    description: text('description').notNull(),
    parts: jsonb('parts').$type<string[]>(),
    cost: decimal('cost', { precision: 10, scale: 2 }).notNull(),
    mileageAt: integer('mileage_at').notNull(),
    date: date('date').notNull(),
    receiptUrls: text('receipt_urls').array().notNull().default([]),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    pgPolicy('service_logs_user_isolation', {
      for: 'all',
      to: authenticatedRole,
      using: sql`EXISTS (SELECT 1 FROM bikes WHERE bikes.id = ${table.bikeId} AND bikes.user_id = ${authUid})`,
      withCheck: sql`EXISTS (SELECT 1 FROM bikes WHERE bikes.id = ${table.bikeId} AND bikes.user_id = ${authUid})`,
    }),
  ],
);

export const workshopServices = pgTable('workshop_services', {
  id: uuid('id').primaryKey().defaultRandom(),
  workshopId: uuid('workshop_id')
    .notNull()
    .references(() => workshops.id, { onDelete: 'cascade' }),
  serviceType: text('service_type')
    .notNull()
    .references(() => serviceTypes.key),
  bikeModel: text('bike_model'),
  priceMin: decimal('price_min', { precision: 10, scale: 2 }).notNull(),
  priceMax: decimal('price_max', { precision: 10, scale: 2 }).notNull(),
  lastVerified: date('last_verified').notNull(),
});

export const notificationLogs = pgTable(
  'notification_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    bikeId: uuid('bike_id')
      .notNull()
      .references(() => bikes.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    deadlineField: text('deadline_field'),
    tier: text('tier').notNull(),
    sentAt: timestamp('sent_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    pgPolicy('notification_logs_user_isolation', {
      for: 'all',
      to: authenticatedRole,
      using: sql`${authUid} = ${table.userId}`,
      withCheck: sql`${authUid} = ${table.userId}`,
    }),
  ],
);

export const agentConversations = pgTable(
  'agent_conversations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    sessionId: uuid('session_id').notNull(),
    messages: jsonb('messages').notNull().default([]),
    summary: text('summary'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    pgPolicy('agent_conversations_user_isolation', {
      for: 'all',
      to: authenticatedRole,
      using: sql`${authUid} = ${table.userId}`,
      withCheck: sql`${authUid} = ${table.userId}`,
    }),
  ],
);

export const ocrCache = pgTable(
  'ocr_cache',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    imageHash: text('image_hash').notNull(),
    fields: jsonb('fields').notNull(),
    receiptUrl: text('receipt_url').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique('ocr_cache_user_hash_unique').on(table.userId, table.imageHash),
    pgPolicy('ocr_cache_user_isolation', {
      for: 'all',
      to: authenticatedRole,
      using: sql`${authUid} = ${table.userId}`,
      withCheck: sql`${authUid} = ${table.userId}`,
    }),
  ],
);

export const aiUsageLogs = pgTable(
  'ai_usage_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    model: text('model').notNull(),
    tokensIn: integer('tokens_in').notNull(),
    tokensOut: integer('tokens_out').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    pgPolicy('ai_usage_logs_user_isolation', {
      for: 'all',
      to: authenticatedRole,
      using: sql`${authUid} = ${table.userId}`,
      withCheck: sql`${authUid} = ${table.userId}`,
    }),
  ],
);
