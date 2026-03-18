# Notifications Module — Design Spec

**Date:** 2026-03-19
**Status:** Approved
**Depends on:** Backend Phase 1 (Auth, Bikes), Backend Phase 2 (Workshops, Service Logs)

---

## 1. Purpose

Push notification system for Kickstand that alerts riders about upcoming compliance deadlines (COE, road tax, insurance, inspection) and maintenance due dates. Includes a workshop data freshness check for backend housekeeping.

---

## 2. Module Structure

```
src/modules/notifications/
  notifications.module.ts
  notifications.controller.ts
  notifications.service.ts
  notifications.service.spec.ts
  notifications.controller.spec.ts
  dto/
    register-token.dto.ts
  guards/
    api-key.guard.ts
  jobs/
    compliance-scanner.job.ts
    compliance-scanner.job.spec.ts
    maintenance-reminder.job.ts
    maintenance-reminder.job.spec.ts
    workshop-freshness.job.ts
    workshop-freshness.job.spec.ts
src/seeds/
  seed-maintenance-schedules.ts
```

**Separation of concerns:** Jobs contain scan/query logic. `NotificationsService` handles push delivery, token management, and dedup checks against `notification_logs`. Jobs call the service to send.

---

## 3. Endpoints

### POST /notifications/register-token

- **Auth:** `SupabaseAuthGuard` + `@CurrentUser()`
- **Body:** `{ expoToken: string }`
- **Logic:** Updates `users.expoToken` for the authenticated user
- **Response:** `{ success: true }`

### POST /notifications/trigger-scan

- **Auth:** Custom `ApiKeyGuard` — checks `x-api-key` header against `SCAN_API_KEY` env var
- **Query:** `?job=compliance|maintenance|freshness|all` (defaults to `all`)
- **Logic:** Runs the specified job(s) synchronously
- **Response:** `{ job: string, usersNotified: number, notificationsSent: number }` — when `job=all`, counts are summed across all jobs
- **Purpose:** Called by GitHub Actions daily at 8am SGT (Render free tier spins down, so in-process cron is unreliable)

**Job method signatures:** Each job class exposes a `run()` method returning `Promise<{ usersNotified: number; notificationsSent: number }>`. The controller calls the requested job(s) and aggregates the counts.

The `@Cron` decorators remain on jobs as a fallback for when the server stays warm, but the HTTP endpoint is the primary trigger.

---

## 4. ApiKeyGuard

Custom guard at `src/modules/notifications/guards/api-key.guard.ts`.

- Reads `x-api-key` from request headers
- Compares against `SCAN_API_KEY` from `ConfigService`
- Throws `UnauthorizedException` on mismatch
- Applied only to the `trigger-scan` endpoint

---

## 5. Compliance Scanner Job

**Schedule:** Daily at 8am SGT (`@Cron('0 8 * * *', { timeZone: 'Asia/Singapore' })`)

**Deadline fields scanned:** `coeExpiry`, `roadTaxExpiry`, `insuranceExpiry`, `inspectionDue`

**Tier system:**

| Tier | Window |
|------|--------|
| 30d  | Deadline is 29–30 days from today |
| 14d  | Deadline is 13–14 days from today |
| 7d   | Deadline is 6–7 days from today |
| 1d   | Deadline is 0–1 days from today |

1-day windows (not cumulative) prevent re-triggering if the job runs multiple times per day.

**No notifications after expiry** — only upcoming deadlines.

**Algorithm:**

1. For each tier, query all bikes where any deadline field falls within the tier's window
2. For each bike + deadline field + tier, check `notification_logs` — skip if already sent
3. Batch per tier: one push notification per bike per tier, listing only the **unsent** deadlines at that tier. If some deadlines at a tier were already sent and others weren't, send only the new ones.
4. Insert `notification_logs` entries for each deadline field included in the sent notification

**Dedup key:** `userId` + `bikeId` + `type=compliance` + `deadlineField` + `tier`

**Notification copy examples:**

- 30d: "Heads up — your road tax expires on 15 Apr"
- 14d: "Your road tax expires in 2 weeks"
- 7d: "Road tax expires in 7 days — don't forget"
- 1d: "Road tax expires TOMORROW"
- Batched: "2 deadlines coming up: road tax (15 Apr) and insurance (22 Apr)"

---

## 6. Maintenance Reminder Job

**Schedule:** Weekly Monday 8am SGT (`@Cron('0 8 * * 1', { timeZone: 'Asia/Singapore' })`)

**Algorithm:**

1. For each user's bike, look up `maintenance_schedules` by `bikeModel`
2. For each schedule entry, find the most recent `service_log` of that `serviceType` for the bike
3. Calculate due status:
   - **Due by mileage:** `currentMileage - lastServiceMileage >= intervalKm`
   - **Due by time:** months since last service >= `intervalMonths`
   - **Approaching:** has used >= 80% but < 100% of mileage or time interval (e.g., at 4000km of a 5000km interval)
4. Dedup via `notification_logs` (type=`maintenance`, deadlineField=serviceType, tier=`due` or `approaching`)
5. Batch all due/approaching items per bike into one push notification

**Notification copy examples:**

- Due: "Oil change overdue — last done at 10,000km, you're now at 15,500km"
- Approaching: "You're 500km away from your next oil change"
- Batched: "2 services due on your CB400X: oil change (overdue), chain adjustment (approaching)"

---

## 7. Workshop Freshness Job

**Schedule:** Monthly 1st at midnight SGT (`@Cron('0 0 1 * *', { timeZone: 'Asia/Singapore' })`)

**Algorithm:**

1. Query `workshop_services` where `lastVerified` is older than 6 months
2. Log a summary (count of stale entries) — no push notification to users
3. This is backend housekeeping. Note: `WorkshopsService.flagVerificationStatus()` handles display-time flagging at query time — the freshness job queries `workshop_services` directly, it does not call that method

**No user-facing notifications.** This job exists for admin observability.

---

## 8. NotificationsService

Wraps `expo-server-sdk` for push delivery:

### Methods

- **`registerToken(userId, expoToken)`** — Updates `users.expoToken`
- **`sendPush(expoToken, title, body)`** — Sends a single push notification via Expo
- **`sendBatchPush(messages: ExpoPushMessage[])`** — Sends multiple notifications in one Expo API call (uses `expo-server-sdk` types)
- **`hasAlreadySent(userId, bikeId, type, deadlineField, tier)`** — Checks `notification_logs` for dedup
- **`logNotification(userId, bikeId, type, deadlineField, tier)`** — Inserts into `notification_logs`

### Error Handling

- `DeviceNotRegistered` error from Expo → clear `users.expoToken`, skip notification
- Invalid push token format → skip, log warning
- Expo API failure → log error, do not insert into `notification_logs` (allows retry on next run)

---

## 9. DTOs

### RegisterTokenDto

```typescript
export class RegisterTokenDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^ExponentPushToken\[.+\]$/)
  expoToken: string;
}
```

---

## 10. Seed Data — Maintenance Schedules

`src/seeds/seed-maintenance-schedules.ts` covers common SG bike models with realistic intervals.

**Models:** Honda CB400X, Yamaha MT-07, Kawasaki Ninja 400, Honda PCX 160, Yamaha NMAX

**Service intervals:**

| Service Type | Interval KM | Interval Months |
|---|---|---|
| oil_change | 5000 | 6 |
| chain_adjustment | 1000 | 3 |
| chain_replacement | 20000 | — |
| brake_pads | 15000 | 24 |
| brake_fluid | — | 24 |
| coolant | — | 24 |
| air_filter | 12000 | 12 |
| spark_plugs | 12000 | 12 |
| tire_front | 15000 | 24 |
| tire_rear | 12000 | 18 |
| general_service | 5000 | 6 |

Not all service types apply to all models — `valve_clearance`, `battery`, `fork_oil`, and `clutch` are omitted as they are model-specific or rare enough to not warrant default schedules. The seed uses `onConflictDoNothing()`.

---

## 11. Dependencies

**New npm package:** `expo-server-sdk` — Expo's official Node.js SDK for push notifications.

**Existing:** `@nestjs/schedule` is already installed. `ScheduleModule.forRoot()` must be added to `AppModule.imports` for `@Cron` decorators to work. `NotificationsModule` must also be registered in `AppModule`.

---

## 12. Environment Variables

| Variable | Purpose |
|---|---|
| `SCAN_API_KEY` | API key for trigger-scan endpoint |

Added to `.env` and `.env.example`.

---

## 13. GitHub Actions Workflow

A scheduled workflow at `.github/workflows/notification-cron.yml`:

- Runs daily at 0:00 UTC (8:00 SGT)
- Sends `POST /notifications/trigger-scan?job=all` with `x-api-key` header
- Uses `SCAN_API_KEY` and `API_URL` from GitHub Actions secrets

---

## 14. Testing Strategy

**Unit tests (Jest, mock DB layer):**

- `compliance-scanner.job.spec.ts` — tier window calculation, dedup check, batching logic, no-notification-after-expiry
- `maintenance-reminder.job.spec.ts` — due/approaching calculation, dedup, batching
- `workshop-freshness.job.spec.ts` — stale entry detection
- `notifications.service.spec.ts` — token registration, push delivery, error handling (DeviceNotRegistered), dedup check
- `notifications.controller.spec.ts` — endpoint routing, guard application, job dispatch

**Key test cases for compliance scanner:**

1. Bike with road tax expiring in 7 days → sends 7d notification
2. Same bike+deadline+tier already in notification_logs → skips
3. Deadline in the past → no notification
4. Two deadlines at the same tier → batched into one notification
5. Two deadlines at different tiers → separate notifications

**Key test cases for maintenance reminder:**

1. Oil change due by mileage → sends "due" notification
2. Oil change approaching (80% of interval) → sends "approaching" notification
3. No maintenance_schedule for bike model → skips gracefully
4. No service_logs for bike → skip time-based checks (no reference date available), for mileage-based checks use lastServiceMileage=0 and compare against currentMileage
