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

**Design system reference: [`design-systems/DESIGN.md`](./design-systems/DESIGN.md)** — read this before any mobile UI work.

Covers brand/tone, the full atelier token set (three variants: Studio Editorial, Moto Technical, Analog Warm), typography recipes (Instrument Serif + Plus Jakarta Sans + JetBrains Mono), spacing, radii, elevation, motion, layout, iconography, and how it maps to the Expo/NativeWind app (`apps/mobile/lib/colors.ts`, `lib/theme.ts`, `tailwind.config.ts`).

Non-negotiables when building UI:

- No drop shadows (except floating tab bar and FAB). Layer surfaces instead: `bg → bg-2 → surface`.
- No divider lines. Separate with hairlines + whitespace, or just whitespace.
- Accent (burnt orange) is precious — one primary action per screen.
- No emoji. No exclamation points. Field-journal terse copy.
- Glass (`expo-blur`) only on the top app bar — it's a hierarchy signal, don't dilute it.

## Diagrams

Architecture and system diagrams live in `assets/` (publicly visible — `docs/` is gitignored).
Each diagram ships as both `.html` (full-fidelity, browsable, source-of-truth for edits) and `.svg` (standalone, README-renderable on GitHub).
To create or edit one, use the `diagram-design` skill (already onboarded to the atelier palette).
Style tokens (paper / ink / muted / accent / link, typography) are defined in the skill's `references/style-guide.md` — do not inline new hex values directly into diagram files.
After editing the `.html`, regenerate the `.svg` so the README stays in sync.
