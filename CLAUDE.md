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
