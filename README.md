<p align="center">
  <strong>Kickstand</strong>
</p>

<p align="center">
  The intelligent motorcycle ownership companion for Singapore riders.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/status-work%20in%20progress-yellow" alt="Status: Work in Progress" />
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="License: MIT" />
  <img src="https://img.shields.io/badge/node-%3E%3D18-brightgreen" alt="Node >= 18" />
</p>

---

## What is Kickstand?

Kickstand is a mobile-first platform that helps motorcycle owners in Singapore manage compliance deadlines, track maintenance, compare workshop prices, and get AI-powered advice — all through a conversational voice agent that understands your specific bike.

This is a portfolio project by **Muhammad Hidayah (Hid)**, demonstrating full-stack mobile + AI agent engineering skills. It evolved from RideLedger (finance-only) to RidePilot SG (Next.js ownership platform) to its current form: a React Native + NestJS monorepo with a Mastra-powered AI agent.

## Why?

Motorcycle ownership in Singapore involves fragmented complexity:

- **Compliance deadlines** (road tax, insurance, COE, inspection) are tracked manually across different platforms
- **No workshop price comparison** — riders rely on word-of-mouth to find out what a chain adjustment costs at different shops for their specific bike model
- **No intelligent system** that understands your bike's state, service history, and regulatory requirements to proactively advise you

Existing solutions fall short: SGBikemart is buy/sell only, Motorist SG is car-focused, global apps like Rever and Calimoto have zero SG regulatory awareness, and EZ Motor SG lacks price comparison or AI.

## Architecture

Kickstand operates in two core modes:

1. **Proactive agent** — background jobs scan compliance deadlines and maintenance schedules, sending push notifications before things expire
2. **Voice conversational agent** — speak naturally to get advice specific to your bike model, service history, and nearby workshops with real prices

```
+-----------------------------------+
|     React Native (Expo)           |
|  - Bike profile screens           |
|  - Service log screens            |
|  - Compliance dashboard           |
|  - Voice agent interface          |
|  - Push notification handling     |
+----------------+------------------+
                 | REST + WebSocket/Streaming
                 v
+-----------------------------------+
|     NestJS Backend                |
|  +-------------------------+     |
|  | Mastra Agent Module     |     |
|  | - Bike-aware tools      |     |
|  | - Workshop lookup       |     |
|  | - Compliance checker    |     |
|  | - Maintenance advisor   |     |
|  +-------------------------+     |
|  +-------------------------+     |
|  | @nestjs/schedule        |     |
|  | - Daily compliance      |     |
|  |   deadline scan         |     |
|  | - Weekly maintenance    |     |
|  |   reminders             |     |
|  +-------------------------+     |
|  +-------------------------+     |
|  | Push Notification Svc   |     |
|  | - Expo Push API         |     |
|  +-------------------------+     |
+----------------+------------------+
                 |
                 v
+-----------------------------------+
|     Supabase (Data Layer Only)    |
|  - PostgreSQL (all data)          |
|  - Auth (sign up/login)           |
|  - Storage (receipt photos)       |
|  - Row Level Security             |
+-----------------------------------+
```

## Tech Stack

### Mobile

| Technology | Purpose |
|---|---|
| React Native (Expo SDK 55) | Cross-platform mobile framework |
| Expo Router v3 | File-based navigation |
| Zustand v5 | Client state management |
| TanStack Query v5 | Server state / caching |
| NativeWind v4 | Tailwind CSS for React Native |
| React Hook Form + Zod | Form handling + validation |
| MMKV | Encrypted local storage |
| FlashList | High-performance lists |

### Backend

| Technology | Purpose |
|---|---|
| NestJS v11 | API framework |
| Mastra | AI agent framework (YC-backed) |
| Drizzle ORM | Type-safe database access |
| @nestjs/schedule | Background cron jobs |
| class-validator | Request validation |
| Helmet + @nestjs/throttler | Security (headers + rate limiting) |
| nestjs-pino | Structured JSON logging |
| Passport + JWT | Auth strategy |

### Infrastructure

| Technology | Purpose |
|---|---|
| Supabase | PostgreSQL + Auth + Storage |
| Render | Backend hosting (free tier) |
| EAS Build | Mobile builds |
| Expo Push API | Push notifications |
| GitHub Actions | CI/CD |
| Sentry | Error monitoring |

### LLM

| Provider | Usage |
|---|---|
| Gemini | Development (free tier) |
| Claude | Production (via Mastra provider config) |

## Features

### Completed

- [x] Auth module — register, login, token refresh (Supabase Auth proxy with rollback on failure)
- [x] Bikes CRUD — create, read, update, delete with ownership guards
- [x] Mileage tracking with forward-only validation
- [x] Database schema — 9 tables via Drizzle ORM (users, bikes, service_types, maintenance_schedules, workshops, workshop_services, service_logs, notification_logs, agent_conversations)
- [x] 15 seeded service types (oil change, chain adjustment, brake pads, etc.)
- [x] SupabaseAuthGuard + @CurrentUser() decorator
- [x] Health check endpoint
- [x] Unit tests for auth + bikes modules
- [x] ESLint + Prettier + TypeScript strict mode
- [x] Drizzle migrations

### Planned

- [x] Workshops module (proximity search via Haversine formula, price comparison, workshop details)
- [x] Service logs module (paginated list, create, delete)
- [x] Workshop seed data (Singapore motorcycle workshops)
- [ ] Mastra AI agent with voice interface
- [ ] 9 agent tools: get_bike_profile, get_service_history, get_compliance_status, find_workshops_nearby, compare_workshop_prices, get_workshop_details, get_maintenance_schedule, log_service, update_mileage
- [ ] Background jobs (compliance deadline scanner, maintenance reminders, workshop data freshness)
- [ ] Push notifications via Expo Push API
- [ ] Mobile app screens (bike profile, service logs, compliance dashboard, voice agent)
- [ ] CI/CD with GitHub Actions
- [ ] Deployment to Render + Supabase Cloud + EAS Build

## Agent Example

> **User (voice):** "My chain feels loose"
>
> **Agent calls:** `get_bike_profile` -> `get_service_history(service_type: "chain")` -> `get_maintenance_schedule` -> `find_workshops_nearby`
>
> **Agent responds (voice):** "For your CB400X at 15,200km, chain slack should be 25-30mm. Your last chain adjustment was 8 months ago at 12,000km — you're overdue. Three workshops near you do chain adjustment: Ah Boy Motor $25-30, Ban Leong $20-35, and Revology $30-40. Want me to log this when you get it done?"

## Agent Tools

| Tool | Description |
|---|---|
| `get_bike_profile` | Retrieve bike details (model, year, mileage, compliance dates) |
| `get_service_history` | Query past service logs, optionally filtered by type |
| `get_compliance_status` | Check all compliance deadlines and flag upcoming/overdue |
| `find_workshops_nearby` | Locate workshops within radius using Haversine distance |
| `compare_workshop_prices` | Compare prices across workshops for a service + bike model |
| `get_workshop_details` | Full workshop info including services and pricing |
| `get_maintenance_schedule` | Recommended intervals for a given bike model |
| `log_service` | Record a completed service with cost, mileage, and workshop |
| `update_mileage` | Update current mileage (forward-only) |

## Project Structure

```
kickstand/
├── apps/
│   ├── api/                          # NestJS backend
│   │   ├── src/
│   │   │   ├── common/
│   │   │   │   ├── decorators/       # @CurrentUser()
│   │   │   │   └── guards/           # SupabaseAuthGuard
│   │   │   ├── config/               # Environment config
│   │   │   ├── database/
│   │   │   │   ├── schema.ts         # Drizzle schema (9 tables)
│   │   │   │   ├── database.module.ts
│   │   │   │   └── database.types.ts
│   │   │   ├── modules/
│   │   │   │   ├── auth/             # Register, login, refresh
│   │   │   │   ├── bikes/            # CRUD + mileage
│   │   │   │   ├── workshops/        # Proximity search, price comparison
│   │   │   │   └── service-logs/     # Maintenance record CRUD
│   │   │   ├── seeds/                # Service type + workshop seeder
│   │   │   ├── app.module.ts
│   │   │   ├── health.controller.ts
│   │   │   └── main.ts
│   │   ├── drizzle/                  # Migration files
│   │   └── test/
│   └── mobile/                       # Expo React Native app
│       ├── App.tsx
│       ├── app.json
│       └── assets/
├── docs/
├── package.json                      # Workspace root
└── README.md
```

## Getting Started

### Prerequisites

- Node.js >= 18
- npm (workspaces used for monorepo)
- A Supabase project (free tier works)

### 1. Clone and install

```bash
git clone https://github.com/your-username/kickstand.git
cd kickstand
npm install
```

### 2. Configure the API

```bash
cp apps/api/.env.example apps/api/.env
```

Fill in your `.env`:

```
PORT=3000
SUPABASE_DATABASE_URL=postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres
SUPABASE_JWT_SECRET=your-supabase-jwt-secret
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SCAN_API_KEY=your-scan-api-key
```

### 3. Run database migrations and seed

```bash
cd apps/api
npx drizzle-kit push
npm run seed:service-types
```

### 4. Seed the bike catalog

The bike catalog data is not checked into git. Generate and seed it:

```bash
# From repo root — scrapes catalog data (requires internet)
npx ts-node scripts/scrape-bike-catalog.ts

# Then seed into the database
npx ts-node scripts/seed-bike-catalog.ts
```

### 4. Start the API

```bash
# From repo root
npm run api
```

The API starts at `http://localhost:3000`. Hit `GET /health` to verify.

### 5. Start the mobile app

```bash
# From repo root
npm run mobile
```

### Running tests

```bash
# All workspaces
npm test

# API only
cd apps/api
npm test

# With coverage
npm run test:cov
```

## API Overview

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | No | Create account |
| `POST` | `/auth/login` | No | Sign in |
| `POST` | `/auth/refresh` | No | Refresh token |
| `GET` | `/bikes` | Yes | List user's bikes |
| `POST` | `/bikes` | Yes | Add a bike |
| `PATCH` | `/bikes/:id` | Yes | Update bike details |
| `DELETE` | `/bikes/:id` | Yes | Remove a bike |
| `PATCH` | `/bikes/:id/mileage` | Yes | Update mileage (forward-only) |
| `GET` | `/health` | No | Health check |
| `GET` | `/workshops?lat=X&lng=Y&radius=10` | Yes | Find nearby workshops (Haversine) |
| `GET` | `/workshops/:id` | Yes | Workshop details |
| `GET` | `/workshops/compare?service_type=X&bike_model=Y` | Yes | Compare prices |
| `GET` | `/bikes/:bikeId/services` | Yes | List service logs (paginated) |
| `POST` | `/bikes/:bikeId/services` | Yes | Log a service |
| `DELETE` | `/bikes/:bikeId/services/:id` | Yes | Delete a service log |

### Planned endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/agent/converse` | Chat with AI agent |
| `POST` | `/notifications/register-token` | Register push token |
| `POST` | `/notifications/trigger-scan` | Trigger compliance scan |

## Background Jobs

| Job | Schedule | Description |
|---|---|---|
| Compliance Deadline Scanner | Daily 8am SGT | Tiered notifications at 30d / 14d / 7d / 1d before expiry |
| Maintenance Reminder | Weekly Monday 8am | Mileage-based service reminders |
| Workshop Data Freshness | Monthly | Flags unverified workshop pricing |

## Data Model

9 tables: `users`, `bikes`, `service_types`, `maintenance_schedules`, `service_logs`, `workshops`, `workshop_services`, `notification_logs`, `agent_conversations`

Key relationships:
- A user owns many bikes
- A bike has many service logs
- Workshops offer many services with model-specific pricing
- Notification and conversation logs are tied to users

## Roadmap

**Phase 1 — MVP (current)**
- Bike profile management, workshop/maintenance logging, compliance tracking, voice agent, push notifications

**Phase 2 — Community**
- Community-contributed workshop data, user reviews, crowd-sourced pricing

**Phase 3 — Expansion**
- Cross-border features / VEP tracking, parts compatibility database

## Deployment

Target: $0/month total using free tiers.

| Service | Tier | Purpose |
|---|---|---|
| Render | Free | Backend hosting |
| Supabase | Free | PostgreSQL + Auth + Storage |
| EAS Build | Free | Mobile builds |
| Expo Push API | Free | Push notifications |
| GitHub Actions | Free | CI/CD |

## License

MIT — see [LICENSE](LICENSE) for details.
