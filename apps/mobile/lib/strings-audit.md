# Copy audit — Head / Heart / Hands

Every user-facing string must pass three tests before shipping:
- **Head** — clear and unambiguous (no "soon", no vague)
- **Heart** — warm, not alarming (no "!", no urgency theatre)
- **Hands** — clear action (what can the user do?)

Graded: ✓ pass, ✗ fail, ~ acceptable-but-could-improve

| Location | String | Head | Heart | Hands | Notes / Rewrite |
|---|---|---|---|---|---|
| **index.tsx** | | | | | |
| `index.tsx` | `01 · Your garage` | ✓ | ✓ | ✓ | Label only — no action needed |
| `index.tsx` | `Welcome to Kickstand` | ✓ | ✓ | ~ | Fine as a heading; the EmptyState below carries the action |
| `index.tsx` | `No bikes yet` (empty state title) | ✓ | ✓ | ~ | Acceptable; EmptyState has an action |
| `index.tsx` | `Add your first bike to start tracking mileage and compliance` | ~ | ✓ | ✓ | "compliance" is jargon to a new user. Rewrite: **"Add your first bike to start tracking services and stay road-ready."** |
| `index.tsx` | `Add your first bike` (action label) | ✓ | ✓ | ✓ | Clear CTA |
| `index.tsx` | `01 · Current bike` | ✓ | ✓ | ✓ | Section label only |
| `index.tsx` | `{currentMileage} km · Last serviced {N} days ago` | ✓ | ✓ | ~ | "14 days ago" is fine; no action implied but context is clear |
| `index.tsx` | `Oil Change In` (hero pedestal eyebrow) | ✓ | ✓ | ✓ | Directional, clear |
| `index.tsx` | `Based on your last 60 days of riding · Tap for details` | ~ | ✓ | ✓ | "60 days" is fine but "Tap for details" is a weak affordance label on mobile — visually redundant for a tappable card. Consider removing or use "Details →" inline. ~ acceptable |
| `index.tsx` | `Pace vs Ideal` | ✓ | ✓ | ~ | Clear label; no action needed for graph legend |
| `index.tsx` | `Ideal` / `Actual` (legend) | ✓ | ✓ | ✓ | Fine |
| `index.tsx` | `Last service` / `Today` / `Projected` (graph axis) | ✓ | ✓ | ✓ | Fine |
| `index.tsx` | `Log lubrication` (callout primary CTA) | ✓ | ✓ | ✓ | Clear verb-object |
| `index.tsx` | `Read more` (callout secondary CTA) | ~ | ✓ | ~ | Vague — "more" of what? Acceptable in context since the callout body is clear. |
| `index.tsx` | `NEXT UP` (section eyebrow) | ✓ | ✓ | ✓ | Label only |
| `index.tsx` | `Upcoming services` (section label) | ✓ | ✓ | ✓ | Fine |
| `index.tsx` | `View all` (section action) | ✓ | ✓ | ~ | Acceptable |
| `index.tsx` | `Engine Oil` / `Chain Lube` / `Tyre Check` / `Brake Pads` (service card labels) | ✓ | ✓ | ✓ | Fine |
| `index.tsx` | `or 6 days` / `or 42 days` / `or 94 days` (supporting) | ~ | ✓ | ~ | "or" is implicit — acceptable in a tight numeric context |
| `index.tsx` | `LAST 12 MONTHS` (section eyebrow) | ✓ | ✓ | ✓ | Fine |
| `index.tsx` | `Cost breakdown` (section label) | ✓ | ✓ | ~ | Fine; "View" action makes it tappable |
| `index.tsx` | `View` (section action) | ~ | ✓ | ~ | Minimal but acceptable |
| `index.tsx` | `Tyres` / `Consumables` / `Repair` / `Modifications` / `Compliance` (category labels) | ~ | ✓ | ✓ | "Compliance" is internal jargon — rewrite: **"Registration & Inspection"** ✗ Head |
| `index.tsx` | `HISTORY` (section eyebrow) | ✓ | ✓ | ✓ | Fine |
| `index.tsx` | `Recent services` (section label) | ✓ | ✓ | ✓ | Fine |
| `index.tsx` | `View log` (section action) | ✓ | ✓ | ✓ | Fine |
| `index.tsx` | `No service logs yet` (empty state inline) | ✓ | ✓ | ✗ | No guidance on what to do. Rewrite: **"Nothing logged yet — tap + to record a service."** ✗ Hands |
| **prediction.tsx** | | | | | |
| `prediction.tsx` | `Prediction` (nav title) | ✓ | ✓ | ~ | Acceptable; screen title only |
| `prediction.tsx` | `Engine Oil` (eyebrow) | ✓ | ✓ | ✓ | Fine |
| `prediction.tsx` | `Prediction detail` (heading) | ~ | ✓ | ~ | Redundant with nav title + eyebrow. Rewrite: **"Your next oil change"** |
| `prediction.tsx` | `How we estimated your next service` (subheading) | ✓ | ✓ | ~ | Clear purpose statement; acceptable |
| `prediction.tsx` | `Preview confidence state` (dev toggle label) | ✓ | ✓ | ✓ | Dev-only UI, not user-facing at ship |
| `prediction.tsx` | `High` / `Med` / `Low` / `Unknown` (dev toggle options) | ✓ | ✓ | ✓ | Dev-only |
| `prediction.tsx` | `Oil Change In` (pedestal eyebrow) | ✓ | ✓ | ✓ | Fine |
| `prediction.tsx` | `or 18 days — whichever comes first` (high confidence supporting) | ✓ | ✓ | ✓ | Fine |
| `prediction.tsx` | `Or 16–22 days — we'll narrow this as you ride` (medium supporting) | ✓ | ✓ | ~ | "we'll narrow this as you ride" is warm and clear; ~ |
| `prediction.tsx` | `We need a bit more data to give you a precise number.` (low supporting) | ~ | ✓ | ✗ | Vague — what data? How? Rewrite: **"Log a service to tighten this estimate."** ✗ Hands ✗ Head |
| `prediction.tsx` | `Honda recommends 6,000 km between oil changes for the CB400X.` (unknown supporting) | ✓ | ✓ | ✓ | Clear provenance |
| `prediction.tsx` | `Based on 60 days of riding data, 3 previous oil changes at MotoWorks SG, and 14% higher than average riding intensity this month.` (high why) | ✓ | ✓ | ✓ | Clear, specific |
| `prediction.tsx` | `Based on 42 days of riding data. We have 1 prior oil change for comparison — the range will tighten after your next service.` (medium why) | ✓ | ✓ | ✓ | Good |
| `prediction.tsx` | `Based on 18 days of riding data and no prior oil changes logged for this bike. Log a few more rides for a precise estimate.` (low why) | ~ | ✓ | ~ | "Log a few more rides" is vague — rides don't directly help, services do. Rewrite: **"Based on 18 days of data. Record your next oil change to get a personalised estimate."** |
| `prediction.tsx` | `We don't have personal data yet — this is Honda's recommended interval straight from the CB400X service manual.` (unknown why) | ✓ | ✓ | ✓ | Honest and warm |
| `prediction.tsx` | `Why this number ·` (inline label) | ✓ | ✓ | ✓ | Fine as a callout header |
| `prediction.tsx` | `Prediction accuracy` | ✓ | ✓ | ~ | Fine as section label |
| `prediction.tsx` | `± 40 km avg` | ✓ | ✓ | ✓ | Clear stat |
| `prediction.tsx` | `Previous oil change predictions landed within 40 km of actual service on average. This one will too.` | ~ | ~ | ~ | "This one will too." is overconfident — not earned. Rewrite: **"Previous oil change predictions landed within 40 km of actual service on average."** (remove the last sentence) |
| `prediction.tsx` | `Contributing factors` (section label) | ✓ | ✓ | ~ | Fine |
| `prediction.tsx` | `Riding intensity` / `Last 60 days distance` / `Days since last service` / `Your avg interval` (factor labels) | ✓ | ✓ | ✓ | Fine |
| `prediction.tsx` | `+14%` (danger value for riding intensity) | ~ | ~ | ✗ | Shown in red — danger framing for simply riding more is alarming. A 14% increase in riding is normal. ✗ Heart ✗ Hands — no indication of what this means or what to do. Rewrite value label context: shown in `text-danger` but should use `text-charcoal` with a neutral label. Flag for source fix. |
| `prediction.tsx` | `Log this service` (CTA) | ✓ | ✓ | ✓ | Clear verb-object |
| **quick-log.tsx** | | | | | |
| `quick-log.tsx` | `Quick log` (eyebrow) | ✓ | ✓ | ~ | Acceptable label |
| `quick-log.tsx` | `Odometer reading` (heading) | ✓ | ✓ | ~ | Clear; action is the keypad below |
| `quick-log.tsx` | `Current reading` (field label) | ✓ | ✓ | ~ | Slightly ambiguous — "current" or "new"? Rewrite: **"New reading"** |
| `quick-log.tsx` | `Previous: {N} km · +{delta} km` (context hint) | ✓ | ✓ | ✓ | Useful delta confirmation |
| `quick-log.tsx` | `Save reading` (CTA) | ✓ | ✓ | ✓ | Clear |
| **category/[slug].tsx** | | | | | |
| `category/[slug].tsx` | `Category` (nav title) | ~ | ✓ | ~ | Generic. At runtime shows "Category" always — should be the category name. Acceptable for v1 static. |
| `category/[slug].tsx` | `Category · Last 12 months` (eyebrow) | ✓ | ✓ | ✓ | Fine |
| `category/[slug].tsx` | `{data.label}` (heading — e.g. "Tyres") | ✓ | ✓ | ✓ | Fine |
| `category/[slug].tsx` | `{data.meta}` (subheading — e.g. "S$ 860 across 3 services") | ✓ | ✓ | ✓ | Fine |
| `category/[slug].tsx` | `Lifetime spend` (pedestal eyebrow) | ~ | ✓ | ~ | "Lifetime" is inaccurate — the data shows 12-month totals, not lifetime. Rewrite: **"12-month spend"** ✗ Head |
| `category/[slug].tsx` | `Per km` (metric label) | ✓ | ✓ | ~ | Fine as label |
| `category/[slug].tsx` | `Vs avg SG rider` (metric label) | ✓ | ✓ | ~ | Fine; SG locale-specific |
| `category/[slug].tsx` | `Next due` (metric label) | ✓ | ✓ | ~ | Fine |
| `category/[slug].tsx` | `12-month trend` (section label) | ✓ | ✓ | ✓ | Fine |
| `category/[slug].tsx` | `SGD` (axis label) | ✓ | ✓ | ✓ | Fine |
| `category/[slug].tsx` | `Purchases` (section label) | ✓ | ✓ | ✓ | Fine |
| `category/[slug].tsx` | `{p.shop} · {p.days} days ago` (purchase subtitle) | ✓ | ✓ | ✓ | Fine |
| **countdown-display.tsx** | | | | | |
| `countdown-display.tsx` | No hardcoded user-facing strings — all passed as props | ✓ | ✓ | ✓ | Component is string-agnostic |
| **confidence-badge.tsx** | | | | | |
| `confidence-badge.tsx` | `High confidence` | ✓ | ✓ | ~ | Accurate but "confidence" is technical. Acceptable in context. |
| `confidence-badge.tsx` | `Medium confidence` | ~ | ✓ | ~ | "Medium" is vague — medium compared to what? ~ acceptable in small badge |
| `confidence-badge.tsx` | `Low confidence` | ~ | ~ | ✗ | "Low confidence" sounds like the app doubts itself — alarming framing. ✗ Heart ✗ Hands. Rewrite: **"Early estimate"** |
| `confidence-badge.tsx` | `Manufacturer default` | ✓ | ✓ | ~ | Honest and clear |
| **dismissible-callout.tsx** | | | | | |
| `dismissible-callout.tsx` | No hardcoded content strings — all passed as props | ✓ | ✓ | ✓ | String-agnostic component |
| **seasonal.ts** | | | | | |
| `seasonal.ts` | `SEASONAL · SINGAPORE` (NE monsoon eyebrow) | ✓ | ✓ | ✓ | Fine |
| `seasonal.ts` | `Northeast monsoon is on.` (NE title) | ✓ | ~ | ~ | Present-tense statement is fine; period instead of "!" is correct. ~ |
| `seasonal.ts` | `Wet roads plus a worn chain is how skids start. Your chain is due for lubrication soon — worth doing this week.` (NE body) | ✗ | ✗ | ~ | "how skids start" is alarming (fear framing). "soon" is vague (fails Head). Rewrite: **"Wet roads amplify wear on a dry chain. If your chain is due for lubrication, this week is a good time."** |
| `seasonal.ts` | `SEASONAL · SINGAPORE` (SW monsoon eyebrow) | ✓ | ✓ | ✓ | Fine |
| `seasonal.ts` | `Southwest monsoon starts soon.` (SW title) | ✗ | ✓ | ~ | "starts soon" fails Head — vague timing. Rewrite: **"Southwest monsoon season (Jun–Sep)"** |
| `seasonal.ts` | `Sudden afternoon storms are common. Check your tyre tread and chain lubrication before the weekend.` (SW body) | ~ | ~ | ✓ | "Sudden" is slightly alarming but not egregious. Rewrite: **"Afternoon showers are common this time of year. Worth checking your tyre tread and chain lubrication before the weekend."** |

---

## Summary of 2+ fail strings (rewrites applied to source)

| String | Fails | Rewrite applied |
|---|---|---|
| `We need a bit more data to give you a precise number.` (prediction low supporting) | Head ✗ Hands ✗ | → `"Log a service to tighten this estimate."` |
| `Previous oil change predictions landed within 40 km of actual service on average. This one will too.` | Heart ~ (overconfident) | → removed last sentence |
| `Low confidence` (confidence badge) | Heart ✗ Hands ✗ | → `"Early estimate"` |
| `Wet roads plus a worn chain is how skids start. Your chain is due for lubrication soon — worth doing this week.` (NE monsoon body) | Head ✗ Heart ✗ | → `"Wet roads amplify wear on a dry chain. If your chain is due for lubrication, this week is a good time."` |
| `Southwest monsoon starts soon.` (SW title) | Head ✗ | → `"Southwest monsoon season (Jun–Sep)"` |
| `No service logs yet` (home screen inline empty) | Hands ✗ | → `"Nothing logged yet — tap + to add a service."` |
| `Lifetime spend` (category pedestal) | Head ✗ (data is 12-month not lifetime) | → `"12-month spend"` |

### Single-fail strings (noted but not changed)
- `Add your first bike to start tracking mileage and compliance` — "compliance" is jargon; borderline single fail
- `Current reading` (quick-log) — slightly ambiguous; renamed to `"New reading"` (clear win, applied)
- `Prediction detail` (heading) — redundant; renamed to `"Your next oil change"` (single fail Head, applied as improvement)
- `+14%` in danger red for riding intensity — alarming framing for neutral data (applied: changed colour to charcoal)
- `Sudden afternoon storms are common.` (SW body) — slightly alarming; softened to `"Afternoon showers are common this time of year."`
