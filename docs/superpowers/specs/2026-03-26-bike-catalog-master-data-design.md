# Bike Catalog Master Data

**Date:** 2026-03-26
**Status:** Draft

## Problem

Users must manually type in bike make, model, engine cc, and license class when adding a motorcycle. This is tedious and error-prone. Singapore has a well-defined set of motorcycles available — we can provide a curated catalog for selection.

## Solution

A `bike_catalog` reference table seeded from sgbikemart.com.sg, exposed via API endpoints, powering a cascading brand → model selection UX on mobile. An "Others" fallback allows manual entry for bikes not in the catalog.

## Data Model

### Column naming convention

All Postgres columns use `snake_case`. Drizzle property names use `camelCase`. For example, `engine_cc` in Postgres maps to `engineCc` in Drizzle/TypeScript. This matches the existing codebase pattern (e.g. `plate_number` → `plateNumber`).

### New `bike_catalog` table

| Column         | DB Column        | Type      | Constraints                        |
|----------------|------------------|-----------|------------------------------------|
| `id`           | `id`             | UUID      | PK, auto-generated                 |
| `make`         | `make`           | text      | Required. Brand name (e.g. Honda)  |
| `model`        | `model`          | text      | Required. Model name (e.g. CB400X) |
| `engineCc`     | `engine_cc`      | integer   | Nullable (electric bikes)          |
| `bikeType`     | `bike_type`      | text      | Required. Category (sport, naked, scooter, etc.) |
| `licenseClass` | `license_class`  | text      | Required. '2B', '2A', or '2'. Validated at application level via `@IsIn`, matching existing pattern. |
| `createdAt`    | `created_at`     | timestamp | Auto, with timezone                |
| `updatedAt`    | `updated_at`     | timestamp | Auto, with timezone                |

Unique constraint on `(make, model)`. This composite index also covers `make`-prefix queries for the `GET /bike-catalog/models?make=` endpoint.

### `BikeCatalogEntry` response type

```typescript
interface BikeCatalogEntry {
  id: string;
  make: string;
  model: string;
  engineCc: number | null;
  bikeType: string;
  licenseClass: BikeClass; // '2B' | '2A' | '2'
}
```

### Changes to existing `bikes` table

Add nullable columns:

| Column      | DB Column    | Type    | Notes                                      |
|-------------|--------------|---------|---------------------------------------------|
| `make`      | `make`       | text    | Separate brand field                        |
| `engineCc`  | `engine_cc`  | integer | Engine displacement in cc                   |
| `bikeType`  | `bike_type`  | text    | Category (sport, naked, scooter, etc.)      |
| `catalogId` | `catalog_id` | UUID    | FK → `bike_catalog.id`, nullable            |

Existing bikes are untouched. New columns are all nullable to preserve backward compatibility.

### `model` field semantics

The existing `bikes.model` column currently stores the full bike name as free text. **This behavior is preserved.** For catalog-selected bikes, `model` stores just the model name (e.g. "CB400X") and `make` stores the brand separately. For existing bikes, `model` retains whatever the user originally typed.

**Impact on maintenance schedules:** `maintenanceSchedules.bikeModel` matches against `bikes.model`. For new catalog-linked bikes, `model` will be "CB400X" not "Honda CB400X". Maintenance schedule lookup must be updated to match on `make + model` (concatenated) or on `model` alone. This is addressed in the implementation plan.

### License class: no new column on `bikes`

The existing `bikes.class` column stores the license class. Catalog auto-fill writes to this existing column. No new `licenseClass` column is added to `bikes`.

## API Endpoints

### New `bike-catalog` module (public, no auth)

| Endpoint                        | Response                                          | Purpose                    |
|---------------------------------|---------------------------------------------------|----------------------------|
| `GET /bike-catalog/makes`       | `string[]` — sorted list of unique makes          | Populate brand picker      |
| `GET /bike-catalog/models?make=` | `BikeCatalogEntry[]` — filtered by make           | Populate model picker      |
| `GET /bike-catalog/:id`         | Single `BikeCatalogEntry`                         | Fetch details for auto-fill|

### Changes to existing `bikes` module

**`CreateBikeDto` changes:**
- Gains optional fields: `make`, `engineCc`, `bikeType`, `catalogId`
- **Precedence rule:** If `catalogId` is provided, catalog values overwrite any manually sent `make`, `engineCc`, `bikeType`, and `class` fields. The client should not send both, but if it does, `catalogId` wins.
- When `catalogId` is null ("Others" flow): `make` and `model` are required as free text; `engineCc` and `bikeType` are optional.

**`UpdateBikeDto` changes:**
- Inherits new optional fields from `CreateBikeDto` via existing `Partial<>` pattern.
- Users can update `make`, `engineCc`, `bikeType`. Updating `catalogId` is allowed (e.g. user re-selects from catalog).

## Mobile UX Flow

### Catalog selection (primary flow)

1. **Brand picker** — Horizontal scrollable pills. Alphabetically sorted with popular brands (Honda, Yamaha, Kawasaki) pinned first. Last pill is "Others".
2. **Model picker** — After brand selection, list of models appears below. Each shows: model name, engine cc, license class badge, bike type.
3. **Auto-fill** — On model selection, `engineCc`, `bikeType`, `licenseClass` auto-fill. User manually enters: `year`, `plateNumber`, `currentMileage`, expiry dates.

### "Others" flow (manual entry)

Tapping "Others" switches to free-text inputs for `make` and `model`. User manually picks `licenseClass` from 2B/2A/2. `engineCc` and `bikeType` are optional.

### Existing form fields unchanged

`year`, `plateNumber`, `currentMileage`, `coeExpiry`, `roadTaxExpiry`, `insuranceExpiry`, `inspectionDue` remain as-is.

### Mobile type changes

```typescript
// New type in lib/types/bike.ts
interface BikeCatalogEntry {
  id: string;
  make: string;
  model: string;
  engineCc: number | null;
  bikeType: string;
  licenseClass: BikeClass;
}

// Updated Bike interface — add nullable fields
interface Bike {
  // ... existing fields ...
  make: string | null;
  engineCc: number | null;
  bikeType: string | null;
  catalogId: string | null;
}

// Updated CreateBikeInput — add optional fields
interface CreateBikeInput {
  // ... existing fields ...
  make?: string;
  engineCc?: number;
  bikeType?: string;
  catalogId?: string;
}
```

## Data Seeding

### Two-step process

1. **Scraper script** (`scripts/scrape-bike-catalog.ts`)
   - Scrapes all 109 pages from sgbikemart.com.sg new bikes listing
   - Extracts: make, model, engine cc, bike type, license class
   - Deduplicates and normalizes (consistent casing, trimmed whitespace)
   - Outputs `scripts/data/bike-catalog-seed.json`

2. **Seed script** (`scripts/seed-bike-catalog.ts`)
   - Reads the JSON file
   - Upserts into `bike_catalog` table (on `make + model` unique constraint)
   - Rerunnable without creating duplicates

### Data source

- **Primary:** sgbikemart.com.sg — best structured data with license class, engine cc, bike type
- **Coverage:** Comprehensive — new and discontinued models available in Singapore

### Maintenance

- Re-run scraper + seed when new models are released (a few times per year)
- Future: admin endpoint for manual catalog edits

## Scope

### In scope

- `bike_catalog` DB table and Drizzle schema
- Migration to add new columns to `bikes` table
- `bike-catalog` NestJS module with 3 read-only endpoints
- Updated `CreateBikeDto`, `UpdateBikeDto`, and bike creation/update logic
- Maintenance schedule lookup update to handle split make/model
- Mobile "Add Bike" screen redesign with cascading selection
- Scraper and seed scripts
- Mobile types and validation schema updates

### Out of scope

- Admin CRUD for catalog entries
- Bike images or brand logos
- Search/type-ahead input mode
- Migrating existing bikes to link to catalog entries
- Dark mode considerations (follow existing semantic tokens)
