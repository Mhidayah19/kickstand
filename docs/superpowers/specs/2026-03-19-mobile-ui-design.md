# Kickstand Mobile UI — Design Spec

**Date:** 2026-03-19
**Status:** Draft
**Spec reference:** `/Users/hid/personal/docs/superpowers/specs/2026-03-18-kickstand-mobile-design.md`
**Inspiration:** BizLink CRM by Ronas IT (Dribbble), Fuelio, Motorist SG, Calimoto redesign

---

## 1. Design Direction

### Aesthetic: Soft Tarmac
Warm, comfortable, easy on the eyes in Singapore's bright sunlight. Light mode default, dark mode companion for night riding. System-preference aware.

### Inspiration Sources
- **BizLink CRM (Ronas IT)** — floating dark pill tab bar, dark hero cards, generous padding, mixed number sizing, blush accent for alerts
- **Fuelio** — timeline-style service logs, cost analytics
- **Calimoto redesign** — simplified 3-tab approach, gloved-hand friendly tap targets
- **Motorist SG** — Singapore compliance tracking patterns

### What Makes It Distinctive
- Warm cream base (not cold white or stark dark) — feels like quality paper
- Dark hero cards for primary metrics create strong contrast without a full dark theme
- Colored tint cards for urgency (blush/amber) — communicate status without icons or badges
- Floating pill tab bar — modern, distinctive, not edge-attached
- Single font family at varied weights — cohesive and fast-loading

---

## 2. Design Tokens

All design values are defined as NativeWind/Tailwind theme tokens in `tailwind.config.ts`. Components reference tokens, never raw values.

### Color Palette

```
Light Mode:
  background:       #faf8f5    (warm cream — page background)
  surface:          #ffffff    (card background)
  surface-muted:    #f0ece6    (secondary surfaces, avatar bg)
  border:           #eae6e0    (card borders)
  border-subtle:    #f0ece6    (dividers)

  text-primary:     #1c1917    (headings, bold data)
  text-secondary:   #78716c    (body text, descriptions)
  text-muted:       #a8a29e    (labels, captions, timestamps)

  accent:           #d97706    (brand amber — FAB, links, active states)
  accent-surface:   #fef7ed    (amber tint background)

  danger:           #dc2626    (urgent, overdue, errors)
  danger-surface:   #f7eded    (blush tint background)

  success:          #22c55e    (safe, valid, complete)
  success-surface:  #f0fdf4    (green tint background)

  warning:          #ea580c    (distinct from accent — approaching deadline)
  warning-surface:  #fff7ed    (orange-tinted background)

  hero:             #1c1917    (dark hero card background)
  hero-text:        #faf8f5    (text on hero cards)
  hero-muted:       #78716c    (secondary text on hero cards)

Dark Mode:
  background:       #1c1917    (soft charcoal — not pure black)
  surface:          #292524    (card background)
  surface-muted:    #3a3633    (secondary surfaces)
  border:           #3a3633    (card borders)
  border-subtle:    #292524    (dividers)

  text-primary:     #faf8f5    (headings, bold data)
  text-secondary:   #a8a29e    (body text)
  text-muted:       #78716c    (labels, captions)

  accent:           #f59e0b    (slightly brighter amber for dark bg)
  accent-surface:   rgba(245,158,11,0.1)

  warning:          #f97316    (distinct orange for dark bg)
  warning-surface:  rgba(249,115,22,0.1)

  danger:           #f87171    (lighter red for dark bg)
  danger-surface:   rgba(248,113,113,0.1)

  success:          #4ade80    (lighter green for dark bg)
  success-surface:  rgba(74,222,128,0.1)

  hero:             #292524    (slightly lighter for dark mode hero)
  hero-text:        #faf8f5
  hero-muted:       #78716c
```

### Typography

**Font Family:** Plus Jakarta Sans — bundled as static assets in `assets/fonts/` for offline reliability. Do NOT use `@expo-google-fonts` (dynamic loading is unreliable on mobile).

```
Heading XL:     32px / 700 / -1px tracking    (screen titles)
Heading L:      22px / 700 / -0.5px tracking   (section hero text)
Heading M:      16px / 700 / 0px tracking       (card titles)
Heading S:      13px / 600 / 0px tracking       (section labels)

Body:           14px / 400 / 0px tracking       (descriptions, paragraphs)
Body Small:     12px / 400 / 0px tracking       (secondary info, dates)

Data XL:        48px / 700 / -2px tracking      (hero numbers — mileage)
Data L:         32px / 700 / -1px tracking      (compliance numbers)
Data M:         20px / 700 / -0.5px tracking    (inline data)
Data Unit:      14px / 500 / 0px tracking       (units beside numbers — "km", "days")

Label:          11px / 500 / 1.5px tracking     (uppercase labels)
Caption:        10px / 500 / 0.5px tracking     (tiny labels on data fields)

Tab Label:      11px / 600 / 0px tracking       (tab bar text — 11px minimum for readability)
```

### Spacing

```
spacing-xs:     4px
spacing-sm:     8px
spacing-md:     12px
spacing-lg:     16px
spacing-xl:     20px
spacing-2xl:    24px
spacing-3xl:    32px

page-padding:   16px     (horizontal page margin)
card-padding:   16px     (internal card padding — standard)
card-padding-lg: 20px    (internal card padding — hero cards, forms)
section-gap:    16px     (between sections)
```

### Border Radius

```
radius-sm:      8px      (badges, pills, small chips)
radius-md:      12px     (inner cards, nested elements)
radius-lg:      16px     (list item cards)
radius-xl:      18px     (primary cards)
radius-2xl:     20px     (hero cards)
radius-full:    9999px   (avatars, FAB, pill tab bar)
```

### Shadows

```
shadow-sm:      0 1px 2px rgba(0,0,0,0.04)     (subtle card lift)
shadow-md:      0 4px 12px rgba(0,0,0,0.08)    (elevated elements)
shadow-lg:      0 4px 20px rgba(0,0,0,0.15)    (floating tab bar)
shadow-fab:     0 4px 12px rgba(217,119,6,0.35) (FAB glow)
```

---

## 3. Component Library

Components built on React Native Reusables (shadcn-style, copy-paste, NativeWind). Each component is a single file in `components/ui/`. Page-level compositions go in `components/`.

### 3.1 Layout Components

#### `SafeScreen`
Wraps every screen with SafeAreaView + page padding + background color.
```
Props: scrollable?, className?
Structure: SafeAreaView > ScrollView? > View(page-padding)
```

#### `Section`
Groups related content with a label.
```
Props: label, children, action? (text + onPress for "See all" links)
Structure: View > Label(uppercase, text-muted) + children
Spacing: section-gap between sections
```

### 3.2 Card Components

#### `HeroCard`
Dark background card for primary metrics (mileage, spending totals).
```
Props: children, className?
Style: bg-hero, radius-2xl, card-padding, full-width
Usage: Mileage display, monthly cost summary
```

#### `StatusCard`
Compliance/maintenance status with colored tint backgrounds.
```
Props: label, value, unit, date, variant (expired | danger | warning | neutral)
Style:
  - expired: bg-danger, value in white text, pulsing StatusDot
  - danger: bg-danger-surface, value in text-danger
  - warning: bg-warning-surface, value in text-warning
  - neutral: bg-surface, border border, value in text-primary
Structure: View > Label(top) + Row(Data L + Data Unit) + Caption(date)
Usage: 2x2 compliance grid on dashboard
```

#### `ListCard`
Standard card for list items (services, compliance rows, workshops).
```
Props: children, onPress?, className?
Style: bg-surface, border, radius-xl, card-padding
Usage: Service log entries, compliance list items, workshop cards
```

#### `AlertBanner`
Prominent notification card for items needing attention.
```
Props: icon?, children, variant (danger | warning | info)
Style: bg-{variant}-surface, radius-xl, card-padding
Usage: "Oil change due soon", "2 items need attention"
```

### 3.3 Data Display Components

#### `MetricDisplay`
Large number + small unit label side by side (BizLink style).
```
Props: value, unit?, size (xl | l | m), color?
Structure: Row(Data text + Unit text, baseline-aligned)
Usage: "15,200 km", "14 days", "$85"
```

#### `ProgressBar`
Thin bar with label + percentage.
```
Props: progress (0-1), label?, showPercent?
Style: 4px height, bg-surface-muted track, bg-hero fill, radius-sm
Usage: Maintenance intervals ("Next oil change 96%")
```

#### `StatusDot`
Tiny colored circle indicating status.
```
Props: variant (danger | warning | success)
Style: 6px circle, bg-{variant}
Usage: Inline status in compliance list rows
```

#### `PillBadge`
Small rounded badge for status/metadata.
```
Props: label, variant (danger | warning | success | neutral)
Style: radius-sm padding, text-xs, bg-{variant}-surface, text-{variant}
Usage: "Oil due soon", "14d", "Medium"
```

### 3.4 Input Components

#### `TextField`
Standard text input with label.
```
Props: label, placeholder, value, onChangeText, error?, keyboardType?
Style: bg-surface, border, radius-lg, card-padding, Label on top
Error state: border-danger, error text below in text-danger
```

#### `SelectField`
Dropdown/picker with label.
```
Props: label, options, value, onValueChange, error?
Style: Same as TextField, chevron icon right-aligned
```

#### `DateField`
Date picker trigger with label.
```
Props: label, value, onChange, error?
Style: Same as TextField, calendar icon right-aligned
```

#### `FilterChips`
Horizontal scrollable pill-shaped filter buttons (BizLink style).
```
Props: options[], selected, onSelect
Style:
  - Active: bg-hero, text-hero-text, radius-full
  - Inactive: bg-surface, border, text-secondary, radius-full
Usage: Service type filters, status filters
```

### 3.5 Navigation Components

#### `FloatingTabBar`
Dark pill-shaped bottom tab bar with center FAB.
```
Style: bg-hero, radius-full, shadow-lg, positioned absolute bottom-16
Active tab: white circle background with dark icon
Inactive tab: hero-muted icon, no background
Center: amber FAB (radius-full, bg-accent, shadow-fab) elevated above bar
```

#### `ScreenHeader`
Top section with greeting/title + action button.
```
Props: title, subtitle?, rightAction? (avatar, settings icon, etc.)
Style: Row, space-between, page-padding
```

### 3.6 Feedback Components

#### `EmptyState`
Shown when lists have no data.
```
Props: title, description, actionLabel?, onAction?
Style: Centered, text-muted, optional accent-colored action button
```

#### `Toast`
Brief feedback message (saved, deleted, error).
```
Props: message, variant (success | error | info)
Style: Floating top, radius-lg, shadow-md, auto-dismiss 3s
```

---

## 4. Screen Designs

### 4.1 Auth Screens

#### Login
```
Structure:
  SafeScreen(scrollable)
    Logo + app name (centered, top third)
    Section
      TextField(Email)
      TextField(Password, secureTextEntry)
      Button(primary, "Sign in", full-width, bg-hero, radius-full)
    Divider("or")
    Button(outline, "Create account", full-width, radius-full)

Style notes:
  - Logo area uses generous top spacing (30% of screen)
  - Primary button is dark (bg-hero) not accent — feels premium
  - No social login in MVP
```

#### Register
```
Structure:
  SafeScreen(scrollable)
    ScreenHeader("Create account")
    Section
      TextField(Name)
      TextField(Email)
      TextField(Password, secureTextEntry)
      TextField(Confirm Password, secureTextEntry)
      Button(primary, "Create account", full-width, bg-hero, radius-full)
    Link("Already have an account? Sign in", text-accent)
```

### 4.2 Dashboard (Home Tab)

Layout A as approved. Full structure:

```
Structure:
  SafeScreen(scrollable)
    ScreenHeader(subtitle: "Good evening", title: bike name, right: avatar)

    HeroCard
      Label("Current Mileage", uppercase)
      MetricDisplay(value: "15,200", unit: "km", size: xl)
      Caption("updated 2 days ago")
      Row(PillBadge("Oil change in 200 km", warning) + chevron)

    Section(label: "Compliance")
      Grid(2x2)
        StatusCard(Inspection, 7, "days", "25 Mar 2026", danger)
        StatusCard(Road Tax, 14, "days", "1 Apr 2026", warning)
        StatusCard(Insurance, 182, "days", "15 Sep 2026", neutral)
        StatusCard(COE, 5, "years", "20 Mar 2031", neutral)

    Section(label: "Recent Service")
      ListCard
        Heading M("Oil Change")
        Body Small("Full synthetic 10W-40")
        Row(Workshop | Date | Cost)
        ProgressBar(0.96, "Next oil change")

    FloatingTabBar
```

### 4.3 Garage (Bikes Tab)

#### Bike List (multi-bike users)
```
Structure:
  SafeScreen(scrollable)
    ScreenHeader(title: "Garage")

    ForEach(bike):
      ListCard(onPress → Bike Detail)
        Row
          Column
            Heading M(bike.model)
            Body Small(bike.plateNumber + " · " + bike.year)
          Column(right-aligned)
            MetricDisplay(value: mileage, unit: "km", size: m)

    EmptyState("No bikes yet", "Add your first bike to get started", "Add bike")
```

#### Bike Detail
```
Structure:
  SafeScreen(scrollable)
    ScreenHeader(title: bike.model, subtitle: bike.plateNumber)

    HeroCard
      MetricDisplay(value: mileage, unit: "km", size: xl)
      Caption("updated X ago")
      Button("Update mileage", outline, small)

    Section(label: "Compliance", action: "Edit dates")
      Grid(2x2)
        StatusCard(each compliance field)

    Section(label: "Service History", action: "See all")
      ForEach(recentServices, limit: 3):
        ListCard(service summary row)

    Section(label: "Bike Details")
      ListCard
        Row(Label: "Model", Value: bike.model)
        Divider
        Row(Label: "Year", Value: bike.year)
        Divider
        Row(Label: "Class", Value: bike.class)
        Divider
        Row(Label: "Plate", Value: bike.plateNumber)
```

#### Add/Edit Bike
```
Structure:
  SafeScreen(scrollable)
    ScreenHeader(title: "Add Bike" or "Edit Bike")
    Section
      TextField(Model, placeholder: "Honda CB400X")
      TextField(Year, keyboardType: numeric)
      TextField(Plate Number, placeholder: "FBxx1234A")
      SelectField(Class, options: ["2B", "2A", "2"])
      TextField(Current Mileage, keyboardType: numeric)
    Section(label: "Compliance Dates (optional)")
      DateField(COE Expiry)
      DateField(Road Tax Expiry)
      DateField(Insurance Expiry)
      DateField(Inspection Due)
    Button(primary, "Save", full-width, bg-hero, radius-full)
```

### 4.4 Service Log

#### Service List (per bike)
```
Structure:
  SafeScreen(scrollable)
    ScreenHeader(title: "Service History", subtitle: bike.model)
    FilterChips(["All", "Oil Change", "Chain", "Brakes", "Tyres", ...])

    ForEach(services):
      ListCard(onPress → Service Detail)
        Row
          Column
            Heading M(service.serviceType)
            Body Small(service.workshop + " · " + service.date)
          Column(right-aligned)
            Heading M("$" + service.cost)
            Body Small(service.mileageAt + " km")

    EmptyState("No services logged", "Tap + to log your first service")
```

#### Add Service (also accessible from center FAB)
```
Structure:
  SafeScreen(scrollable)
    ScreenHeader(title: "Log Service")
    Section
      SelectField(Bike, options: user's bikes — pre-selected if from bike detail)
      SelectField(Service Type, options from service_types table)
      TextField(Description, multiline)
      TextField(Cost, keyboardType: decimal, prefix: "$")
      TextField(Mileage at Service, keyboardType: numeric)
      DateField(Date, default: today)
      TextField(Workshop, optional, autocomplete from workshops table)
      PhotoField(Receipt, optional — camera or gallery, uploads to Supabase Storage)
    Button(primary, "Save", full-width, bg-hero, radius-full)
```

### 4.5 Voice Agent

```
Structure:
  SafeScreen
    ScreenHeader(title: "Agent", subtitle: bike.model + " · " + mileage + " km")

    Center content area:
      When idle:
        Large mic icon (bg-surface-muted, 80px circle)
        Body("Tap to talk about your " + bike.model)
        Caption("Ask about maintenance, workshops, or compliance")

      When listening:
        Pulsing mic icon (bg-accent, animated ring)
        Body("Listening...")

      When responding:
        Agent response text in chat bubble (bg-surface, radius-xl)
        Body Small(timestamp)

    Bottom:
      Mic button (bg-hero, 64px circle, radius-full, centered)
      Caption("Hold to talk, release to send")

Style notes:
  - Voice-first, not chat-first — the mic is the hero, not a text input
  - Conversation history scrolls up, most recent at bottom
  - Agent responses use ListCard style bubbles
  - No text input in MVP (voice only with text fallback on error)
```

### 4.6 Settings

```
Structure:
  SafeScreen(scrollable)
    ScreenHeader(title: "Settings")

    Section(label: "Account")
      ListCard
        Row(Label: "Name", Value: user.name, chevron)
        Divider
        Row(Label: "Email", Value: user.email, chevron)

    Section(label: "Preferences")
      ListCard
        Row(Label: "Dark Mode", Value: Switch toggle)
        Divider
        Row(Label: "Notifications", Value: Switch toggle, chevron)

    Section(label: "Active Bike")
      ListCard
        Row(Label: current bike name, chevron → bike selector)

    Button(outline, "Sign out", full-width, text-danger)
    Caption("Kickstand v1.0.0", centered, text-muted)
```

### 4.7 Update Mileage (Modal from FAB or Bike Detail)

```
Structure:
  BottomSheet
    Heading L("Update Mileage")
    Caption("Current: 15,200 km")
    TextField(New Mileage, keyboardType: numeric, autoFocus)
    Caption(text-danger, "Mileage cannot be lower than 15,200 km" — shown on validation error)
    Button(primary, "Update", full-width, bg-hero, radius-full)

Style notes:
  - Bottom sheet, not full screen — quick action
  - Auto-focus on the input for immediate typing
  - Shows current mileage for reference
  - Validates: new mileage must be > current mileage
```

### 4.8 Service Detail

```
Structure:
  SafeScreen(scrollable)
    ScreenHeader(title: service.serviceType, right: delete icon)

    ListCard
      Row(Label: "Workshop", Value: service.workshop)
      Divider
      Row(Label: "Date", Value: service.date)
      Divider
      Row(Label: "Cost", Value: "$" + service.cost)
      Divider
      Row(Label: "Mileage", Value: service.mileageAt + " km")
      Divider
      Row(Label: "Description", Value: service.description)
      Divider (if receipt_url)
      Row(Label: "Receipt", Value: thumbnail image, onPress → full image)

    ConfirmationDialog (on delete icon press)
      Title: "Delete service?"
      Body: "This cannot be undone."
      Actions: "Cancel" (neutral) | "Delete" (danger)
```

### 4.9 FAB Bottom Sheet

```
Structure:
  BottomSheet (triggered by center FAB tap)
    Heading M("Quick Actions")
    List:
      Row(icon: wrench, "Log Service", onPress → log-service modal)
      Divider
      Row(icon: gauge, "Update Mileage", onPress → update-mileage modal)
      Divider
      Row(icon: bike, "Add Bike", onPress → garage/add)

Style notes:
  - Haptic feedback on FAB press (expo-haptics)
  - Sheet auto-dismisses on action selection
  - Items use ListCard row style
```

### 4.10 Offline Screen

```
Structure:
  SafeScreen
    Center content:
      Icon (wifi-off, 48px, text-muted)
      Heading M("No internet connection")
      Body("Kickstand needs internet to sync your data. Check your connection and try again.")
      Button(outline, "Retry", radius-full)
```

### 4.11 Voice Agent — Text Fallback

```
When voice service is unavailable:
  AlertBanner(variant: warning, "Voice unavailable. Type instead.")
  Conversation area (same as voice responding state)
  Bottom:
    TextField(placeholder: "Ask about your bike...", right: send icon)
    Caption("Voice will resume when available")

Style notes:
  - Banner appears at top of agent screen
  - Mic button replaced with text input
  - Conversation history still visible
```

### 4.12 Delete Confirmation (Bike)

```
Structure:
  ConfirmationDialog
    Title: "Delete CB400X?"
    Body: "This will also delete all service history for this bike."
    Actions: "Cancel" (neutral) | "Delete" (danger)

Triggered from: Bike Detail screen (action menu or delete button in edit screen)
```

---

## 5. NativeWind / Tailwind CSS Setup

### tailwind.config.ts

All tokens from Section 2 are configured in the Tailwind theme. This is the single source of truth — no raw hex values in component code.

```ts
// Key configuration approach:

theme: {
  extend: {
    colors: {
      background: 'var(--color-background)',
      surface: 'var(--color-surface)',
      'surface-muted': 'var(--color-surface-muted)',
      border: 'var(--color-border)',
      'text-primary': 'var(--color-text-primary)',
      'text-secondary': 'var(--color-text-secondary)',
      'text-muted': 'var(--color-text-muted)',
      accent: 'var(--color-accent)',
      'accent-surface': 'var(--color-accent-surface)',
      danger: 'var(--color-danger)',
      'danger-surface': 'var(--color-danger-surface)',
      warning: 'var(--color-warning)',
      'warning-surface': 'var(--color-warning-surface)',
      success: 'var(--color-success)',
      'success-surface': 'var(--color-success-surface)',
      hero: 'var(--color-hero)',
      'hero-text': 'var(--color-hero-text)',
      'hero-muted': 'var(--color-hero-muted)',
    },
    fontFamily: {
      sans: ['PlusJakartaSans'],
      'sans-medium': ['PlusJakartaSans-Medium'],
      'sans-semibold': ['PlusJakartaSans-SemiBold'],
      'sans-bold': ['PlusJakartaSans-Bold'],
    },
    borderRadius: {
      sm: '8px',
      md: '12px',
      lg: '16px',
      xl: '18px',
      '2xl': '20px',
    },
  }
}
```

### CSS Variable Approach for Theming

Light/dark mode is driven by CSS variables on the root, toggled by NativeWind's `dark:` variant or system preference. Components use semantic class names like `bg-background`, `text-primary`, `bg-danger-surface` — never raw colors.

### File Structure

```
apps/mobile/
  app/                          # Expo Router file-based routes
    (auth)/
      login.tsx
      register.tsx
    (tabs)/
      _layout.tsx               # Tab layout with FloatingTabBar
      index.tsx                 # Dashboard (Home)
      garage/
        index.tsx               # Bike list
        add.tsx                 # Add bike form
        [id]/
          _layout.tsx           # Bike detail layout (stack)
          index.tsx             # Bike detail
          services.tsx          # Service list for bike
          edit.tsx              # Edit bike form
      agent.tsx                 # Voice agent
      settings.tsx              # Settings
    log-service.tsx             # Modal: Log service (from FAB)
    update-mileage.tsx          # Modal: Update mileage (from FAB)
    service/[id].tsx            # Service detail
    _layout.tsx                 # Root layout (auth check, providers)
    +not-found.tsx              # 404 screen
    offline.tsx                 # No internet connection screen

  components/
    ui/                         # Primitive components (shadcn-style via RNR)
      hero-card.tsx
      status-card.tsx
      list-card.tsx
      alert-banner.tsx
      metric-display.tsx
      progress-bar.tsx
      status-dot.tsx
      pill-badge.tsx
      text-field.tsx
      select-field.tsx
      date-field.tsx
      filter-chips.tsx
      floating-tab-bar.tsx
      screen-header.tsx
      safe-screen.tsx
      section.tsx
      empty-state.tsx
      toast.tsx
      confirmation-dialog.tsx
      bottom-sheet.tsx
      skeleton.tsx
      offline-banner.tsx

    # Page-level compositions (combine ui/ components)
    dashboard/
      compliance-grid.tsx       # 2x2 StatusCard grid
      mileage-hero.tsx          # HeroCard with mileage display
      recent-service.tsx        # Service summary card
    bike/
      bike-card.tsx             # Bike list item
      bike-details-card.tsx     # Static details display
      bike-form.tsx             # Add/edit form
    service/
      service-card.tsx          # Service list item
      service-form.tsx          # Log service form
    agent/
      agent-idle.tsx            # Idle state with mic
      agent-listening.tsx       # Listening state
      agent-response.tsx        # Response bubble
      agent-text-fallback.tsx   # Text input fallback when voice unavailable

  lib/
    api/
      client.ts                 # Base fetch wrapper: auth token injection, base URL, 401 interceptor + token refresh
      use-bikes.ts              # TanStack Query hooks for bikes
      use-services.ts           # TanStack Query hooks for service logs
      use-auth.ts               # TanStack Query hooks for auth
    store/
      auth-store.ts             # Zustand: auth state, tokens, user
      bike-store.ts             # Zustand: active bike selection
    types/
      bike.ts                   # Bike, CreateBikeInput, UpdateBikeInput
      service.ts                # ServiceLog, CreateServiceInput
      auth.ts                   # User, LoginInput, RegisterInput
      api.ts                    # PaginatedResponse, ApiError
    validation/
      bike-schema.ts            # Zod schemas for bike forms
      service-schema.ts         # Zod schemas for service forms
      auth-schema.ts            # Zod schemas for auth forms
    supabase.ts                 # Supabase client init
    theme.ts                    # CSS variable definitions for light/dark

  assets/
    fonts/
      PlusJakartaSans-Regular.ttf
      PlusJakartaSans-Medium.ttf
      PlusJakartaSans-SemiBold.ttf
      PlusJakartaSans-Bold.ttf

  tailwind.config.ts
  global.css                    # CSS variables + base styles
  nativewind-env.d.ts
```

---

## 6. Key UX Patterns

### Urgency Communication
- **Expired:** Solid `bg-danger`, white text, pulsing StatusDot — demands immediate action
- **≤7 days:** Blush background (`danger-surface`), red text, red status dot
- **≤30 days:** Orange background (`warning-surface`), orange text (`warning`), orange dot — visually distinct from brand accent
- **>30 days:** White/surface background, neutral text, green dot

### Empty States
Every list screen has a designed empty state with:
- Descriptive title ("No bikes yet")
- Helpful subtitle ("Add your first bike to get started")
- Single action button when applicable

### Loading States
- Skeleton screens matching card layouts (not spinners)
- Pull-to-refresh on all list screens
- Optimistic updates for service logging

### Form Patterns
- Labels above inputs (not floating/inline)
- Error messages below the field, in `text-danger`
- Required fields have no asterisk — optional fields are marked "(optional)"
- Primary action button always at bottom, full-width, `bg-hero`

### Navigation Patterns
- Tab bar is always visible (except auth screens and modals)
- Tab bar hides when keyboard is open (use `Keyboard.addListener` to detect)
- Center FAB opens a bottom sheet with quick actions: "Log Service", "Update Mileage", "Add Bike"
- FAB triggers haptic feedback (expo-haptics) on press
- Back button on all stack screens (Expo Router default)
- Active bike context shown in dashboard header and agent screen
- Bike switcher: dashboard header title (bike name) is tappable → opens bike selector bottom sheet for quick switching (not just in Settings)
- Form screens (log-service, update-mileage) are presented as modals outside the tab navigator

### Dark Mode
- System preference by default, manual override in settings
- All components use semantic tokens — dark mode is automatic via CSS variables
- Dark mode hero cards use `surface` color (slightly lighter) to maintain elevation hierarchy
- Status tint colors use rgba variants on dark backgrounds

---

## 7. Boilerplate Strategy

### Foundation
Start from **Obytes Starter** (4k stars, production-grade CI/CD, Maestro E2E) or **toyamarodrigo/expo-router-template** (closest stack match).

### Component Library
**React Native Reusables** (8k stars) via CLI for base primitives (Button, Input, Card, Dialog, Select, Tabs, etc.). Customise with Kickstand's design tokens.

### Key References
- **rnr-base-bare** — React Native Reusables + Supabase Auth + Expo Router wiring
- **expo-supabase-starter** (774 stars) — Supabase Auth + Expo Router patterns
- **Teczer/fast-expo-app** — MMKV + Zustand + TanStack Query persistence

### Packages to Install
```
# UI + Styling
nativewind@4          # Tailwind for RN
tailwindcss           # Tailwind engine
@react-native-reusables/cli  # Component installer

# State + Data
@tanstack/react-query # Server state
zustand               # Client state
react-native-mmkv     # Fast storage

# Forms
react-hook-form       # Form management
zod                   # Schema validation
@hookform/resolvers   # Zod adapter

# Lists
@shopify/flash-list   # Performant lists

# Auth
@supabase/supabase-js # Supabase client

# Navigation
expo-router           # File-based routing (already in Expo 55)

# Fonts (bundled as static assets, not Google Fonts)
expo-font                 # Font loading

# Misc
expo-haptics          # Tactile feedback on FAB press
react-native-reanimated  # Animations (tab bar, agent pulsing)
```

---

## 8. Deferred Screens (Not in MVP UI Plan)

These screens are defined in the original spec but deferred because their backend endpoints don't exist yet:

- **Workshop discovery** (`/workshops?lat=X&lng=Y`) — Find nearby workshops, workshop detail, price comparison. Will be built when the workshops API and seed data are ready.
- **Notification center** — In-app notification list/history. Push notifications work via Expo Push API without a UI screen; an in-app notification center is Phase 2.
- **Location permission flow** — Required for workshop discovery, deferred with it.

These will get their own UI spec when the backend is ready.

---

## 9. Implementation Priority

1. **Foundation** — NativeWind setup, design tokens, global.css with CSS variables, font loading, theme switching
2. **UI primitives** — All components in `components/ui/`
3. **Auth screens** — Login, Register (gate everything)
4. **Garage** — Bike list, add bike, bike detail, edit bike, delete confirmation
5. **Dashboard** — Home tab with compliance grid, mileage hero, bike switcher
6. **Service log** — List, add service, service detail, delete confirmation
7. **FAB + modals** — Bottom sheet, log service modal, update mileage modal
8. **Settings** — Preferences, dark mode toggle, sign out
9. **Voice agent** — Placeholder UI with text fallback (backend not built yet)
10. **Offline screen** — No internet connection handling
