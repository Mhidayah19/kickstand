<p align="center">
  <strong>Kickstand</strong>
</p>

<p align="center">
  The intelligent motorcycle ownership companion for Singapore riders.<br/>
  Track compliance, log maintenance, compare workshop prices — all in one place.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/status-work%20in%20progress-yellow" alt="Status: Work in Progress" />
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="License: MIT" />
  <img src="https://img.shields.io/badge/node-%3E%3D18-brightgreen" alt="Node >= 18" />
  <img src="https://img.shields.io/badge/platform-iOS%20%7C%20Android-lightgrey" alt="Platform: iOS | Android" />
  <img src="https://img.shields.io/badge/deployed-AWS%20ECS-orange" alt="Deployed on AWS ECS" />
</p>

---

## Table of Contents

- [Overview](#overview)
- [Screenshots](#screenshots)
- [Why I Built This](#why-i-built-this)
- [The Problem](#the-problem)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Background Jobs](#background-jobs)
- [Data Model](#data-model)
- [Roadmap](#roadmap)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)
- [License](#license)
- [Contact](#contact)

---

## Overview

Kickstand is a mobile-first platform that helps motorcycle owners in Singapore manage compliance deadlines, track maintenance, compare workshop prices, and get AI-powered advice — through a conversational voice agent that understands your specific bike.

**What makes it different:**

- Compliance tracking built specifically for Singapore regulations (COE, road tax, inspection, insurance)
- Workshop price comparison across real local shops — not just a directory
- A Mastra-powered AI agent that knows your bike's service history and can advise you proactively
- Notification-first design: it reminds you before things expire, not after

> **Note:** This is an active portfolio project by **Muhammad Hidayah (Hid)**, demonstrating full-stack mobile + AI agent engineering. The core platform (auth, bikes, compliance, service logs, workshops, push notifications) is production-deployed. The AI agent is in active development.

---

## Screenshots

> Screenshots will be added once the UI design is finalised.

---

## Why I Built This

As a CB400X rider in Singapore, I found myself juggling spreadsheets, calendar reminders, and phone screenshots just to track when my road tax renewed, when my next oil change was due, and whether the workshop I used last time was still competitive on price. There was no single tool that understood the Singapore context — the COE system, the specific inspection requirements, the local workshop ecosystem.

I started with a finance-only ledger (RideLedger), expanded it to a broader ownership platform (RidePilot SG on Next.js), and eventually rebuilt it as Kickstand — a React Native + NestJS monorepo with proper AI agent foundations. Each iteration taught me something new about product scoping, mobile architecture, and what riders actually need.

This project also serves as a portfolio piece demonstrating full-stack engineering with real infrastructure: deployed to AWS ECS with proper CI/CD, monitored with Sentry, and built with production-grade patterns throughout.

---

## The Problem

Motorcycle ownership in Singapore involves fragmented complexity:

- **Compliance deadlines** (road tax, insurance, COE, inspection) are tracked manually across different platforms
- **No workshop price comparison** — riders rely on word-of-mouth to find out what a chain adjustment costs at different shops for their specific bike model
- **No intelligent system** that understands your bike's state, service history, and regulatory requirements to proactively advise you

Existing solutions fall short: SGBikemart is buy/sell only, Motorist SG is car-focused, global apps like Rever and Calimoto have zero SG regulatory awareness, and EZ Motor SG lacks price comparison or AI.

---

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

---

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
| Sentry | Error monitoring + session replay |

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
| AWS ECS on EC2 (ap-southeast-1) | Backend hosting (~1-5ms to Supabase) |
| AWS ALB + CloudFront | HTTPS termination + CDN |
| AWS ECR | Container registry |
| EAS Build | Mobile builds |
| EAS Update | OTA updates (Expo Go distribution) |
| Expo Push API | Push notifications |
| GitHub Actions | CI/CD |
| Sentry | Error monitoring + user feedback |

### LLM

| Provider | Usage |
|---|---|
| Gemini | Development (free tier) |
| Claude | Production (via Mastra provider config) |

---

## Features

### Backend API

- [x] Auth module — register, login, token refresh (Supabase Auth proxy with rollback on failure)
- [x] Bikes CRUD — create, read, update, delete with ownership guards
- [x] Mileage tracking with forward-only validation
- [x] Database schema — 9 tables via Drizzle ORM
- [x] 15 seeded service types (oil change, chain adjustment, brake pads, etc.)
- [x] Workshops module — proximity search (Haversine), price comparison, workshop details
- [x] Service logs module — full CRUD (paginated list, create, update, delete) with cost tracking
- [x] Bike catalog with 100+ models (Honda, Yamaha, Kawasaki, etc.)
- [x] Users module — get/update profile
- [x] Background jobs — compliance deadline scanner, maintenance reminders, workshop data freshness
- [x] Push notification registration & cron-based job triggers
- [x] SupabaseAuthGuard + @CurrentUser() decorator
- [x] Health check endpoint
- [x] Unit tests for auth + bikes modules
- [x] ESLint + Prettier + TypeScript strict mode
- [x] Drizzle migrations
- [x] Dockerized multi-stage build
- [x] Deployed to AWS ECS on EC2 (ap-southeast-1, same region as Supabase)
- [x] Sentry error tracking

### Mobile App (React Native)

- [x] Authentication — login, sign-up, token refresh
- [x] Onboarding — sign-up flow with success screen
- [x] Dashboard — active bike selector, compliance status cards (COE, road tax, insurance, inspection), mileage progress to next service, recent service logs
- [x] My Garage — bike grid with compliance status indicators, fleet summary
- [x] Bike Detail — hero card, specs, 4 compliance dates, service history, edit/delete with confirmation
- [x] Add Bike — 5-step form with catalog search, license class picker, auto-calculated SG compliance dates
- [x] Edit Bike — pre-filled form for all bike fields
- [x] Service History — date-grouped timeline, filter by service category, date range picker, search, total spend counter, analytics sheet, paginated
- [x] Service Detail — full record view with parts pills, receipt photos with full-screen viewer, edit and delete actions
- [x] Add Service — type selector with recent suggestions, cost/mileage/date/parts inputs, receipt photo capture & upload
- [x] Edit Service — pre-filled form with unsaved changes guard, receipt management
- [x] Settings — profile display, logout
- [x] 38 reusable UI components (buttons, cards, inputs, timeline, bottom sheet, skeleton loaders, etc.)
- [x] ESLint + TypeScript strict mode
- [x] Sentry error tracking + session replay + in-app feedback button
- [x] EAS Update (OTA updates via Expo Go)
- [x] Service receipt photo upload via Supabase Storage
- [x] Swipe-to-edit/delete on service entries with haptic feedback
- [x] Service cost breakdown & analytics (monthly trends, category breakdown)

### Coming Soon (v1.1+)

**Agent & Intelligence (Phase 3)**
- [ ] Mastra AI agent with voice + chat interface (agent tab screen exists, tools not yet implemented)
- [ ] 9 agent tools: get_bike_profile, get_service_history, get_compliance_status, find_workshops_nearby, compare_workshop_prices, get_workshop_details, get_maintenance_schedule, log_service, update_mileage
- [ ] Conversational bike advice based on service history and compliance status

**UI Enhancements (Phase 2 - In Progress)**
- [ ] Workshop discovery screen (API is fully built, mobile UI in progress)
- [ ] Full-screen image viewer with pinch-to-zoom for receipt photos
- [ ] Dark mode (toggle exists in settings, not wired)

**Infrastructure & Settings (Phase 4)**
- [ ] Personal info / security settings (menu items exist, not functional)
- [ ] Terraform IaC for all AWS infrastructure
- [ ] Kubernetes manifests for EKS/GKE deployment

---

## Agent Example

> **User (voice):** "My chain feels loose"
>
> **Agent calls:** `get_bike_profile` → `get_service_history(service_type: "chain")` → `get_maintenance_schedule` → `find_workshops_nearby`
>
> **Agent responds (voice):** "For your CB400X at 15,200km, chain slack should be 25-30mm. Your last chain adjustment was 8 months ago at 12,000km — you're overdue. Three workshops near you do chain adjustment: Ah Boy Motor $25-30, Ban Leong $20-35, and Revology $30-40. Want me to log this when you get it done?"

### Agent Tools

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

---

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
│   │   │   │   ├── bike-catalog/     # Make/model lookup
│   │   │   │   ├── users/            # Profile management
│   │   │   │   ├── workshops/        # Proximity search, price comparison
│   │   │   │   ├── service-logs/     # Maintenance record CRUD
│   │   │   │   └── notifications/    # Push + cron scan jobs
│   │   │   ├── seeds/                # Service type + workshop seeder
│   │   │   ├── app.module.ts
│   │   │   ├── health.controller.ts
│   │   │   └── main.ts
│   │   ├── drizzle/                  # Migration files
│   │   ├── Dockerfile                # Multi-stage build
│   │   └── test/
│   └── mobile/                       # Expo React Native app
│       ├── app/                      # Expo Router screens
│       ├── components/               # 38 reusable UI components
│       ├── lib/                      # Hooks, stores, API clients
│       └── assets/
├── docs/
│   ├── plans/                        # Infrastructure plans (ECS, Terraform, K8s)
│   ├── user-stories/                 # SG-specific feature backlog
│   └── research/                     # SG motorcycle community research
├── package.json                      # Workspace root
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js >= 18
- npm (workspaces used for monorepo)
- A Supabase project (free tier works)

### 1. Clone and install

```bash
git clone https://github.com/Mhidayah19/kickstand.git
cd kickstand
npm install
```

### 2. Configure the API

```bash
cp apps/api/.env.example apps/api/.env
```

Fill in your `.env`:

```env
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

### 5. Start the API

```bash
# From repo root
npm run api
```

The API starts at `http://localhost:3000`. Hit `GET /health` to verify.

### 6. Start the mobile app

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

---

## API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | No | Create account |
| `POST` | `/auth/login` | No | Sign in |
| `POST` | `/auth/refresh` | No | Refresh token |
| `GET` | `/users/me` | Yes | Get current user profile |
| `PATCH` | `/users/me` | Yes | Update profile |
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
| `GET` | `/bikes/:bikeId/services/:id` | Yes | Get service log detail |
| `POST` | `/bikes/:bikeId/services` | Yes | Log a service |
| `PATCH` | `/bikes/:bikeId/services/:id` | Yes | Update a service log |
| `DELETE` | `/bikes/:bikeId/services/:id` | Yes | Delete a service log |
| `GET` | `/bike-catalog/makes` | No | List all bike makes |
| `GET` | `/bike-catalog/models?make=Honda` | No | List models for make |
| `GET` | `/bike-catalog/:id` | No | Catalog entry details |
| `POST` | `/notifications/register-token` | Yes | Register Expo push token |

### Coming Soon (v1.1+)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/agent/chat` | Chat with AI agent |
| `POST` | `/agent/stream` | Streaming voice agent response |

---

## Background Jobs

| Job | Schedule | Description |
|---|---|---|
| Compliance Deadline Scanner | Daily 8am SGT | Tiered notifications at 30d / 14d / 7d / 1d before expiry |
| Maintenance Reminder | Weekly Monday 8am | Mileage-based service reminders |
| Workshop Data Freshness | Monthly | Flags unverified workshop pricing (>6 months stale) |

---

## Data Model

9 tables: `users`, `bikes`, `bike_catalog`, `service_types`, `maintenance_schedules`, `service_logs`, `workshops`, `workshop_services`, `notification_logs`, `agent_conversations`

Key relationships:
- A user owns many bikes
- A bike has many service logs
- Workshops offer many services with model-specific pricing
- Notification and conversation logs are tied to users

---

## Roadmap

**Phase 1 — MVP (shipped)**
- ✓ Bike profile management, multi-bike support
- ✓ Service logging with full CRUD and 15 service types
- ✓ Compliance tracking (COE, road tax, insurance, inspection) with auto-calculated SG dates
- ✓ Workshop directory with proximity search & price comparison
- ✓ Push notifications with compliance + maintenance cron scan jobs
- ✓ Deployed to AWS ECS on EC2 (ap-southeast-1) with ALB + CloudFront HTTPS
- ✓ Sentry error monitoring + in-app feedback
- ✓ EAS Update for OTA distribution

**Phase 2 — Polish (shipped)**
- ✓ Service log swipe-to-edit/delete with haptics
- ✓ Receipt photo upload & full-screen viewer
- ✓ Service history date-grouped timeline with advanced filtering
- ✓ Analytics sheet with cost breakdown by category
- ✓ Search + date range picker for service history
- ✓ Unsaved changes guard on forms
- 🔄 Workshop discovery screen (API ready, UI in progress)

**Phase 3 — Intelligence (in progress)**
- Mastra AI agent with voice + chat interface
- Conversational bike advice based on service history
- 9 agent tools for bike management, compliance, and workshop discovery
- Workshop recommendation engine

**Phase 4 — Infrastructure (queued)**
- Terraform IaC for all AWS resources
- Kubernetes manifests (EKS/GKE)

**Phase 5 — Community (future)**
- Community-contributed workshop data & reviews
- Crowd-sourced pricing updates
- Ride logs & trip tracking

**Phase 6 — Expansion (future)**
- Cross-border riding (Malaysia, Thailand) — VEP tracking, pre-departure checklists
- COE renewal planning tools
- License progression (2B → 2A → 2) notifications

---

## Deployment

| Service | Tier | Purpose |
|---|---|---|
| AWS ECS on EC2 (ap-southeast-1) | Free tier (t3.micro) | Backend hosting, co-located with Supabase |
| AWS ALB | Free tier | HTTPS load balancing |
| AWS ECR | Free tier | Docker image registry |
| Supabase | Free | PostgreSQL + Auth + Storage |
| EAS Build | Free | Mobile builds |
| EAS Update | Free | OTA updates |
| Expo Push API | Free | Push notifications |
| GitHub Actions | Free | CI/CD |
| Sentry | Free | Error monitoring |

---

## Contributing

This is primarily a portfolio project, but feedback and suggestions are welcome.

### Local Development

```bash
# Install all dependencies
npm install

# Run API in watch mode
npm run api

# Run mobile app
npm run mobile

# Lint everything
npm run lint

# Run tests
npm test
```

### Code Style

- TypeScript strict mode is enforced across both apps
- ESLint + Prettier are configured — run `npm run lint` before committing
- API follows NestJS module conventions: controllers delegate, services own business logic
- Mobile follows Expo Router file-based routing conventions

### Submitting Changes

1. Fork the repo and create a branch from `main`
2. Make your changes with clear, focused commits
3. Ensure `npm run lint` and `npm test` pass
4. Open a pull request with a clear description of what and why

---

## Troubleshooting

**`npm install` fails with peer dependency errors**
Try `npm install --legacy-peer-deps`. This monorepo uses npm workspaces — make sure you're on npm >= 8.

**`npx drizzle-kit push` fails with connection error**
Double-check `SUPABASE_DATABASE_URL` in `apps/api/.env`. The URL should use the direct connection string from Supabase, not the pooler URL (which doesn't support DDL operations).

**Mobile app can't connect to local API**
The Expo dev client runs on your device/simulator — `localhost` won't resolve to your machine. Use your machine's local network IP instead (e.g. `http://192.168.x.x:3000`).

**Push notifications not received in development**
Expo push notifications require a physical device. The simulator will register a token but won't receive notifications. Test on a real device via Expo Go.

**`npx ts-node scripts/scrape-bike-catalog.ts` times out**
The scraper requires internet access. If it times out, check your network. You can also manually populate the `bike_catalog` table via the Supabase dashboard if needed.

**JWT errors on API requests**
Ensure your `SUPABASE_JWT_SECRET` matches the secret in your Supabase project settings under API > JWT Secret. Tokens signed with the wrong secret will always be rejected.

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

## Contact

Built by **Muhammad Hidayah (Hid)** — Singapore-based software engineer.

- GitHub: [@Mhidayah19](https://github.com/Mhidayah19)
- Issues: [Open a GitHub issue](https://github.com/Mhidayah19/kickstand/issues)

> Feedback, bug reports, and ideas are welcome via GitHub Issues.
