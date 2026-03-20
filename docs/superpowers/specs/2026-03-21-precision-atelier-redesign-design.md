# Precision Atelier — Frontend Redesign

**Date:** 2026-03-21
**Status:** Draft
**Reference:** `stitch/` directory (HTML mockups per screen)

---

## 1. Overview

Full visual redesign of the Kickstand mobile app to the "Precision Atelier" design system. This covers:

- New color token system (light mode only)
- Icon library migration (Lucide → MaterialCommunityIcons)
- Navigation restructure (5 tabs with center Agent FAB)
- All 7 screens rebuilt to match HTML mockups
- Updated and new UI components

## 2. Design Tokens

### 2.1 Colors

Streamlined palette replacing the current CSS variable system with hardcoded values.

| Token | Hex | Usage |
|-------|-----|-------|
| `charcoal` | `#1E1E1E` | Primary text, hero bg, nav bg, buttons |
| `sand` | `#C7B299` | Secondary text, muted labels, inactive nav icons |
| `yellow` | `#F2D06B` | Accent, active tab, CTAs, badges, progress bars |
| `surface` | `#F9F9F9` | Page background |
| `surface-low` | `#F3F3F3` | Input fields, vitals sections, secondary cards |
| `surface-card` | `#FFFFFF` | Elevated cards |
| `outline` | `#D0C5BA` | Borders, dividers, dashed outlines |
| `danger` | `#DC2626` | Errors, overdue badges, critical states |
| `danger-surface` | `#FFDAD6` | Light danger background |
| `success` | `#22C55E` | Healthy indicators |

**Token migration mapping (old → new):**
- `background` (#faf8f5) → `surface` (#F9F9F9) — page background
- `surface` (#ffffff) → `surface-card` (#FFFFFF) — elevated cards. **Every file using `bg-surface` for cards must migrate to `bg-surface-card`.**
- `surface-muted` (#f0ece6) → `surface-low` (#F3F3F3) — secondary backgrounds
- `text-primary` → `charcoal`
- `text-secondary` / `text-muted` → `sand`
- `accent` → `yellow`
- `accent-surface` (#fef7ed) → `yellow` at opacity-10 (use `bg-yellow/10`) — no dedicated token needed
- `hero` → `charcoal`
- `hero-text` → white (`text-white`) — used for text on charcoal hero backgrounds
- `hero-muted` → `sand` — used for muted text on hero/nav backgrounds
- `border` / `border-subtle` → `outline`
- `warning` (#ea580c) → `yellow` — folded into accent (the new design uses yellow for warnings)
- `warning-surface` (#fff7ed) → `yellow` at opacity-10 (use `bg-yellow/10`)
- `danger` → `danger` (same semantic, updated hex)
- `danger-surface` → `danger-surface` (same semantic)
- `success` → `success` (unchanged)
- `success-surface` (#f0fdf4) → `success` at opacity-10 (use `bg-success/10`) — no dedicated token needed

**Migration:** Remove all CSS variables from `global.css`. Replace `var(--color-*)` references in `tailwind.config.ts` with hardcoded hex values. Update all component classnames from old token names to new ones per the mapping above.

### 2.2 Typography

Font: **Plus Jakarta Sans** (already installed, ExtraBold must be added)

| Token | Weight | File | Usage |
|-------|--------|------|-------|
| `font-sans` | Regular (400) | `PlusJakartaSans-Regular.ttf` | Base text (unchanged) |
| `font-sans-medium` | Medium (500) | `PlusJakartaSans-Medium.ttf` | Body text, descriptions |
| `font-sans-semibold` | SemiBold (600) | `PlusJakartaSans-SemiBold.ttf` | Retained for compatibility |
| `font-sans-bold` | Bold (700) | `PlusJakartaSans-Bold.ttf` | Labels, card titles, nav text |
| `font-sans-xbold` | ExtraBold (800) | `PlusJakartaSans-ExtraBold.ttf` | Headlines, hero numbers |

**Migration:** Download `PlusJakartaSans-ExtraBold.ttf` from [Google Fonts](https://fonts.google.com/specimen/Plus+Jakarta+Sans), add to `assets/fonts/`, and register in `useAppFonts()` (`lib/theme.ts`). All existing font tokens are preserved — only `font-sans-xbold` is new.

### 2.3 Spacing

Keep current tokens, add `4xl`:

```
xs: 4px, sm: 8px, md: 12px, lg: 16px, xl: 20px, 2xl: 24px, 3xl: 32px, 4xl: 48px
```

### 2.4 Border Radius

Updated to match the rounder design language (intentional change from current `xl: 18px`):

```
sm: 8px, md: 12px, lg: 16px, xl: 20px, 2xl: 24px, 3xl: 32px
```

### 2.5 Custom Text Size

The HTML designs use 10px labels frequently. Tailwind's `text-xs` is 12px. Add a custom size:

```
text-xxs: 10px (line-height: 14px)
```

### 2.6 Letter Spacing

The HTML uses `tracking-[0.2em]` and `tracking-[0.15em]`, but React Native requires pixel values. Add custom tokens:

```
tracking-wide-1: 2px    (replaces tracking-[0.15em] at ~14px font)
tracking-wide-2: 3px    (replaces tracking-[0.2em] at ~14px font)
tracking-widest: 4px    (replaces Tailwind default tracking-widest which uses em units)
```

All `tracking-*` values are in pixels for React Native compatibility. Replace any usage of default Tailwind `tracking-widest` (em-based) with the custom px-based token above.

### 2.7 Icons

**Library:** `@expo/vector-icons` → `MaterialCommunityIcons`

Replaces Lucide React Native. Already bundled with Expo — no additional install needed.

Key icon mapping:

| Purpose | Icon Name |
|---------|-----------|
| Dashboard tab | `wrench` |
| Garage tab | `motorbike` |
| Agent tab (center FAB) | `microphone` |
| Analytics/Log tab | `chart-bar` |
| Settings tab | `cog` |
| Notifications | `bell-outline` |
| Chevron right | `chevron-right` |
| Add | `plus` |
| Delete | `delete-outline` |
| Oil | `oil` |
| Tire | `tire` |
| Chain | `link-variant` |
| Battery | `battery` |
| Route/ride | `map-marker-path` |
| Build/service | `wrench` |
| Warning | `alert` |
| Settings (component) | `cog` |
| Water drop | `water` |
| Battery charging | `battery-charging` |
| Person | `account` |
| Shield | `shield-lock` |
| Card/membership | `card-account-details` |
| Dark mode | `weather-night` |
| Camera/photo | `camera-plus` |

## 3. Navigation

### 3.1 Top App Bar

Sticky header on every screen. Fixed height: **64px** (including padding).

```
┌──────────────────────────────────────────┐
│  [avatar]  PRECISION ATELIER    [bell]   │
└──────────────────────────────────────────┘
```

- **Background:** `surface` at 70% opacity. Use `expo-blur` `BlurView` for backdrop blur effect (new dependency — see Phase 1). Fallback: solid `surface` with 95% opacity if blur unavailable.
- **Avatar:** 32px circle, user profile image
- **Title:** "PRECISION ATELIER", uppercase, `tracking-wide-2`, bold, 14px
- **Right action:** Notifications bell icon
- **Component:** New `TopAppBar` component

### 3.2 Floating Tab Bar

Dark floating pill at bottom of screen with 5 positions.

**Tab order change:** Current order is Home, Garage, Log (center), Agent, Settings. New order is:

```
┌─────────────────────────────────────────────┐
│  wrench   motorbike   🎙️   chart-bar   cog │
│  Home     Garage    Agent   Log     Settings│
└─────────────────────────────────────────────┘
```

The `(tabs)/_layout.tsx` must be reordered so that `agent` becomes position 3 (center FAB) and `log` moves to position 4. Preserve all existing hidden routes (`garage/add`, `garage/[id]`, `garage/[id]/edit`, `garage/[id]/services`) with `href: null` to maintain deep linking.

- **Background:** `charcoal` at 80% opacity + `expo-blur` BlurView. Fallback: solid `charcoal` with 90% opacity.
- **Shape:** rounded-3xl (32px), 90% width, max-w-md, centered
- **Position:** bottom-6 (24px from screen edge)
- **Shadow:** `shadowColor: '#000', shadowOffset: {width: 0, height: 20}, shadowOpacity: 0.1, shadowRadius: 40`
- **Active state:** Yellow circle background, charcoal icon, static `transform: [{scale: 1.1}]` (no animation — just a static size difference)
- **Inactive state:** Sand colored icon
- **Center (Agent):** Always raised with yellow bg. Does NOT navigate to `agent.tsx` — instead triggers a bottom sheet overlay. The `agent.tsx` route file is kept as an empty placeholder to satisfy Expo Router's tab requirement, but it is never rendered.
- **Keyboard aware:** Hides when keyboard is visible (keep existing behavior)

### 3.3 Screen Layout Pattern

All screens follow this pattern. `TopAppBar` is rendered as an **absolute overlay** (position absolute, top 0, zIndex 50) inside the `SafeAreaView`, so it floats over the scroll content. The scroll content uses `pt-20` (80px) to clear the safe area inset + app bar height combined.

```tsx
<SafeAreaView className="flex-1 bg-surface">
  {/* TopAppBar is position: absolute, top: 0, zIndex: 50 */}
  <TopAppBar />
  <ScrollView className="pt-20 pb-32 px-6">
    {/* Screen content */}
  </ScrollView>
</SafeAreaView>
```

- `TopAppBar` — absolute positioned, renders inside SafeAreaView so it respects safe area insets, uses BlurView for translucent background
- `pt-20` — scroll content offset (safe area top inset ~44px + app bar ~36px of content)
- `pb-32` — bottom nav clearance
- `px-6` — horizontal padding (24px)

The `FloatingTabBar` is rendered by the tab layout, not by individual screens.

## 4. Screen Specifications

### 4.1 Dashboard — `(tabs)/index.tsx`

**Reference:** `stitch/modern_minimalist_mechanic/DESIGN.md` (no HTML mockup — this folder has a design doc only; use the first HTML block from the user's original paste as the visual reference)

**Structure:**
1. **Header section**
   - Label: "DASHBOARD OVERVIEW" — uppercase, `tracking-wide-2`, `text-xxs`, charcoal, bold
   - Headline: "Welcome back, {name}!" — text-4xl, font-sans-xbold, tracking-tight

2. **Hero Card (Total Distance)**
   - Background: charcoal, rounded-3xl (32px), p-8, large shadow
   - Decorative bg shape: absolute-positioned `View` with `bg-yellow opacity-10 rounded-full`, width 192, height 192, offset top-right (-40, -40). No blur needed — just a soft colored circle.
   - Content:
     - Label: "Total Distance" — yellow, uppercase, tracking-widest, text-xs
     - Value: mileage number — text-5xl, font-sans-xbold, tracking-tighter, white
     - Unit: "KM" — text-xl, font-sans-bold, sand
   - Progress section:
     - "Next Service" label + percentage
     - Progress bar: yellow on white/10 track, h-3, rounded-full
     - Subtext: estimated KM remaining

3. **Compliance Grid**
   - 2-column grid, gap-4, square aspect ratio cards
   - Each card: icon (filled, colored), title (font-sans-bold, text-lg), pill badge at bottom
   - Card 1 (Tire Pressure): sand/30 bg, yellow icon, "Good" pill (surface-card bg)
   - Card 2 (Oil Life): surface-low bg, danger icon, "Warning" danger pill

4. **Recent Services** — use `Section` component with "View All" action
   - List of `ListCard` rows: icon in colored square (rounded-xl), title, date + km, chevron

5. **Precision Badge**
   - Charcoal bg, rounded-3xl, centered text
   - Mechanic ID pill badge
   - Next checkup info text

### 4.2 My Garage — `(tabs)/garage/index.tsx`

**Reference:** `stitch/home_modern_minimalist/`

**Note:** `stitch/garage_fixed/` is an alternate version of the bike detail screen, not the garage list. Use `home_modern_minimalist` only.

**Structure:**
1. **Header**
   - Headline: "My Garage" — text-4xl, font-sans-xbold, tracking-tight
   - Subtitle: "Your Fleet • {count} Machines" — sand, uppercase, `tracking-wide-1`, text-xxs

2. **Bike Cards** (vertical list, gap-6)
   - Container: surface-card, rounded-3xl, shadow-sm, border charcoal/5
   - Hero image: h-56 (224px), resizeMode cover
   - Status badge overlay (top-left, absolute): "Ready to Ride" (yellow bg, charcoal text) or "Service Overdue" (danger bg, white text)
   - Content (p-6):
     - Make: text-xxs, sand, uppercase, tracking-widest
     - Model: text-xl, font-sans-xbold
     - More menu button (top-right, Pressable)
     - 2-column stat row: Battery % + Tire PSI in surface-low/50 rounded-2xl pills
   - **Press state:** `Pressable` with `activeOpacity: 0.95` and `scale(0.98)` on press

3. **"Expand Your Fleet" button**
   - h-40 (160px), dashed border (sand/40), rounded-3xl
   - Plus icon in circle, "Expand Your Fleet" label
   - **Press state:** border → yellow, icon bg → yellow
   - Navigates to `garage/add.tsx`

4. **Fleet Integrity Summary**
   - Section header with divider line (sand/20, h-px, flex-grow)
   - 3-column grid: Active count, Logs count, Alert count (danger color)

### 4.3 Bike Detail — `(tabs)/garage/[id]/index.tsx`

**Reference:** `stitch/bike_profile_modern_minimalist/` (primary), `stitch/garage_fixed/` (alternate reference)

**Structure:**
1. **Hero Image**
   - Full-bleed width, height 400px (percentage-based sizing not reliable in RN ScrollView — use fixed height)
   - `LinearGradient` overlay (expo-linear-gradient): transparent → surface at bottom
   - Status badge (bottom-left, absolute): "Ready to Ride" pill
   - Bike name (bottom-left, absolute): text-4xl, font-sans-xbold

2. **Stats Bento Grid**
   - 2-column grid (4-column too narrow on mobile), -mt-6 overlap on hero via negative margin
   - Each: surface-card, p-5, rounded-xl
   - Label (text-xxs uppercase, outline) + value (text-lg font-sans-bold)
   - First item: yellow bottom border accent (borderBottomWidth: 2, borderBottomColor: yellow)

3. **Vitals Section**
   - Section header with vertical bar accent (width 6, height 24, charcoal, rounded-full)
   - Container: surface-low, p-6, rounded-2xl
   - Use `ProgressBar` with `label` and `statusText` props:
     - `<ProgressBar label="Engine Oil Life" statusText="Safe • 85%" value={85} color="yellow" />`
     - `<ProgressBar label="Tire Wear" statusText="Inspect • 40%" value={40} color="sand" />`
     - `<ProgressBar label="Chain Tension" statusText="Adjust • 12%" value={12} color="danger" />`

4. **Service History** — use `Section` component with "View All" action (navigates to `garage/[id]/services.tsx`)
   - Compact `ListCard` rows: icon square (rounded-lg, surface-low bg), title, date + km, chevron

5. **"Start Ride Track" CTA** — use `PrimaryButton` component
   - Props: `label="Start Ride Track"`, `icon="map-marker-path"`, `iconColor="yellow"`

**Stack navigator (`garage/[id]/_layout.tsx`):** Keep existing Stack layout unchanged. Only screen content is redesigned.

### 4.4 New Service Log — `(tabs)/garage/[id]/services.tsx`

**Reference:** `stitch/service_entry_modern_minimalist/`

**Structure:**
1. **Header**
   - Version badge pill (yellow bg, charcoal text)
   - Headline: "New Service Log" — text-4xl, font-sans-xbold
   - Subtitle: bike name context

2. **Service Type Selector** — use `FilterChips` component with `wrap={true}`
   - Types: Oil Change, Chain Adjustment, Brake Flush, Desmo Service (configurable)

3. **Bento Form Grid** (2-column using flexbox, gap-6)
   - Mileage: surface-low card, large number input (text-2xl font-sans-bold) + "KM" unit
   - Date: surface-low card, date picker
   - Estimated Cost: sand/30 tinted card, "$" prefix. Decorative element: absolute-positioned View, bg-sand opacity-20, rounded-full, width 96, height 96, offset bottom-right — no blur.
   - Service ID: surface-low card, uppercase text input

4. **Notes**
   - TextInput multiline in surface-low, rounded-xl, 4 rows, p-5

5. **Evidence & Documentation**
   - File count badge
   - Photo grid: image preview with press-to-delete overlay (Pressable, not hover)
   - Upload placeholder: dashed border (outline), camera icon

6. **Save Button** — use `PrimaryButton` component
   - Props: `label="Save Log"`, `icon="check-circle"`, `iconColor="yellow"`

### 4.5 Service History — `(tabs)/log.tsx`

**Reference:** `stitch/log_modern_minimalist/`

**Structure:**
1. **Header**
   - Headline: "Service History" — text-3xl, font-sans-xbold
   - Total Spend badge: yellow bg, rounded-xl, font-sans-xbold amount

2. **Filter Chips** — use `FilterChips` component with `wrap={false}` (horizontal scroll)
   - Options: All, Maintenance, Repairs, Performance

3. **Timeline**
   - Vertical line: absolute, left 16px, width 2px, sand/30 bg, full height
   - Entries (paddingLeft 48px offset from line):
     - Circle node on timeline (absolute, left 0): 32px circle, colored by type — yellow=service, charcoal=maintenance, danger=emergency
     - Icon inside node (MaterialCommunityIcons, white, size 14)
     - Card: surface-card, p-6, rounded-2xl, border outline/10
     - Date label (text-xxs uppercase), title (text-xl font-sans-xbold), cost (text-lg font-sans-bold)
     - Tag pills: surface-low bg for normal, danger-surface bg for emergency
     - Optional: quote block (sand/10 bg, rounded-xl, italic text)
     - Optional: photo attachment (Image, rounded-xl, h-32, resizeMode cover)

### 4.6 Settings — `(tabs)/settings.tsx`

**Reference:** `stitch/settings_modern_minimalist/`

**Structure:**
1. **Profile Hero**
   - surface-low card, rounded-3xl, p-8, centered, overflow hidden
   - Decorative circles: two absolute-positioned Views, bg-yellow/bg-sand at opacity-10, rounded-full, width 192, height 192, offset top-right and bottom-left, no blur
   - Avatar: 96px, rounded-full, 4px border (surface-card)
   - Name: text-2xl, font-sans-xbold
   - Role badge: charcoal pill, "Professional Rider", text-xxs, tracking-wide-1

2. **Account Settings Section**
   - Section label: text-xxs, font-sans-xbold, tracking-wide-2, outline, uppercase
   - Grouped `ListCard` rows in a surface-card container (rounded-2xl):
     - `<ListCard icon="account" title="Personal Info" subtitle="Update your account details" />`
     - `<ListCard icon="shield-lock" title="Security" subtitle="Password and biometric settings" />`
     - `<ListCard icon="card-account-details" title="Subscription" subtitle="Manage your Pro membership" />`

3. **Appearance Section**
   - Dark Mode toggle (disabled for now — show toggle in off position, non-interactive)
   - Accent Color selector: 4 color circles (yellow=selected with ring-2 ring-offset-2, sand, charcoal variants). Visual only for now.

4. **Log Out** — use `PrimaryButton` component
   - Props: `label="Log Out"` (no icon variant)
   - Version footer: "Kickstand App v4.2.0", text-xxs, outline, tracking-widest, centered

### 4.7 Agent — Voice Agent (Bottom Sheet)

**Trigger:** Center FAB in floating tab bar

**Behavior:**
- Tapping the center microphone FAB opens the existing `bottom-sheet` component as an overlay
- Bottom sheet slides up from bottom, backdrop dims
- Content: large mic button, waveform visualization (stretch goal), transcript area
- Dismiss: swipe down or tap backdrop
- The `agent.tsx` file remains as an empty placeholder route (Expo Router requires a file per tab), but is never navigated to — the tab bar intercepts the press.

**Note:** The agent screen content/logic is out of scope for this visual redesign. This spec only covers the FAB trigger and bottom sheet container. Existing agent functionality carries over.

## 5. Component Inventory

### 5.1 Updated Components

| Component | Changes |
|-----------|---------|
| `floating-tab-bar` | New token colors, reordered 5 tabs with center Agent FAB (position 3), MaterialCommunityIcons, agent triggers bottom sheet instead of navigation |
| `hero-card` | Charcoal bg, rounded-3xl (32px), larger shadow, yellow accent elements |
| `screen-header` | Add label above headline, font-sans-xbold weight |
| `filter-chips` | Charcoal active state (was accent), surface-low inactive. Add `wrap` prop: `false` (default) = horizontal scroll (for filter bars), `true` = flex wrap (for service type selector). Absorbs the planned `chip-selector` — one component for all chip groups. |
| `progress-bar` | Color-coded variants (yellow/sand/danger), h-2/h-3 sizes. Add optional `label` and `statusText` props for the vitals use case (label left, status right, bar below). Absorbs the planned `vitals-bar` — one component for plain bars and labeled vitals. |
| `status-card` | Square aspect ratio, icon + title + pill layout |
| `list-card` | Icon square + content + chevron pattern. Reuse for: Dashboard recent services, Bike Detail service history, and Settings rows (icon + title + subtitle + chevron). Add optional `subtitle` prop. |
| `pill-badge` | Updated colors (yellow, danger, charcoal variants) |
| `safe-screen` | Update default padding to px-6, pb-32 |
| `empty-state` | Dashed border style matching "Expand Your Fleet" |
| `text-field` | Surface-low bg, borderless, large bold input style |
| `bottom-sheet` | Token color update + used for agent voice overlay. Migrate `bg-surface-muted` → `bg-surface-low`, `text-text-primary` → `text-charcoal`. |
| `section` | Update to use new token colors, font weights |

### 5.2 New Components

| Component | Purpose |
|-----------|---------|
| `top-app-bar` | `components/ui/` — Sticky header with avatar, title, notifications. Uses expo-blur for backdrop. |
| `bento-stat` | `components/ui/` — Stat card for bento grids (label + value, optional accent border) |
| `bike-image-card` | `components/bike/` — Full card with hero image, status badge overlay, stats row. **Replaces `components/bike/bike-card.tsx`** which will be deleted. |
| `timeline-entry` | `components/ui/` — Timeline node + card for service history |
| `primary-button` | `components/ui/` — Full-width charcoal button with optional left icon (yellow circle) and press state. Used for "Start Ride Track", "Save Log", "Log Out". |
| `profile-hero` | `components/ui/` — Centered profile card with avatar, name, role badge |

### 5.3 Removed/Deprecated

| Component | Reason |
|-----------|--------|
| `status-dot` | Replaced by pill badges |
| `alert-banner` | Not present in new designs |
| `metric-display` | Replaced by inline hero card metrics |
| `bike-card` (`components/bike/bike-card.tsx`) | Replaced by `bike-image-card` |

### 5.4 Unchanged Components

These components are not redesigned in this spec. They will receive token color updates as part of the migration (old colors → new colors) but no structural changes:

| Component | Note |
|-----------|------|
| `select-field` | Token color update only |
| `date-field` | Token color update only |
| `confirmation-dialog` | Token color update only |
| `skeleton` | Token color update only |
| `toast` | Token color update only |
| `bike-details-card` | Token color update only |
| `bike-form` | Token color update only |
| `welcome-screen` | Token color update only |

## 6. Migration Strategy

### Phase 1: Token Foundation
1. Download `PlusJakartaSans-ExtraBold.ttf` from Google Fonts, add to `assets/fonts/`, register in `useAppFonts()`
2. Update `tailwind.config.ts`: new color tokens, `4xl` spacing, updated border radius, `text-xxs` size, `tracking-wide-1`/`tracking-wide-2` letter spacing, `font-sans-xbold` font family
3. Simplify `global.css`: remove all CSS variables, minimal base styles only
4. Install `expo-blur` for backdrop blur on TopAppBar and FloatingTabBar (`npx expo install expo-blur`)
5. Install `expo-linear-gradient` for bike detail hero gradient (`npx expo install expo-linear-gradient`)
6. No install needed for MaterialCommunityIcons (already in `@expo/vector-icons` via Expo)

### Phase 2: Shared Components
6. Build `TopAppBar` (new)
7. Rebuild `FloatingTabBar`: new design, reordered tabs (agent → center), agent triggers bottom sheet
8. Reorder tabs in `(tabs)/_layout.tsx`: index, garage, agent (center), log, settings
9. Update existing components with new tokens (hero-card, progress-bar, filter-chips, etc.)
10. Build new components (bento-stat, bike-image-card, timeline-entry, primary-button, profile-hero)

### Phase 3: Screens
11. Dashboard (index.tsx)
12. My Garage (garage/index.tsx)
13. Bike Detail (garage/[id]/index.tsx)
14. New Service Log (garage/[id]/services.tsx)
15. Service History (log.tsx)
16. Settings (settings.tsx)
17. Agent FAB + bottom sheet trigger (update agent.tsx to empty placeholder)

### Phase 4: Cleanup
18. Remove unused old components: `components/ui/status-dot.tsx`, `components/ui/alert-banner.tsx`, `components/ui/metric-display.tsx`, `components/bike/bike-card.tsx`
19. Remove `lucide-react-native` dependency from package.json
20. Update unchanged components with new token colors (select-field, date-field, etc.)
21. Verify all screens match stitch references

## 7. Out of Scope

- Dark mode (light only for now; dark mode toggle on settings is visual-only/disabled)
- Agent voice interaction logic (only the FAB trigger + container)
- Backend/API changes
- New data models or API endpoints
- Animations beyond basic press states and transitions
- Bike hero images (use placeholder/existing image handling)
- `garage/add.tsx` screen — keeps existing design, receives token color updates only
- `garage/[id]/edit.tsx` screen — keeps existing design, receives token color updates only
- `garage/[id]/_layout.tsx` Stack navigator — unchanged

## 8. Dependencies

| Package | Reason | Install |
|---------|--------|---------|
| `expo-blur` | Backdrop blur for TopAppBar and FloatingTabBar | `npx expo install expo-blur` |

| `expo-linear-gradient` | Gradient overlay on bike detail hero image | `npx expo install expo-linear-gradient` |

No other new dependencies. `MaterialCommunityIcons` is already available via `@expo/vector-icons` (bundled with Expo).
