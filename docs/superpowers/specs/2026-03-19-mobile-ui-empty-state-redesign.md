# Mobile UI: Empty State Redesign — Design Spec

**Date:** 2026-03-19
**Status:** Approved
**Parent spec:** `docs/superpowers/specs/2026-03-19-mobile-ui-design.md`
**Inspiration:** NOTEE by Ronas IT (Dribbble) — onboarding screen layout
**Worktree:** `feat/mobile-ui-foundation` at `.worktrees/mobile-ui-foundation`

---

## Problem

The current empty state (no bikes) shows a tiny "No bikes yet" message centered in a sea of cream background. The tab bar has duplicate house icons (route mapping bug). The screen feels broken, not inviting.

## Solution

Replace the empty state on the Dashboard (home tab) with a NOTEE-style onboarding welcome screen. Fix the tab bar icon mapping. The garage empty state stays simpler since users who navigate there already know the app.

---

## 1. Dashboard Empty State Layout

Follows NOTEE's exact layout structure, adapted to Kickstand's Soft Tarmac palette:

```
SafeScreen (bg-background, no scroll needed)
  1. App name         — "KICKSTAND" top-left, font-sans-bold, text-lg, tracking-wide
  2. Illustration     — Motorcycle SVG in a rounded card (bg-surface-muted, rounded-2xl)
                         Takes ~50% of screen height
                         Geometric line-art motorcycle: dark strokes (#1c1917),
                         amber accents on wheel hubs, tank stripe, headlight (#d97706)
                         Subtle road/ground line at bottom of card
                         Shadow under bike (ellipse, low opacity)
  3. Headline         — Bold, 28px, font-sans-bold, text-primary
                         "Track your ride,\nstay road-legal,\n[ride easy.]"
                         "ride easy." wrapped in amber highlight (bg-accent-surface,
                         rounded-md, px-sm)
  4. Feature icons    — Horizontal row of 5 circular icons (42px)
                         First icon: bg-hero, icon stroke hero-text (active style)
                         Rest: bg-surface-muted, icon stroke text-primary
                         Icons: ChartBar, Shield, Wrench, Mic, Sun
                         (Mileage, Compliance, Services, AI Agent, Settings)
  5. CTA button       — "Get started", bg-hero, text-hero-text, rounded-full,
                         full-width, py-lg, font-sans-bold, shadow-md
                         onPress → router.push('/(tabs)/garage/add')
```

### Key Design Decisions

- **No dark hero card** — matches NOTEE's light, open layout. The illustration area uses `surface-muted` not `hero`.
- **"Get started" not "Add your first bike"** — warmer, less transactional. Routes to add bike form.
- **Feature icon row** — shows app capabilities at a glance. First icon dark = "this is where you start" hint. Not interactive, purely visual.
- **Amber highlight on "ride easy."** — uses `accent-surface` (#fef7ed) background, matching Kickstand's warm palette. Same pattern as NOTEE's green highlight on "right away!".

---

## 2. Motorcycle Illustration Component

New file: `components/illustrations/motorcycle.tsx`

SVG inline component, not an external asset. Props: `width?`, `height?`.

Visual description:
- **Wheels**: Two circles with hub detail, amber (#d97706) filled center dots (4px radius)
- **Frame**: Connected path from rear axle → engine area → headstock → front axle
- **Tank**: Dominant curved shape at top, with amber accent stripe
- **Seat**: Small curved path extending behind tank
- **Engine**: Rounded rectangle with vertical fin lines (detail)
- **Exhaust**: Curved path from engine to rear wheel area, muted color (#78716c)
- **Handlebars**: Two short lines extending from headstock
- **Headlight**: Circle with amber fill + subtle beam lines
- **Shadow**: Ellipse below bike, very low opacity
- **Ground line**: Dashed center line at bottom of illustration area

Color approach:
- Primary strokes: `#1c1917` (text-primary/hero)
- Accent fills: `#d97706` (accent) — hubs, headlight, tank stripe
- Muted strokes: `#78716c` (text-secondary) — exhaust, detail lines
- All hardcoded (not theme tokens) since SVG doesn't read CSS vars in RN

---

## 3. Garage Empty State

The garage screen keeps a simpler empty state (user navigated here intentionally):

```
EmptyState (existing component, minor polish)
  Icon: motorcycle illustration at smaller size (120x70)
  Title: "No bikes yet"
  Description: "Add your first bike to get started"
  Action: "Add bike" button (bg-hero, rounded-full)
```

---

## 4. Tab Bar Fix

The floating tab bar shows duplicate house icons in the screenshot. The `href: null` fix for sub-routes is already implemented in `_layout.tsx`. Verify the icon mapping in `FloatingTabBar` is correct — the `TAB_ICONS` map should match exactly 5 routes:

- `index` → Home (House icon)
- `garage` → Garage (Grid2x2 icon)
- `log` → FAB center (Plus icon)
- `agent` → Agent (Mic icon)
- `settings` → Settings (Settings icon)

If the tab bar still shows duplicates, the issue is likely in how routes are filtered before rendering — investigate and fix.

---

## 5. Files Changed

| File | Action | Description |
|------|--------|-------------|
| `components/illustrations/motorcycle.tsx` | Create | SVG motorcycle illustration component |
| `components/ui/empty-state.tsx` | Modify | Add `variant` prop: `'welcome'` (new full-screen onboarding) vs `'inline'` (current behavior, default) |
| `app/(tabs)/index.tsx` | Modify | Dashboard empty state → welcome onboarding layout |
| `app/(tabs)/_layout.tsx` | Modify | Fix tab screen options, add `href: null` to hidden routes |
| `components/ui/floating-tab-bar.tsx` | Modify | Verify icon mapping is correct for 5 tabs |
| `app/(tabs)/garage/index.tsx` | Modify | Use motorcycle illustration in garage empty state |

---

## 6. Out of Scope

- Dark mode SVG variant: hardcoded dark strokes (#1c1917) will have low contrast against dark mode `surface-muted` (#3a3633). A conditional stroke color or separate dark variant should be addressed post-MVP.
- Animation on the motorcycle illustration (nice-to-have, not MVP)
- Feature icon interactivity (they're decorative only)
- Other screens beyond empty state
