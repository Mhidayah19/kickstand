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
- [Design System](#design-system)
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

Kickstand is a mobile-first platform that helps motorcycle owners in Singapore manage compliance deadlines, track maintenance, and compare workshop prices — with receipt-scanning OCR that pre-fills service logs from a photo.

**What makes it different:**

- Compliance tracking built specifically for Singapore regulations (COE, road tax, inspection, insurance)
- Workshop picker backed by Google Places with cross-user deduplication and a manual-entry fallback
- Scan a workshop receipt and auto-fill the service log — OpenAI-powered OCR with per-user and global rate limits
- Notification-first design: it reminds you before things expire, not after

> **Note:** This is an active portfolio project by **Muhammad Hidayah (Hid)**, demonstrating full-stack mobile + backend engineering. The core platform (auth, bikes, compliance, service logs, workshop picker, receipt OCR, push notifications) is production-deployed. A conversational AI agent is on the roadmap.

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

Mobile-first client against a NestJS API on Amazon ECS in `ap-southeast-1`. Supabase handles data and auth; third-party APIs cover OCR, push, places, and observability.

![Kickstand AWS architecture](assets/architecture.svg)

> Full-fidelity HTML version (with custom typography): [`assets/architecture.html`](assets/architecture.html). The diagram reflects the live cluster — verified against the AWS account on 2026-05.

**Runtime path:** Mobile App → HTTPS → ECS task on a single `t3.micro` (Public Subnet, public IP) → Supabase (Postgres + JWT verify) and third-party APIs (OpenAI, Expo Push, Google Places, Sentry).

**Deploy path:** GitHub Actions → ECR (image push) → ECS task pulls image, pulls secrets from Secrets Manager, streams logs to CloudWatch.

---

## Tech Stack

### Mobile

| Technology | Purpose |
|---|---|
| React Native 0.81 (Expo SDK 54) | Cross-platform mobile framework |
| Expo Router v6 | File-based navigation |
| Zustand v5 | Client state management |
| TanStack Query v5 | Server state / caching |
| NativeWind v4 | Tailwind CSS for React Native |
| React Hook Form + Zod v4 | Form handling + validation |
| MMKV | Encrypted local storage |
| FlashList | High-performance lists |
| expo-camera + expo-image-manipulator | Receipt scan capture |
| expo-blur | Glass effect on the top app bar |
| Sentry | Error monitoring + session replay |

### Backend

| Technology | Purpose |
|---|---|
| NestJS v11 | API framework |
| Drizzle ORM | Type-safe database access |
| OpenAI SDK (`gpt-4o-mini`) | Receipt OCR with structured output |
| Google Places API (New) | Workshop autocomplete + details |
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
| AWS ECR | Container registry |
| AWS Secrets Manager | Runtime env injection |
| AWS CloudWatch Logs | Centralised log group (`/ecs/kickstand-api`) |
| EAS Build | Mobile builds |
| EAS Update | OTA updates (Expo Go distribution) |
| Expo Push API | Push notifications |
| GitHub Actions | CI/CD |
| Sentry | Error monitoring + user feedback |

### LLM

| Provider | Usage |
|---|---|
| OpenAI (`gpt-4o-mini`) | Receipt OCR auto-fill — structured output, per-user daily cap + global RPM limiter |

---

## Features

### Backend API

- [x] Auth module — register, login, token refresh (Supabase Auth proxy with rollback on failure)
- [x] Bikes CRUD — create, read, update, delete with ownership guards
- [x] Mileage tracking with forward-only validation
- [x] Database schema — 12 tables via Drizzle ORM
- [x] 15 seeded service types (oil change, chain adjustment, brake pads, etc.)
- [x] Workshops module — Google Places autocomplete, upsert-from-place dedup, manual entry, Haversine proximity search, price comparison
- [x] Service logs module — full CRUD (paginated list, create, update, delete) with cost tracking
- [x] Receipt OCR module — Supabase Storage fetch, SHA-256 cache, OpenAI (`gpt-4o-mini`) structured-output extraction, per-user daily cap + global RPM limiter
- [x] Compliance status + maintenance status + attention (dashboard) modules
- [x] Bike catalog with 100+ models (Honda, Yamaha, Kawasaki, etc.)
- [x] Users module — get/update profile
- [x] Background jobs — compliance deadline scanner, maintenance reminders, workshop data freshness
- [x] Push notification registration & cron-based job triggers
- [x] SupabaseAuthGuard + @CurrentUser() decorator
- [x] Health check endpoint
- [x] Unit tests across auth, bikes, workshops, service-logs, OCR modules
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
- [x] Scan Receipt — camera flow → Supabase upload → OCR auto-fill with silent pre-fill into the service log form
- [x] Workshop Picker — Google Places autocomplete combo field, manual-entry fallback, previously-used workshops in empty state
- [x] Edit Service — pre-filled form with unsaved changes guard, receipt management
- [x] Settings — profile display, logout
- [x] Atelier design system — `components/ui/atelier/` primitives (Icon, Badge, IconBtn, Eyebrow, SectionHead, Row, StatCell, TopBar, TabBar, Pedestal, CategoryCell, FieldCard, BikeSwitcher) with Instrument Serif + Plus Jakarta Sans + JetBrains Mono typography
- [x] 80+ reusable UI components across the atelier primitives and feature-level components
- [x] ESLint + TypeScript strict mode
- [x] Sentry error tracking + session replay + in-app feedback button
- [x] EAS Update (OTA updates via Expo Go)
- [x] Service receipt photo upload via Supabase Storage
- [x] Swipe-to-edit/delete on service entries with haptic feedback
- [x] Service cost breakdown & analytics (monthly trends, category breakdown)
- [x] Jest + `@testing-library/react-native` coverage on form hooks and atelier primitives

### Coming Soon (v1.1+)

**UI Enhancements**
- [ ] Full-screen image viewer with pinch-to-zoom for receipt photos
- [ ] Dark mode (toggle exists in settings, not wired)

**Agent & Intelligence (planned)**
- [ ] Conversational AI agent with tool-calling access to bike profile, service history, compliance status, and workshop data
- [ ] Agent surfaces on the existing agent tab screen; framework and provider TBD

**Infrastructure & Settings**
- [ ] Personal info / security settings (menu items exist, not functional)
- [ ] Terraform IaC for all AWS infrastructure
- [ ] Kubernetes manifests for EKS/GKE deployment

---

## Design System

The mobile app uses the **Atelier** design system — full token spec in [`design-systems/DESIGN.md`](./design-systems/DESIGN.md).

- **Typography:** Instrument Serif (display), Plus Jakarta Sans (body), JetBrains Mono (labels + metadata)
- **Palette:** three variants (Studio Editorial, Moto Technical, Analog Warm) sharing a burnt-orange accent — used sparingly, one primary action per screen
- **Surfaces:** layered neutrals (`bg → bg-2 → surface`) instead of drop shadows; hairlines + whitespace instead of divider lines
- **Elevation:** drop shadows reserved for the floating tab bar and FAB only
- **Glass:** `expo-blur` reserved for the top app bar as a hierarchy signal
- **Primitives:** `components/ui/atelier/` — Icon, Badge, IconBtn, Eyebrow, SectionHead, Row, StatCell, TopBar, TabBar, Pedestal, CategoryCell, FieldCard, BikeSwitcher

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
│   │   │   │   ├── schema.ts         # Drizzle schema (12 tables)
│   │   │   │   ├── database.module.ts
│   │   │   │   └── database.types.ts
│   │   │   ├── modules/
│   │   │   │   ├── auth/             # Register, login, refresh
│   │   │   │   ├── bikes/            # CRUD + mileage
│   │   │   │   ├── bike-catalog/     # Make/model lookup
│   │   │   │   ├── users/            # Profile management
│   │   │   │   ├── workshops/        # Places autocomplete, upsert, proximity, price comparison
│   │   │   │   ├── service-logs/     # Maintenance record CRUD
│   │   │   │   ├── ocr/              # Receipt OCR (OpenAI + cache + rate limit)
│   │   │   │   ├── compliance-status/# Internal: per-bike compliance snapshot
│   │   │   │   ├── maintenance-status/# Internal: per-bike maintenance snapshot
│   │   │   │   ├── attention/        # /bikes/:bikeId/attention — combined feed
│   │   │   │   └── notifications/    # Push + cron scan jobs
│   │   │   ├── seeds/                # Service type + workshop seeder
│   │   │   ├── app.module.ts
│   │   │   ├── health.controller.ts
│   │   │   └── main.ts
│   │   ├── drizzle/                  # Migration files (0001..0008)
│   │   ├── Dockerfile                # Multi-stage build
│   │   └── test/
│   └── mobile/                       # Expo React Native app
│       ├── app/                      # Expo Router screens
│       ├── components/
│       │   └── ui/atelier/           # Atelier design-system primitives
│       ├── lib/                      # Hooks, stores, API clients, tokens
│       └── assets/
├── design-systems/
│   └── DESIGN.md                     # Atelier tokens, typography, motion
├── docs/
│   ├── design-plans/                 # Mobile design plans
│   ├── functional-requirements/      # Feature requirement specs
│   ├── plans/                        # Infrastructure plans (ECS, Terraform, K8s)
│   ├── research/                     # SG motorcycle community research
│   ├── user-stories/                 # SG-specific feature backlog
│   ├── COMPLETION_LOG.md
│   ├── sentry-webhook-workflow.md
│   └── user-testing-guide.md
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
SENTRY_DSN=

# Receipt OCR
OPENAI_API_KEY=your-openai-key
OPENAI_MODEL=gpt-4o-mini
OPENAI_GLOBAL_RPM=10
OPENAI_PER_USER_DAILY_CAP=50
OPENAI_CONFIDENCE_FLOOR=0.5

# Workshop picker
GOOGLE_PLACES_API_KEY=your-google-places-key
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
| `GET` | `/workshops/search?q=X` | Yes | Google Places autocomplete proxy |
| `GET` | `/workshops/mine` | Yes | Workshops previously used by the current user |
| `GET` | `/workshops/compare?service_type=X&bike_model=Y` | Yes | Compare prices |
| `GET` | `/workshops/:id` | Yes | Workshop details |
| `POST` | `/workshops` | Yes | Create a workshop (manual entry) |
| `POST` | `/workshops/upsert-from-place` | Yes | Upsert a workshop from a Google `placeId` |
| `GET` | `/service-logs` | Yes | List current user's service logs across bikes |
| `POST` | `/service-logs/ocr` | Yes | Extract structured fields from a receipt image URL |
| `GET` | `/bikes/:bikeId/services` | Yes | List service logs (paginated) |
| `GET` | `/bikes/:bikeId/services/:id` | Yes | Get service log detail |
| `POST` | `/bikes/:bikeId/services` | Yes | Log a service |
| `PATCH` | `/bikes/:bikeId/services/:id` | Yes | Update a service log |
| `DELETE` | `/bikes/:bikeId/services/:id` | Yes | Delete a service log |
| `GET` | `/bike-catalog/makes` | No | List all bike makes |
| `GET` | `/bike-catalog/models?make=Honda` | No | List models for make |
| `GET` | `/bike-catalog/:id` | No | Catalog entry details |
| `GET` | `/bikes/:bikeId/attention` | Yes | Compliance + maintenance attention feed for a bike |
| `POST` | `/notifications/register-token` | Yes | Register Expo push token |

---

## Background Jobs

| Job | Schedule | Description |
|---|---|---|
| Compliance Deadline Scanner | Daily 8am SGT | Tiered notifications at 30d / 14d / 7d / 1d before expiry |
| Maintenance Reminder | Weekly Monday 8am | Mileage-based service reminders |
| Workshop Data Freshness | Monthly | Flags unverified workshop pricing (>6 months stale) |

---

## Data Model

12 tables: `users`, `bikes`, `bike_catalog`, `service_types`, `maintenance_schedules`, `service_logs`, `workshops`, `workshop_services`, `notification_logs`, `agent_conversations`, `ocr_cache`, `ai_usage_logs`

Key relationships:
- A user owns many bikes
- A bike has many service logs
- Workshops offer many services with model-specific pricing (deduped on `google_place_id` where present)
- Notification and conversation logs are tied to users
- `ocr_cache` keys OCR results by image SHA-256; `ai_usage_logs` records every Gemini/OpenAI call for cost + rate-limit accounting

---

## Roadmap

**Phase 1 — MVP (shipped)**
- ✓ Bike profile management, multi-bike support
- ✓ Service logging with full CRUD and 15 service types
- ✓ Compliance tracking (COE, road tax, insurance, inspection) with auto-calculated SG dates
- ✓ Workshop directory with proximity search & price comparison
- ✓ Push notifications with compliance + maintenance cron scan jobs
- ✓ Deployed to AWS ECS on EC2 (ap-southeast-1) — direct public-IP ingress on the task
- ✓ Sentry error monitoring + in-app feedback
- ✓ EAS Update for OTA distribution

**Phase 2 — Polish (shipped)**
- ✓ Service log swipe-to-edit/delete with haptics
- ✓ Receipt photo upload & full-screen viewer
- ✓ Service history date-grouped timeline with advanced filtering
- ✓ Analytics sheet with cost breakdown by category
- ✓ Search + date range picker for service history
- ✓ Unsaved changes guard on forms
- ✓ Workshop picker — Google Places autocomplete, manual entry, previously-used shortcuts

**Phase 3 — OCR + Design System (shipped)**
- ✓ Scan-receipt camera flow with Supabase Storage upload
- ✓ OpenAI-powered receipt OCR with SHA-256 cache, per-user daily cap, global RPM limiter
- ✓ Workshop name → existing-workshop fuzzy matcher
- ✓ Atelier design system rollout (Instrument Serif + Plus Jakarta Sans + JetBrains Mono, hairline surfaces, glass top bar, burnt-orange accent)

**Phase 4 — Intelligence (planned)**
- Conversational AI agent with tool-calling (bike profile, service history, compliance status, workshop data)
- Workshop recommendation engine
- Framework and provider TBD

**Phase 5 — Infrastructure (queued)**
- Terraform IaC for all AWS resources
- Kubernetes manifests (EKS/GKE)

**Phase 6 — Community (future)**
- Community-contributed workshop data & reviews
- Crowd-sourced pricing updates
- Ride logs & trip tracking

**Phase 7 — Expansion (future)**
- Cross-border riding (Malaysia, Thailand) — VEP tracking, pre-departure checklists
- COE renewal planning tools
- License progression (2B → 2A → 2) notifications

---

## Deployment

| Service | Tier | Purpose |
|---|---|---|
| AWS ECS on EC2 (ap-southeast-1) | Free tier (t3.micro) | Backend hosting, co-located with Supabase |
| AWS ECR | Free tier | Docker image registry |
| AWS Secrets Manager | Free tier | Runtime env injection |
| AWS CloudWatch Logs | Free tier | Application logs |
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
