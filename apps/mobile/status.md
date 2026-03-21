# Precision Atelier Redesign — Status

**Branch:** `feature/precision-atelier-redesign`
**Worktree:** `.worktrees/precision-atelier`
**Date:** 2026-03-21

---

## What Was Done

### Phase 1: Token Foundation
- Installed `expo-blur` and `expo-linear-gradient`
- Added `PlusJakartaSans-ExtraBold.ttf` font, registered in `useAppFonts()`
- Replaced `tailwind.config.ts` with 10 new color tokens (charcoal, sand, yellow, surface, surface-low, surface-card, outline, danger, danger-surface, success), `font-sans-xbold`, `text-xxs`, custom letter-spacing, updated border-radius and spacing
- Stripped all CSS variables from `global.css` — now hardcoded tokens only

### Phase 2: Components
**6 new components created:**
- `TopAppBar` — blur backdrop header with avatar, "PRECISION ATELIER" title, notification bell
- `PrimaryButton` — full-width charcoal CTA with optional icon circle
- `BentoStat` — label + value stat card with optional yellow accent border
- `TimelineEntry` — timeline node + card for service history
- `ProfileHero` — profile card with decorative circles, avatar, name, role badge
- `BikeImageCard` — bike card with hero image, status badge, battery/tire stats

**12 existing components updated:**
- hero-card, screen-header, filter-chips, progress-bar, list-card, pill-badge, status-card, safe-screen, section, empty-state, text-field, bottom-sheet
- All migrated from old tokens (bg-hero, text-text-primary, etc.) to new tokens
- Added new props: screen-header (label, subtitle, size), filter-chips (wrap), progress-bar (value, color, label, statusText), list-card (icon, subtitle), etc.

**FloatingTabBar rebuilt:**
- Switched from Lucide to MaterialCommunityIcons
- BlurView dark backdrop
- 5 tabs: wrench, motorbike, microphone (center FAB), chart-bar, cog
- Center Agent FAB triggers BottomSheet overlay instead of navigation
- Tab layout reordered in `_layout.tsx`

### Phase 3: Screens
All 6 screens redesigned to match `stitch/` HTML mockups:

| Screen | File | Key Features |
|--------|------|-------------|
| Dashboard | `(tabs)/index.tsx` | Hero mileage card, compliance grid, recent services, precision badge |
| My Garage | `(tabs)/garage/index.tsx` | BikeImageCards, "Expand Your Fleet" CTA, fleet integrity summary |
| Bike Detail | `(tabs)/garage/[id]/index.tsx` | Full-bleed hero image, LinearGradient, bento stats, vitals bars, ride track CTA |
| Service Log | `(tabs)/garage/[id]/services.tsx` | Chip selector, bento form grid, evidence upload, save CTA |
| Service History | `(tabs)/log.tsx` | Timeline view with filter chips, total spend badge |
| Settings | `(tabs)/settings.tsx` | ProfileHero, grouped list options, appearance section, log out |
| Agent | `(tabs)/agent.tsx` | Empty placeholder (FAB triggers BottomSheet from layout) |

### Phase 4: Cleanup
- Deleted 4 deprecated components: status-dot, alert-banner, metric-display, bike-card
- Removed `lucide-react-native` dependency
- Migrated old tokens in 11+ remaining files (auth screens, forms, dialogs, etc.)
- TypeScript passes clean, all 20 tests pass

### Hotfixes
- **BottomSheet:** Replaced `react-native-reanimated` with plain RN `Animated` API to fix worklets version mismatch (`0.7.4 vs 0.5.1` crash)
- **Tab layout:** Removed redundant nested route entries (`garage/[id]/index`, `garage/[id]/edit`, `garage/[id]/services`) that caused Expo Router warnings — these are handled by the `garage/[id]/_layout.tsx` Stack navigator

---

## Current Situation

**18 commits** on the branch. Tests green (20/20). TypeScript clean.

**Pending verification:**
- Visual check of each screen against `stitch/` mockups in the iOS simulator
- The `react-native-reanimated` worklets mismatch may affect other animations in the app (e.g., skeleton loader uses `Animated` from RN already, so it's fine). A full native rebuild (`npx expo prebuild --clean && npx expo run:ios`) would resolve the mismatch permanently.
- Some screens use mock/placeholder data (service history, vitals, stats) — these need to be wired to real API data in a follow-up

**To run:**
```bash
cd /Users/hid/Developer/kickstand/.worktrees/precision-atelier/apps/mobile
npx expo start --clear
```

**Reference docs:**
- Spec: `docs/superpowers/specs/2026-03-21-precision-atelier-redesign-design.md`
- Plan: `docs/superpowers/plans/2026-03-21-precision-atelier-redesign.md`
- Stitch mockups: `stitch/` directory (each subfolder has `code.html` + `screen.png`)
