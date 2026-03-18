# Mobile UI: Foundation + Auth + Garage — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up the mobile frontend foundation (NativeWind, design tokens, fonts, routing) and build auth + bike CRUD — producing a working app where users can register, login, and manage bike profiles end-to-end.

**Architecture:** Expo 55 with Expo Router v3 (file-based routing). NativeWind v4 for styling via CSS variables (light/dark theming). React Native Reusables for accessible UI primitives. Supabase Auth on the client side. TanStack Query for server state, Zustand + MMKV for client state.

**Tech Stack:** Expo 55, Expo Router v3, NativeWind v4, React Native Reusables, Plus Jakarta Sans, Supabase JS, TanStack Query v5, Zustand v5, MMKV, React Hook Form + Zod, FlashList, react-native-reanimated, expo-haptics

**Spec:** `docs/superpowers/specs/2026-03-19-mobile-ui-design.md`
**API spec:** `/Users/hid/personal/docs/superpowers/specs/2026-03-18-kickstand-mobile-design.md` (Sections 4–5)
**Current state:** Bare Expo 55 scaffold — `App.tsx`, no routing, no styling, no dependencies beyond `expo`, `react`, `react-native`.

---

## File Structure

### New files to create

```
apps/mobile/
  # Config
  tailwind.config.ts              # Design tokens: colors (CSS vars), fonts, radius, spacing
  global.css                      # CSS variables for light/dark mode
  nativewind-env.d.ts             # NativeWind TypeScript declaration
  babel.config.js                 # NativeWind babel preset + reanimated plugin
  metro.config.js                 # NativeWind metro integration
  .env                            # EXPO_PUBLIC_API_URL, EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY

  # Fonts
  assets/fonts/
    PlusJakartaSans-Regular.ttf
    PlusJakartaSans-Medium.ttf
    PlusJakartaSans-SemiBold.ttf
    PlusJakartaSans-Bold.ttf

  # Routing
  app/
    _layout.tsx                   # Root: font loading, QueryClient, Supabase auth listener, auth redirect
    +not-found.tsx                # 404 screen
    (auth)/
      _layout.tsx                 # Stack layout, no tab bar
      login.tsx
      register.tsx
    (tabs)/
      _layout.tsx                 # Tab layout with FloatingTabBar
      index.tsx                   # Dashboard (home tab)
      garage/
        index.tsx                 # Bike list
        add.tsx                   # Add bike form
        [id]/
          _layout.tsx             # Stack layout for bike detail screens
          index.tsx               # Bike detail
          edit.tsx                # Edit bike form
          services.tsx            # Service history placeholder
      agent.tsx                   # Placeholder
      settings.tsx                # Placeholder

  # UI primitives (one file per component)
  components/ui/
    safe-screen.tsx               # SafeAreaView + ScrollView + bg-background + px-lg
    screen-header.tsx             # Title + subtitle + right action
    section.tsx                   # Label + optional action link + children
    hero-card.tsx                 # bg-hero, rounded-2xl, shadow
    list-card.tsx                 # bg-surface, border, rounded-xl, optional onPress
    status-card.tsx               # Compliance card with variant (expired|danger|warning|neutral)
    metric-display.tsx            # Large number + small unit baseline-aligned
    progress-bar.tsx              # Thin bar with label + percentage
    status-dot.tsx                # 6px colored circle
    pill-badge.tsx                # Small rounded badge
    alert-banner.tsx              # Colored banner with dot + children
    text-field.tsx                # Input with label, error, prefix
    select-field.tsx              # Chip-based selector with label
    date-field.tsx                # DateTimePicker trigger with label
    filter-chips.tsx              # Horizontal scrollable pill chips
    floating-tab-bar.tsx          # Dark pill tab bar, center FAB, keyboard-hide
    empty-state.tsx               # Centered title + description + optional action
    skeleton.tsx                  # Animated loading placeholder
    confirmation-dialog.tsx       # Modal with title, body, cancel/confirm
    bottom-sheet.tsx              # Slide-up modal with handle
    toast.tsx                     # Auto-dismiss feedback message

  # Feature compositions
  components/bike/
    bike-card.tsx                 # ListCard showing model, plate, mileage
    bike-form.tsx                 # RHF form for add/edit bike (uses TextField, SelectField, DateField)
    bike-details-card.tsx         # Static info rows (model, year, class, plate)

  # Data layer
  lib/
    supabase.ts                   # createClient with AsyncStorage for session persistence
    theme.ts                      # useAppFonts hook, getComplianceVariant, daysUntil helpers
    api/
      client.ts                   # Fetch wrapper: base URL, auth header injection, 401 → sign out
      use-auth.ts                 # useLogin, useRegister, useSignOut mutations
      use-bikes.ts                # useBikes, useBike, useCreateBike, useUpdateBike, useDeleteBike, useUpdateMileage
    store/
      auth-store.ts               # Zustand: user, setUser, isAuthenticated
      bike-store.ts               # Zustand + MMKV: activeBikeId
    types/
      api.ts                      # PaginatedResponse<T>, ApiError
      auth.ts                     # User, AuthTokens, LoginInput, RegisterInput
      bike.ts                     # Bike, CreateBikeInput, UpdateBikeInput, UpdateMileageInput
    validation/
      auth-schema.ts              # loginSchema, registerSchema (Zod)
      bike-schema.ts              # bikeSchema, updateMileageSchema (Zod)
```

### Files to delete
- `apps/mobile/App.tsx` — replaced by Expo Router's `app/_layout.tsx`

### Files to modify
- `apps/mobile/index.ts` — change to `import 'expo-router/entry'`
- `apps/mobile/app.json` — add fonts, scheme, set userInterfaceStyle to "automatic"
- `apps/mobile/package.json` — dependencies added via `npx expo install`
- `.gitignore` — add `apps/mobile/.env`

---

## Task 1: Install Dependencies

**Files:**
- Modify: `apps/mobile/package.json`

- [ ] **Step 1: Install all packages**

```bash
cd apps/mobile && npx expo install nativewind tailwindcss react-native-reanimated expo-font expo-haptics @supabase/supabase-js @tanstack/react-query zustand react-native-mmkv react-hook-form zod @hookform/resolvers @shopify/flash-list expo-router expo-secure-store @react-native-async-storage/async-storage react-native-svg lucide-react-native @react-native-community/datetimepicker && npm install -D jest @types/jest ts-jest jest-expo
```

- [ ] **Step 2: Verify — check key packages appear in package.json**

```bash
cd apps/mobile && node -e "const p=require('./package.json'); const deps={...p.dependencies,...p.devDependencies}; ['nativewind','tailwindcss','expo-router','zustand','@tanstack/react-query','react-native-reanimated'].forEach(d => console.log(d, deps[d] ? '✓' : '✗'))"
```

Expected: All show ✓.

- [ ] **Step 3: Add jest config to package.json**

Add to `apps/mobile/package.json`:

```json
"jest": {
  "preset": "jest-expo",
  "transformIgnorePatterns": [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg)"
  ]
}
```

And add to scripts: `"test": "jest --no-coverage"`

- [ ] **Step 4: Commit**

```bash
git add apps/mobile/package.json package-lock.json && git commit -m "chore(mobile): install UI foundation dependencies"
```

---

## Task 2: NativeWind + Tailwind + Design Tokens

**Files:**
- Create: `apps/mobile/babel.config.js`
- Create: `apps/mobile/metro.config.js`
- Create: `apps/mobile/global.css`
- Create: `apps/mobile/tailwind.config.ts`
- Create: `apps/mobile/nativewind-env.d.ts`
- Modify: `apps/mobile/app.json`

All design tokens from spec Section 2 are configured here. This is the single source of truth — no raw hex values in components.

- [ ] **Step 1: Create babel.config.js**

```js
// apps/mobile/babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }]],
    plugins: ['react-native-reanimated/plugin'],
  };
};
```

- [ ] **Step 2: Create metro.config.js**

```js
// apps/mobile/metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const config = getDefaultConfig(__dirname);
module.exports = withNativeWind(config, { input: './global.css' });
```

- [ ] **Step 3: Create global.css with all CSS variables from spec Section 2**

Write `apps/mobile/global.css` with `@tailwind base/components/utilities`, then `:root { ... }` for light mode values and `.dark { ... }` for dark mode values. All color tokens from spec:

- Light: background `#faf8f5`, surface `#ffffff`, surface-muted `#f0ece6`, border `#eae6e0`, text-primary `#1c1917`, text-secondary `#78716c`, text-muted `#a8a29e`, accent `#d97706`, accent-surface `#fef7ed`, warning `#ea580c`, warning-surface `#fff7ed`, danger `#dc2626`, danger-surface `#f7eded`, success `#22c55e`, success-surface `#f0fdf4`, hero `#1c1917`, hero-text `#faf8f5`, hero-muted `#78716c`
- Dark: background `#1c1917`, surface `#292524`, accent `#f59e0b`, warning `#f97316`, danger `#f87171`, success `#4ade80`, hero `#292524`, etc. (see spec for full dark mode values with rgba surfaces)

- [ ] **Step 4: Create tailwind.config.ts**

Map all CSS variables to Tailwind colors (`var(--color-background)`, etc.). Add font families (`PlusJakartaSans-Regular/Medium/SemiBold/Bold`). Add border radius tokens (sm=8, md=12, lg=16, xl=18, 2xl=20). Add spacing tokens (xs=4, sm=8, md=12, lg=16, xl=20, 2xl=24, 3xl=32). Include `nativewind/preset` in presets. Content paths: `./app/**/*.{ts,tsx}`, `./components/**/*.{ts,tsx}`.

- [ ] **Step 5: Create nativewind-env.d.ts**

```ts
/// <reference types="nativewind/types" />
```

- [ ] **Step 6: Update app.json**

Change `name` to "Kickstand", add `"scheme": "kickstand"`, change `userInterfaceStyle` to `"automatic"`, add `fonts` array pointing to the 4 font files.

- [ ] **Step 7: Verify — no config errors**

```bash
cd apps/mobile && npx tsc --noEmit 2>&1 | head -5
```

- [ ] **Step 8: Commit**

```bash
git add apps/mobile/babel.config.js apps/mobile/metro.config.js apps/mobile/global.css apps/mobile/tailwind.config.ts apps/mobile/nativewind-env.d.ts apps/mobile/app.json && git commit -m "feat(mobile): configure NativeWind v4 with Soft Tarmac design tokens"
```

---

## Task 3: Fonts + Theme Utilities

**Files:**
- Create: `apps/mobile/assets/fonts/` (4 TTF files)
- Create: `apps/mobile/lib/theme.ts`

- [ ] **Step 1: Download Plus Jakarta Sans from Google Fonts**

Download Regular (400), Medium (500), SemiBold (600), Bold (700) weights as TTF files. Place in `apps/mobile/assets/fonts/`.

- [ ] **Step 2: Write lib/theme.ts**

Contains:
- `useAppFonts()` — wraps `useFonts` from `expo-font`, loads the 4 font files
- `getComplianceVariant(daysLeft: number | null)` — returns `'expired' | 'danger' | 'warning' | 'neutral'` based on thresholds (≤0, ≤7, ≤30, >30)
- `daysUntil(dateStr: string | null)` — returns days until date, null if no date

- [ ] **Step 3: Write a quick test for theme helpers**

Create `apps/mobile/lib/__tests__/theme.test.ts`:

```ts
import { getComplianceVariant, daysUntil } from '../theme';

describe('getComplianceVariant', () => {
  it('returns expired for negative days', () => expect(getComplianceVariant(-1)).toBe('expired'));
  it('returns expired for 0 days', () => expect(getComplianceVariant(0)).toBe('expired'));
  it('returns danger for 1-7 days', () => expect(getComplianceVariant(7)).toBe('danger'));
  it('returns warning for 8-30 days', () => expect(getComplianceVariant(14)).toBe('warning'));
  it('returns neutral for >30 days', () => expect(getComplianceVariant(31)).toBe('neutral'));
  it('returns neutral for null', () => expect(getComplianceVariant(null)).toBe('neutral'));
});
```

- [ ] **Step 4: Run test**

```bash
cd apps/mobile && npx jest lib/__tests__/theme.test.ts --no-coverage
```

Expected: 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add apps/mobile/assets/fonts/ apps/mobile/lib/theme.ts apps/mobile/lib/__tests__/theme.test.ts && git commit -m "feat(mobile): add fonts and theme utilities with tests"
```

---

## Task 4: TypeScript Types

**Files:**
- Create: `apps/mobile/lib/types/api.ts`
- Create: `apps/mobile/lib/types/auth.ts`
- Create: `apps/mobile/lib/types/bike.ts`

- [ ] **Step 1: Create types/api.ts**

- `PaginatedResponse<T>` — `{ data: T[]; meta: { page, limit, total } }`
- `ApiError` — `{ statusCode, message, error }`

- [ ] **Step 2: Create types/auth.ts**

- `User` — id, email, name, activeBikeId, expoToken
- `AuthTokens` — accessToken, refreshToken
- `LoginInput` — email, password
- `RegisterInput` — name, email, password

- [ ] **Step 3: Create types/bike.ts**

- `Bike` — id, userId, model, year, plateNumber, class ('2B'|'2A'|'2'), currentMileage, coeExpiry, roadTaxExpiry, insuranceExpiry, inspectionDue, createdAt, updatedAt
- `CreateBikeInput` — model, year, plateNumber, class, currentMileage, optional date fields
- `UpdateBikeInput` — Partial\<CreateBikeInput\>
- `UpdateMileageInput` — { mileage: number }

- [ ] **Step 4: Commit**

```bash
git add apps/mobile/lib/types/ && git commit -m "feat(mobile): add TypeScript type definitions"
```

---

## Task 5: Zod Validation Schemas

**Files:**
- Create: `apps/mobile/lib/validation/auth-schema.ts`
- Create: `apps/mobile/lib/validation/bike-schema.ts`

- [ ] **Step 1: Write auth schemas with tests**

`auth-schema.ts`:
- `loginSchema` — email (valid email), password (min 8)
- `registerSchema` — name (min 2), email, password (min 8), confirmPassword (must match)
- Export inferred types: `LoginFormValues`, `RegisterFormValues`

Test file `apps/mobile/lib/__tests__/auth-schema.test.ts`:
- Valid login input passes
- Empty email fails with "Enter a valid email"
- Short password fails
- Non-matching confirmPassword fails with "Passwords do not match"

- [ ] **Step 2: Run auth schema tests**

```bash
npx jest lib/__tests__/auth-schema.test.ts --no-coverage
```

- [ ] **Step 3: Write bike schemas with tests**

`bike-schema.ts`:
- `bikeSchema` — model (min 2), year (1990–next year), plateNumber (min 3), class (enum), currentMileage (≥0), optional date fields (YYYY-MM-DD format or empty string)
- `updateMileageSchema` — mileage (≥0)
- Export inferred types

Test file `apps/mobile/lib/__tests__/bike-schema.test.ts`:
- Valid bike input passes
- Missing model fails
- Invalid year (1980) fails
- Valid mileage update passes
- Negative mileage fails

- [ ] **Step 4: Run bike schema tests**

```bash
npx jest lib/__tests__/bike-schema.test.ts --no-coverage
```

- [ ] **Step 5: Commit**

```bash
git add apps/mobile/lib/validation/ apps/mobile/lib/__tests__/ && git commit -m "feat(mobile): add Zod validation schemas with tests"
```

---

## Task 6: Supabase Client + API Client

**Files:**
- Create: `apps/mobile/.env`
- Create: `apps/mobile/lib/supabase.ts`
- Create: `apps/mobile/lib/api/client.ts`
- Modify: `.gitignore`

- [ ] **Step 1: Add .env to gitignore**

```bash
echo -e "apps/mobile/.env\napps/mobile/.env.local" >> .gitignore && git add .gitignore && git commit -m "chore: ignore mobile env files"
```

- [ ] **Step 2: Create .env with placeholder values**

```
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

- [ ] **Step 3: Create lib/supabase.ts**

`createClient` with AsyncStorage for session persistence. Options: `autoRefreshToken: true`, `persistSession: true`, `detectSessionInUrl: false`.

- [ ] **Step 4: Create lib/api/client.ts**

Authenticated fetch wrapper with:
- `getAuthHeader()` — reads token from `supabase.auth.getSession()`
- `request<T>(path, options)` — prepends `BASE_URL`, injects auth header + Content-Type, handles 401 (signs out + throws), parses JSON
- Export `apiClient` object with `get`, `post`, `patch`, `delete` methods

- [ ] **Step 5: Commit**

```bash
git add apps/mobile/lib/supabase.ts apps/mobile/lib/api/client.ts && git commit -m "feat(mobile): add Supabase client and authenticated API wrapper"
```

---

## Task 7: Zustand Stores

**Files:**
- Create: `apps/mobile/lib/store/auth-store.ts`
- Create: `apps/mobile/lib/store/bike-store.ts`

- [ ] **Step 1: Create auth-store.ts**

Zustand store with: `user: User | null`, `setUser(user)`, computed `isAuthenticated`.

- [ ] **Step 2: Create bike-store.ts**

Zustand store with MMKV persistence: `activeBikeId: string | null`, `setActiveBikeId(id)`. Reads initial value from MMKV on creation, writes to MMKV on set.

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/lib/store/ && git commit -m "feat(mobile): add Zustand stores for auth and bike state"
```

---

## Task 8: TanStack Query Hooks

**Files:**
- Create: `apps/mobile/lib/api/use-auth.ts`
- Create: `apps/mobile/lib/api/use-bikes.ts`

- [ ] **Step 1: Create use-auth.ts**

- `useLogin()` — mutation calling `supabase.auth.signInWithPassword`
- `useRegister()` — mutation calling `supabase.auth.signUp` with `options.data.name`
- `useSignOut()` — mutation calling `supabase.auth.signOut`

- [ ] **Step 2: Create use-bikes.ts**

- `useBikes()` — query `GET /bikes` returning `Bike[]`
- `useBike(id)` — query `GET /bikes/:id` (enabled when id truthy)
- `useCreateBike()` — mutation `POST /bikes`, invalidates bikes list on success
- `useUpdateBike(id)` — mutation `PATCH /bikes/:id`, invalidates list + detail
- `useUpdateMileage(id)` — mutation `PATCH /bikes/:id/mileage`, invalidates list + detail
- `useDeleteBike(id)` — mutation `DELETE /bikes/:id`, invalidates list

All use `apiClient` from `lib/api/client.ts`.

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/lib/api/use-auth.ts apps/mobile/lib/api/use-bikes.ts && git commit -m "feat(mobile): add TanStack Query hooks for auth and bikes"
```

---

## Task 9: UI Primitives — Layout Components

**Files:**
- Create: `apps/mobile/components/ui/safe-screen.tsx`
- Create: `apps/mobile/components/ui/screen-header.tsx`
- Create: `apps/mobile/components/ui/section.tsx`

- [ ] **Step 1: Create SafeScreen**

Props: `scrollable?: boolean`, `className?: string`. Renders `SafeAreaView` with `bg-background`. If scrollable, wraps children in `ScrollView` with `contentContainerClassName="px-lg pb-24"`. Else plain `View` with `px-lg`.

- [ ] **Step 2: Create ScreenHeader**

Props: `title`, `subtitle?`, `rightAction?: ReactNode`, `onTitlePress?`. Renders row with subtitle (text-xs text-muted) + title (text-2xl font-sans-bold, tappable if `onTitlePress` provided) + right action.

- [ ] **Step 3: Create Section**

Props: `label?`, `action?`, `onAction?`, `children`. Renders uppercase label (text-xs text-muted tracking-widest) + optional action link (text-accent) in a row, then children. Outer View has `mb-lg`.

- [ ] **Step 4: Commit**

```bash
git add apps/mobile/components/ui/safe-screen.tsx apps/mobile/components/ui/screen-header.tsx apps/mobile/components/ui/section.tsx && git commit -m "feat(mobile): add layout UI primitives (SafeScreen, ScreenHeader, Section)"
```

---

## Task 10: UI Primitives — Card Components

**Files:**
- Create: `apps/mobile/components/ui/hero-card.tsx`
- Create: `apps/mobile/components/ui/list-card.tsx`
- Create: `apps/mobile/components/ui/status-card.tsx`
- Create: `apps/mobile/components/ui/alert-banner.tsx`

- [ ] **Step 1: Create HeroCard**

Props: `children`, `className?`. Renders `bg-hero rounded-2xl p-xl mb-lg` with shadow (0 4px 12px rgba(0,0,0,0.15)). Children are rendered inside.

- [ ] **Step 2: Create ListCard**

Props: `children`, `onPress?`, `className?`. Renders `bg-surface border-border rounded-xl p-lg mb-sm` with subtle shadow. Wraps in `TouchableOpacity` if `onPress` provided.

- [ ] **Step 3: Create StatusCard**

Props: `label`, `value`, `unit`, `date`, `variant` (`expired | danger | warning | neutral`). Maps variant to styles:
- expired: `bg-danger`, white text, pulsing dot (reanimated)
- danger: `bg-danger-surface`, danger text
- warning: `bg-warning-surface`, warning text
- neutral: `bg-surface border-border`, primary text, success dot

Renders: label (top) → value + unit baseline-aligned (BizLink mixed sizing) → date (bottom).

- [ ] **Step 4: Create AlertBanner**

Props: `children`, `variant` (`danger | warning | info`), `className?`. Renders colored surface bg with small dot + children in row.

- [ ] **Step 5: Commit**

```bash
git add apps/mobile/components/ui/hero-card.tsx apps/mobile/components/ui/list-card.tsx apps/mobile/components/ui/status-card.tsx apps/mobile/components/ui/alert-banner.tsx && git commit -m "feat(mobile): add card UI primitives (HeroCard, ListCard, StatusCard, AlertBanner)"
```

---

## Task 11: UI Primitives — Data Display Components

**Files:**
- Create: `apps/mobile/components/ui/metric-display.tsx`
- Create: `apps/mobile/components/ui/progress-bar.tsx`
- Create: `apps/mobile/components/ui/status-dot.tsx`
- Create: `apps/mobile/components/ui/pill-badge.tsx`
- Create: `apps/mobile/components/ui/skeleton.tsx`
- Create: `apps/mobile/components/ui/empty-state.tsx`

- [ ] **Step 1: Create MetricDisplay**

Props: `value`, `unit?`, `size` (xl|l|m), `color?`, `onHero?`. Renders value (font-sans-bold, size-mapped) + unit (font-sans-medium, smaller) in `flex-row items-baseline`.

- [ ] **Step 2: Create ProgressBar**

Props: `progress` (0–1), `label?`, `showPercent?`. Thin bar (h-1 bg-surface-muted, fill bg-hero, rounded-sm).

- [ ] **Step 3: Create StatusDot**

Props: `variant` (danger|warning|success). Renders `w-1.5 h-1.5 rounded-full` with variant color.

- [ ] **Step 4: Create PillBadge**

Props: `label`, `variant` (danger|warning|success|neutral). Renders small rounded badge with variant-surface bg and variant text.

- [ ] **Step 5: Create Skeleton**

Props: `width?`, `height?`, `rounded?`, `className?`. Animated opacity pulse (reanimated) on a `bg-surface-muted` View.

- [ ] **Step 6: Create EmptyState**

Props: `title`, `description`, `actionLabel?`, `onAction?`. Centered layout with text-primary title, text-muted description, optional bg-hero button.

- [ ] **Step 7: Commit**

```bash
git add apps/mobile/components/ui/metric-display.tsx apps/mobile/components/ui/progress-bar.tsx apps/mobile/components/ui/status-dot.tsx apps/mobile/components/ui/pill-badge.tsx apps/mobile/components/ui/skeleton.tsx apps/mobile/components/ui/empty-state.tsx && git commit -m "feat(mobile): add data display UI primitives"
```

---

## Task 12: UI Primitives — Input Components

**Files:**
- Create: `apps/mobile/components/ui/text-field.tsx`
- Create: `apps/mobile/components/ui/select-field.tsx`
- Create: `apps/mobile/components/ui/date-field.tsx`
- Create: `apps/mobile/components/ui/filter-chips.tsx`

- [ ] **Step 1: Create TextField**

Props: extends `TextInputProps` + `label`, `error?`, `prefix?`. Label above input. `bg-surface border-border rounded-lg`. Error state: `border-danger` + red error text below. Prefix rendered left of input.

- [ ] **Step 2: Create SelectField**

Props: `label`, `options` ({label, value}[]), `value`, `onValueChange`, `error?`. Renders as horizontally wrapped pill chips. Active: `bg-hero text-hero-text`. Inactive: `bg-surface border-border text-secondary`.

- [ ] **Step 3: Create DateField**

Props: `label`, `value` (YYYY-MM-DD), `onChange`, `error?`. Renders as TouchableOpacity that looks like a text field. On press, shows `@react-native-community/datetimepicker`. Displays formatted date or "Not set".

- [ ] **Step 4: Create FilterChips**

Props: `options` (string[]), `selected`, `onSelect`. Horizontal `ScrollView` with pill chips. Same active/inactive styling as SelectField.

- [ ] **Step 5: Commit**

```bash
git add apps/mobile/components/ui/text-field.tsx apps/mobile/components/ui/select-field.tsx apps/mobile/components/ui/date-field.tsx apps/mobile/components/ui/filter-chips.tsx && git commit -m "feat(mobile): add input UI primitives (TextField, SelectField, DateField, FilterChips)"
```

---

## Task 13: UI Primitives — Navigation + Feedback Components

**Files:**
- Create: `apps/mobile/components/ui/floating-tab-bar.tsx`
- Create: `apps/mobile/components/ui/confirmation-dialog.tsx`
- Create: `apps/mobile/components/ui/bottom-sheet.tsx`
- Create: `apps/mobile/components/ui/toast.tsx`

- [ ] **Step 1: Create FloatingTabBar**

Receives `BottomTabBarProps` from `@react-navigation/bottom-tabs`. Renders dark pill bar (`bg-hero rounded-full`, absolute bottom-4, shadow-lg). Maps routes to icons using `lucide-react-native` (Home, Grid2x2, Plus, Mic, Settings). Active tab: white circle bg. Center "log" tab: amber FAB elevated above bar with + icon and `expo-haptics` feedback. Hides when keyboard is visible (`Keyboard.addListener`).

- [ ] **Step 2: Create ConfirmationDialog**

Props: `visible`, `title`, `body`, `onConfirm`, `onCancel`, `confirmLabel?`, `confirmVariant?` (danger|accent). Modal with `bg-black/50` overlay, `bg-surface rounded-2xl` card with two buttons: Cancel (neutral bg) + Confirm (variant-colored bg).

- [ ] **Step 3: Create BottomSheet**

Props: `visible`, `onClose`, `title?`, `children`. Modal with slide animation. Touch outside dismisses. Content: `bg-surface rounded-t-2xl` with drag handle, optional title, children.

- [ ] **Step 4: Create Toast**

Props: `message`, `variant` (success|error|info), `onDismiss`. Animated View that fades in, holds 3 seconds, fades out then calls onDismiss. Positioned absolute top.

- [ ] **Step 5: Commit**

```bash
git add apps/mobile/components/ui/floating-tab-bar.tsx apps/mobile/components/ui/confirmation-dialog.tsx apps/mobile/components/ui/bottom-sheet.tsx apps/mobile/components/ui/toast.tsx && git commit -m "feat(mobile): add navigation and feedback UI primitives"
```

---

## Task 14: Root Layout + Auth Guard + Tab Navigation

**Files:**
- Modify: `apps/mobile/index.ts`
- Delete: `apps/mobile/App.tsx`
- Create: `apps/mobile/app/_layout.tsx`
- Create: `apps/mobile/app/(auth)/_layout.tsx`
- Create: `apps/mobile/app/(tabs)/_layout.tsx`
- Create: `apps/mobile/app/+not-found.tsx`
- Create: `apps/mobile/app/(tabs)/agent.tsx` (placeholder)
- Create: `apps/mobile/app/(tabs)/settings.tsx` (placeholder)
- Create: `apps/mobile/app/(tabs)/log.tsx` (redirects to home)

- [ ] **Step 1: Update index.ts**

Replace contents with `import 'expo-router/entry';`

- [ ] **Step 2: Delete App.tsx**

```bash
rm apps/mobile/App.tsx
```

- [ ] **Step 3: Create app/_layout.tsx (root)**

- Load fonts via `useAppFonts()` — return null until loaded
- Create `QueryClient` with `staleTime: 30s`, `retry: 1`
- On mount: check `supabase.auth.getSession()` → populate `useAuthStore`
- Subscribe to `supabase.auth.onAuthStateChange`:
  - `SIGNED_IN` → setUser + `router.replace('/(tabs)')`
  - `SIGNED_OUT` → setUser(null) + `router.replace('/(auth)/login')`
- Render: `QueryClientProvider` > `Stack` with `(auth)`, `(tabs)`, `+not-found` screens

- [ ] **Step 4: Create app/(auth)/_layout.tsx**

Simple `Stack` with `headerShown: false`.

- [ ] **Step 5: Create app/(tabs)/_layout.tsx**

`Tabs` component with `tabBar={(props) => <FloatingTabBar {...props} />}` and `screenOptions={{ headerShown: false }}`. Tabs: index (Home), garage, log, agent, settings.

- [ ] **Step 6: Create placeholder screens**

- `agent.tsx` — SafeScreen + "Agent — coming soon" text
- `settings.tsx` — SafeScreen + "Settings — coming soon" text
- `log.tsx` — `<Redirect href="/(tabs)" />` (FAB handles this)
- `+not-found.tsx` — "Page not found" + link to home

- [ ] **Step 7: Test — app boots with Expo**

```bash
cd apps/mobile && npx expo start
```

Expected: App loads, shows login screen (no session), tab bar renders correctly.

- [ ] **Step 8: Commit**

```bash
git add apps/mobile/app/ apps/mobile/index.ts && git rm apps/mobile/App.tsx && git commit -m "feat(mobile): add root layout, auth guard, and tab navigation"
```

---

## Task 15: Auth Screens — Login + Register

**Files:**
- Create: `apps/mobile/app/(auth)/login.tsx`
- Create: `apps/mobile/app/(auth)/register.tsx`

- [ ] **Step 1: Create login.tsx**

Layout:
- `KeyboardAvoidingView` + `SafeScreen(scrollable)`
- Logo area: 🏍️ icon in dark rounded square + "Kickstand" title + "Your bike's AI companion" subtitle. Generous top padding.
- Error banner (if login fails): `bg-danger-surface rounded-lg` with error message
- Form (react-hook-form + zodResolver(loginSchema)):
  - `Controller` → `TextField(Email, email keyboard, autoCapitalize none)`
  - `Controller` → `TextField(Password, secureTextEntry)`
  - Submit button: `bg-hero rounded-full`, shows "Signing in..." when submitting
- Divider ("or")
- "Create account" outline button → `router.push('/(auth)/register')`

- [ ] **Step 2: Create register.tsx**

Layout:
- `KeyboardAvoidingView` + `SafeScreen(scrollable)`
- `ScreenHeader(title: "Create account", rightAction: "Sign in" link)`
- Error banner
- Form (react-hook-form + zodResolver(registerSchema)):
  - Name, Email, Password, Confirm Password TextFields
  - Submit button: "Create account" / "Creating account..."
- Auth state listener in root layout handles redirect on success

- [ ] **Step 3: Test manually**

- Open app → should see login
- Tap "Create account" → navigate to register
- Submit with invalid email → see validation error
- Submit with short password → see validation error
- Register with valid credentials → auto-redirect to tabs
- Sign out (from settings placeholder) → back to login

- [ ] **Step 4: Commit**

```bash
git add apps/mobile/app/(auth)/ && git commit -m "feat(mobile): add login and register screens"
```

---

## Task 16: Bike Feature Components

**Files:**
- Create: `apps/mobile/components/bike/bike-card.tsx`
- Create: `apps/mobile/components/bike/bike-form.tsx`
- Create: `apps/mobile/components/bike/bike-details-card.tsx`

- [ ] **Step 1: Create BikeCard**

Props: `bike: Bike`, `onPress`. ListCard wrapping a row: left column (model bold + plate/year muted), right column (MetricDisplay with mileage + "km").

- [ ] **Step 2: Create BikeForm**

Props: `defaultValues?: Partial<BikeFormValues>`, `onSubmit`, `submitLabel?`. Uses react-hook-form + zodResolver(bikeSchema). Renders two Sections:
1. Main: model (text), year (number pad), plate (caps), class (SelectField with 2B/2A/2), mileage (number pad)
2. "Compliance Dates (optional)": 4 DateFields for COE, road tax, insurance, inspection

Bottom: full-width `bg-hero rounded-full` submit button.

- [ ] **Step 3: Create BikeDetailsCard**

Props: `bike: Bike`. ListCard with label/value rows (Model, Year, Class label mapped, Plate) separated by dividers.

- [ ] **Step 4: Commit**

```bash
git add apps/mobile/components/bike/ && git commit -m "feat(mobile): add bike feature components"
```

---

## Task 17: Garage Screens — Bike List + Add Bike

**Files:**
- Create: `apps/mobile/app/(tabs)/garage/index.tsx`
- Create: `apps/mobile/app/(tabs)/garage/add.tsx`

- [ ] **Step 1: Create garage/index.tsx (bike list)**

- `SafeScreen(scrollable)` + `ScreenHeader(title: "Garage", rightAction: "+Add bike" button)`
- Loading: 3 Skeleton rows
- Empty: EmptyState("No bikes yet", "Add your first bike...", "Add bike")
- Data: map bikes to `BikeCard` → navigate to `/(tabs)/garage/${bike.id}` on press

- [ ] **Step 2: Create garage/add.tsx**

- `SafeScreen(scrollable)` + `ScreenHeader(title: "Add Bike")`
- `BikeForm` with `onSubmit` that calls `useCreateBike`, sets active bike, then `router.back()`

- [ ] **Step 3: Test manually**

- Navigate to Garage tab → see empty state
- Tap "Add bike" → fill form → save → see bike in list
- Verify bike appears in garage list with correct model/plate/mileage

- [ ] **Step 4: Commit**

```bash
git add apps/mobile/app/(tabs)/garage/index.tsx apps/mobile/app/(tabs)/garage/add.tsx && git commit -m "feat(mobile): add garage screen with bike list and add bike"
```

---

## Task 18: Garage Screens — Bike Detail + Edit + Delete

**Files:**
- Create: `apps/mobile/app/(tabs)/garage/[id]/_layout.tsx`
- Create: `apps/mobile/app/(tabs)/garage/[id]/index.tsx`
- Create: `apps/mobile/app/(tabs)/garage/[id]/edit.tsx`
- Create: `apps/mobile/app/(tabs)/garage/[id]/services.tsx`

- [ ] **Step 1: Create [id]/_layout.tsx**

Stack layout with `headerShown: false`.

- [ ] **Step 2: Create [id]/index.tsx (bike detail)**

- `useLocalSearchParams` to get `id`, `useBike(id)` for data
- Loading: Skeleton layout
- `ScreenHeader(title: bike.model, subtitle: plate, rightAction: Edit + Delete buttons)`
- `HeroCard` with mileage MetricDisplay (xl size, onHero) + "updated X ago"
- `Section(label: "Compliance")` with 2×2 grid of StatusCards. Use `daysUntil` + `getComplianceVariant` for each date field. Render each StatusCard in a `w-[47%]` View.
- `Section(label: "Service History")` — placeholder text for now
- `Section(label: "Bike Details")` with BikeDetailsCard
- `ConfirmationDialog` for delete: "Delete {model}?" + "This will also delete all service history for this bike." → `useDeleteBike` → `router.replace('/(tabs)/garage')`

- [ ] **Step 3: Create [id]/edit.tsx**

- `useBike(id)` for initial data, `useUpdateBike(id)` for mutation
- `BikeForm` with `defaultValues` from bike data, `onSubmit` calls updateBike then `router.back()`

- [ ] **Step 4: Create [id]/services.tsx (placeholder)**

- `ScreenHeader(title: "Service History", subtitle: bike.model)`
- `EmptyState("No services logged", "Tap + to log your first service")`

- [ ] **Step 5: Test full CRUD flow**

1. Add bike with compliance dates
2. View detail → verify compliance grid shows correct urgency colors
3. Edit → change mileage → verify updated on detail
4. Delete → confirm → verify redirected to empty garage

- [ ] **Step 6: Commit**

```bash
git add apps/mobile/app/(tabs)/garage/ && git commit -m "feat(mobile): add bike detail, edit, delete, and service history placeholder"
```

---

## Task 19: Dashboard Screen

**Files:**
- Create: `apps/mobile/app/(tabs)/index.tsx`

- [ ] **Step 1: Create dashboard (home tab)**

- `useBikes()` for bike list, `useBikeStore().activeBikeId` for selection
- Resolve active bike: `activeBikeId` match or first bike in list
- Greeting based on hour (morning/afternoon/evening)
- No bikes: EmptyState → "Add your first bike"
- Has bike:
  - `ScreenHeader(subtitle: greeting, title: bike.model, onTitlePress: bike switcher (future), rightAction: avatar button → settings)`
  - `HeroCard` with mileage MetricDisplay (xl, onHero) + "updated" timestamp
  - `Section(label: "Compliance")` with 2×2 StatusCard grid (same pattern as bike detail)
  - `Section(label: "Recent Service")` — placeholder "No services logged yet"

- [ ] **Step 2: Test — verify dashboard renders correctly with compliance grid**

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/app/(tabs)/index.tsx && git commit -m "feat(mobile): add dashboard with mileage hero and compliance grid"
```

---

## Task 20: End-to-End Smoke Test + Cleanup

- [ ] **Step 1: Full E2E test**

Run `npx expo start` and walk through:
1. Login screen renders → create account → register
2. Dashboard: empty state → "Add bike"
3. Add bike with model, plate, class, mileage, at least 2 compliance dates
4. Dashboard: mileage hero card, compliance grid with correct colors
5. Garage tab: bike appears in list
6. Tap bike → detail with hero card, compliance, bike details
7. Edit bike → change mileage → verify on detail
8. Delete bike → confirmation → back to empty garage
9. Tab bar: floats, hides on keyboard, FAB renders

- [ ] **Step 2: Fix any console warnings**

Common ones: missing keys in lists, VirtualizedList nesting, missing font weights.

- [ ] **Step 3: Run type check**

```bash
cd apps/mobile && npx tsc --noEmit
```

Fix any TypeScript errors.

- [ ] **Step 4: Commit cleanup**

```bash
git add -A && git commit -m "chore(mobile): fix warnings and type errors from smoke test"
```

---

## What's Next (Plan 2)

A separate plan will cover:
- Service log screens (list, add, detail, delete)
- FAB bottom sheet with quick actions
- Update mileage modal
- Dashboard "Recent Service" with real data + progress bar
- Settings screen (dark mode, sign out, active bike selector)
- Voice agent placeholder UI
- Offline screen
