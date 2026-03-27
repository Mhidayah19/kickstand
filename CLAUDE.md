# Kickstand — Claude Code Guidelines

## Project Overview

Kickstand is a motorcycle maintenance and management platform. It consists of:

- **apps/api** — NestJS backend with Drizzle ORM, Supabase Auth, Expo push notifications
- **apps/mobile** — React Native (Expo) mobile app with NativeWind styling

This is an npm workspaces monorepo.

## Commands

- **Lint**: `npm run lint` (all workspaces) or `npm run lint --workspace=apps/api`
- **Test**: `npm run test` (all workspaces) or `npm run test --workspace=apps/api`
- **Test with coverage**: `npm run test:cov --workspace=apps/api`
- **Typecheck**: `cd apps/api && npx tsc --noEmit` or `cd apps/mobile && npx tsc --noEmit`
- **Start API dev**: `npm run api`
- **Start mobile**: `npm run mobile`

## Approach

- Always recommend the latest stable, industry-standard patterns and libraries — avoid deprecated or legacy approaches
- When multiple solutions exist, prefer the one most commonly adopted by the community and best supported long-term
- If a pattern used in this codebase has a better modern alternative, flag it and suggest the upgrade path
- Stay current with NestJS, Drizzle, Expo, and React Native ecosystem conventions

## Architecture

### API (NestJS)
- Modules: auth, bikes, workshops, service-logs, notifications
- Database: PostgreSQL via Drizzle ORM (schema in `apps/api/src/database/schema.ts`)
- Auth: Supabase with JWT guard (`common/guards/supabase-auth.guard.ts`)
- Notifications: Expo push + cron jobs for maintenance reminders, compliance scanning, workshop freshness
- Config: environment-based via `@nestjs/config` (`config/env.config.ts`)

### Mobile (React Native)
- Expo managed workflow
- NativeWind (Tailwind CSS for React Native)
- React Navigation

## Design Principles for Code Review

When reviewing or improving this codebase, evaluate against these principles
(reference: https://github.com/aridiosilva/DesignPrinciplesAndPatterns):

### SOLID
- **SRP**: Each service/controller should have a single responsibility
- **OCP**: Use NestJS modules and dependency injection to stay open for extension
- **LSP**: Ensure DTOs and interfaces are properly substitutable
- **ISP**: Keep interfaces focused — don't bloat service contracts
- **DIP**: Inject abstractions (use NestJS DI tokens), not concrete implementations

### Code Quality
- **DRY**: Extract shared query patterns, validation logic, and formatting helpers
- **KISS**: Prefer simple, readable implementations over clever abstractions
- **SoC**: Keep controllers thin (delegation only), services for business logic, jobs for scheduling
- **Law of Demeter**: Don't chain through object graphs — use direct dependencies
- **Command-Query Separation**: Keep query methods side-effect-free

### Codebase-Specific Patterns
- All database access goes through Drizzle via the `DRIZZLE` injection token
- Controllers use `@CurrentUser()` decorator for authenticated user context
- Notification jobs extend a cron pattern with dedup via `notificationLogs`
- DTOs use `class-validator` decorators for input validation

## Design Context

Full design context is in `.impeccable.md`. Summary:

### Brand: Kickstand
Mechanical precision meets editorial sophistication. Design system theme: "The Precision Atelier". Tone: **controlled, precise, considered**. Emotional goal: **calm and control**.

### Color Palette (NativeWind tokens)
- `charcoal` `#1E1E1E` — headings, structural weight, primary CTAs
- `yellow` `#F2D06B` — brand accent, one focal point per screen (use sparingly)
- `sand` `#C7B299` — secondary text, warmth
- `surface` / `surface-low` / `surface-card` — background layering
- `danger` `#DC2626` / `success` `#22C55E`

### Typography
**Plus Jakarta Sans exclusively. Never Regular (400) — minimum Medium (500).** Labels are all-caps with wide tracking.

### Key Rules
1. No divider lines — separate with background tonal shifts or whitespace
2. No drop shadows — use tonal layering (`surface` → `surface-low` → `surface-card`)
3. Yellow is precious — don't dilute it
4. Glassmorphism for floating elements (TopAppBar, FloatingTabBar) via `expo-blur`
5. Generous corner radius: cards `rounded-2xl`, large containers `rounded-3xl`
6. Inputs: `bg-surface-low`, no border, yellow 2px underline on focus
7. Design for light mode; use semantic tokens to keep dark mode viable later
