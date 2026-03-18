# Kickstand API

NestJS backend for the Kickstand motorcycle ownership platform. Handles authentication, bike management, and (soon) workshop search, service logging, and an AI conversational agent.

## Running locally

```bash
# From repo root
npm install

# Configure environment
cp apps/api/.env.example apps/api/.env
# Fill in your Supabase credentials

# Run migrations and seed
cd apps/api
npx drizzle-kit push
npm run seed:service-types

# Start in dev mode (from repo root)
npm run api
```

The server starts at `http://localhost:3000`.

## Available scripts

| Script | Description |
|---|---|
| `npm run start:dev` | Start with file watching |
| `npm run start:debug` | Start with debugger |
| `npm run build` | Compile to `dist/` |
| `npm run start:prod` | Run compiled output |
| `npm test` | Run unit tests |
| `npm run test:cov` | Run tests with coverage |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run lint` | Lint and auto-fix |
| `npm run format` | Format with Prettier |
| `npm run seed:service-types` | Seed 15 motorcycle service types |

## Endpoints

### Live

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | No | Create account (proxies Supabase Auth) |
| `POST` | `/auth/login` | No | Sign in |
| `POST` | `/auth/refresh` | No | Refresh access token |
| `GET` | `/bikes` | Yes | List user's bikes |
| `POST` | `/bikes` | Yes | Add a bike |
| `PATCH` | `/bikes/:id` | Yes | Update bike details |
| `DELETE` | `/bikes/:id` | Yes | Remove a bike |
| `PATCH` | `/bikes/:id/mileage` | Yes | Update mileage (forward-only validation) |
| `GET` | `/health` | No | Health check |

### Planned

- `GET/POST/DELETE /bikes/:bikeId/services` — service log CRUD
- `GET /workshops` — proximity search via Haversine
- `GET /workshops/compare` — price comparison
- `POST /agent/converse` — AI agent conversation
- `POST /notifications/register-token` — push token registration
- `POST /notifications/trigger-scan` — compliance scan trigger

## Environment variables

See `.env.example` for the full list:

- `PORT` — server port (default 3000)
- `SUPABASE_DATABASE_URL` — PostgreSQL connection string
- `SUPABASE_JWT_SECRET` — JWT verification secret
- `SUPABASE_URL` — Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` — service role key for admin operations
- `SCAN_API_KEY` — API key for triggering compliance scans

## Testing

```bash
npm test              # unit tests
npm run test:cov      # with coverage report
npm run test:e2e      # end-to-end tests
```

Unit tests exist for the auth and bikes modules (controllers + services).

## Tech

NestJS v11, Drizzle ORM, Supabase (Auth + PostgreSQL), Passport JWT, Pino logging, Helmet, @nestjs/throttler.
