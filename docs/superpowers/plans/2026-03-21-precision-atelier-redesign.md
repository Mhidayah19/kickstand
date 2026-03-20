# Precision Atelier Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign all Kickstand mobile screens to the Precision Atelier design system with new tokens, icons, and navigation.

**Architecture:** Update design tokens first (colors, fonts, spacing), then rebuild shared components bottom-up, then rewrite each screen to match `stitch/` HTML mockups. MaterialCommunityIcons replaces Lucide. Floating tab bar gets center Agent FAB triggering a bottom sheet.

**Tech Stack:** React Native (Expo Router), NativeWind/Tailwind, expo-blur, expo-linear-gradient, MaterialCommunityIcons, react-native-reanimated

**Spec:** `docs/superpowers/specs/2026-03-21-precision-atelier-redesign-design.md`

---

## File Map

### New Files
- `apps/mobile/assets/fonts/PlusJakartaSans-ExtraBold.ttf` — ExtraBold font weight
- `apps/mobile/components/ui/top-app-bar.tsx` — Sticky translucent header
- `apps/mobile/components/ui/bento-stat.tsx` — Label + value stat card
- `apps/mobile/components/ui/primary-button.tsx` — Full-width charcoal CTA
- `apps/mobile/components/ui/timeline-entry.tsx` — Service history timeline node + card
- `apps/mobile/components/ui/profile-hero.tsx` — Profile card with avatar, name, role
- `apps/mobile/components/bike/bike-image-card.tsx` — Bike card with hero image + stats

### Modified Files
- `apps/mobile/tailwind.config.ts` — New color tokens, spacing, radius, fonts, text sizes
- `apps/mobile/global.css` — Remove CSS variables, minimal base
- `apps/mobile/lib/theme.ts` — Register ExtraBold font
- `apps/mobile/app/(tabs)/_layout.tsx` — Reorder tabs, agent → center
- `apps/mobile/components/ui/floating-tab-bar.tsx` — Full redesign
- `apps/mobile/components/ui/hero-card.tsx` — New tokens + rounded-3xl
- `apps/mobile/components/ui/screen-header.tsx` — Add label prop, xbold
- `apps/mobile/components/ui/filter-chips.tsx` — Add wrap prop, new colors
- `apps/mobile/components/ui/progress-bar.tsx` — Add label/statusText, color variants
- `apps/mobile/components/ui/list-card.tsx` — Add subtitle, icon, chevron pattern
- `apps/mobile/components/ui/pill-badge.tsx` — New color variants
- `apps/mobile/components/ui/status-card.tsx` — Square aspect, icon + pill layout
- `apps/mobile/components/ui/safe-screen.tsx` — Update padding defaults
- `apps/mobile/components/ui/section.tsx` — New token colors
- `apps/mobile/components/ui/empty-state.tsx` — Dashed border style
- `apps/mobile/components/ui/text-field.tsx` — Surface-low bg, borderless
- `apps/mobile/components/ui/bottom-sheet.tsx` — Token color update
- `apps/mobile/app/(tabs)/index.tsx` — Dashboard redesign
- `apps/mobile/app/(tabs)/garage/index.tsx` — My Garage redesign
- `apps/mobile/app/(tabs)/garage/[id]/index.tsx` — Bike Detail redesign
- `apps/mobile/app/(tabs)/garage/[id]/services.tsx` — New Service Log form
- `apps/mobile/app/(tabs)/log.tsx` — Service History timeline
- `apps/mobile/app/(tabs)/settings.tsx` — Settings/Profile redesign
- `apps/mobile/app/(tabs)/agent.tsx` — Empty placeholder

### Deleted Files
- `apps/mobile/components/ui/status-dot.tsx`
- `apps/mobile/components/ui/alert-banner.tsx`
- `apps/mobile/components/ui/metric-display.tsx`
- `apps/mobile/components/bike/bike-card.tsx`

---

## Phase 1: Token Foundation

### Task 1: Install dependencies and add ExtraBold font

**Files:**
- Create: `apps/mobile/assets/fonts/PlusJakartaSans-ExtraBold.ttf`
- Modify: `apps/mobile/lib/theme.ts`

- [ ] **Step 1: Install expo-blur and expo-linear-gradient**

```bash
cd apps/mobile && npx expo install expo-blur expo-linear-gradient
```

- [ ] **Step 2: Download ExtraBold font**

Download `PlusJakartaSans-ExtraBold.ttf` from Google Fonts and save to `apps/mobile/assets/fonts/`. Verify the file exists alongside the other weights:

```bash
ls apps/mobile/assets/fonts/PlusJakartaSans-*.ttf
```

Expected: Regular, Medium, SemiBold, Bold, ExtraBold — 5 files.

- [ ] **Step 3: Register ExtraBold in useAppFonts()**

Modify `apps/mobile/lib/theme.ts` — add one line to the useFonts call:

```typescript
import { useFonts } from 'expo-font';

export function useAppFonts() {
  return useFonts({
    'PlusJakartaSans-Regular': require('../assets/fonts/PlusJakartaSans-Regular.ttf'),
    'PlusJakartaSans-Medium': require('../assets/fonts/PlusJakartaSans-Medium.ttf'),
    'PlusJakartaSans-SemiBold': require('../assets/fonts/PlusJakartaSans-SemiBold.ttf'),
    'PlusJakartaSans-Bold': require('../assets/fonts/PlusJakartaSans-Bold.ttf'),
    'PlusJakartaSans-ExtraBold': require('../assets/fonts/PlusJakartaSans-ExtraBold.ttf'),
  });
}
```

Keep `getComplianceVariant` and `daysUntil` unchanged.

- [ ] **Step 4: Commit**

```bash
git add apps/mobile/assets/fonts/PlusJakartaSans-ExtraBold.ttf apps/mobile/lib/theme.ts apps/mobile/package.json
git commit -m "feat(mobile): add ExtraBold font and install expo-blur, expo-linear-gradient"
```

---

### Task 2: Update tailwind.config.ts with new design tokens

**Files:**
- Modify: `apps/mobile/tailwind.config.ts`

- [ ] **Step 1: Replace entire tailwind config**

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        charcoal: '#1E1E1E',
        sand: '#C7B299',
        yellow: '#F2D06B',
        surface: '#F9F9F9',
        'surface-low': '#F3F3F3',
        'surface-card': '#FFFFFF',
        outline: '#D0C5BA',
        danger: '#DC2626',
        'danger-surface': '#FFDAD6',
        success: '#22C55E',
      },
      fontFamily: {
        sans: ['PlusJakartaSans-Regular'],
        'sans-medium': ['PlusJakartaSans-Medium'],
        'sans-semibold': ['PlusJakartaSans-SemiBold'],
        'sans-bold': ['PlusJakartaSans-Bold'],
        'sans-xbold': ['PlusJakartaSans-ExtraBold'],
      },
      fontSize: {
        xxs: ['10px', { lineHeight: '14px' }],
      },
      letterSpacing: {
        'wide-1': '2px',
        'wide-2': '3px',
        widest: '4px',
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '32px',
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '32px',
        '4xl': '48px',
      },
    },
  },
};

export default config;
```

- [ ] **Step 2: Verify config is valid**

```bash
cd apps/mobile && npx tsc --noEmit tailwind.config.ts 2>&1 || echo "Type check not available for config, continue"
```

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/tailwind.config.ts
git commit -m "feat(mobile): update tailwind tokens to Precision Atelier palette"
```

---

### Task 3: Simplify global.css

**Files:**
- Modify: `apps/mobile/global.css`

- [ ] **Step 1: Replace global.css — remove all CSS variables**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

That's it. All color values are now hardcoded in `tailwind.config.ts`.

- [ ] **Step 2: Commit**

```bash
git add apps/mobile/global.css
git commit -m "feat(mobile): remove CSS variables from global.css, use hardcoded tokens"
```

---

## Phase 2: Shared Components

### Task 4: Build TopAppBar

**Files:**
- Create: `apps/mobile/components/ui/top-app-bar.tsx`

- [ ] **Step 1: Create TopAppBar component**

```tsx
import { View, Text, Pressable, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface TopAppBarProps {
  onNotificationPress?: () => void;
}

export function TopAppBar({ onNotificationPress }: TopAppBarProps) {
  return (
    <BlurView
      intensity={70}
      tint="light"
      className="absolute top-0 left-0 right-0 z-50"
    >
      <View className="flex-row items-center justify-between px-6 py-4">
        <View className="flex-row items-center gap-3">
          <View className="w-8 h-8 rounded-full bg-sand/30 overflow-hidden">
            <Image
              source={{ uri: 'https://via.placeholder.com/32' }}
              className="w-full h-full"
            />
          </View>
          <Text className="font-sans-bold text-sm text-charcoal uppercase tracking-wide-2">
            PRECISION ATELIER
          </Text>
        </View>
        <Pressable
          onPress={onNotificationPress}
          hitSlop={8}
          className="active:opacity-70"
        >
          <MaterialCommunityIcons name="bell-outline" size={24} color="#1E1E1E" />
        </Pressable>
      </View>
    </BlurView>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/mobile/components/ui/top-app-bar.tsx
git commit -m "feat(mobile): add TopAppBar component with blur backdrop"
```

---

### Task 5: Build PrimaryButton

**Files:**
- Create: `apps/mobile/components/ui/primary-button.tsx`

- [ ] **Step 1: Create PrimaryButton component**

```tsx
import { Pressable, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  icon?: string;
  iconColor?: string;
  disabled?: boolean;
}

export function PrimaryButton({
  label,
  onPress,
  icon,
  iconColor = '#F2D06B',
  disabled = false,
}: PrimaryButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className="w-full bg-charcoal py-5 rounded-2xl flex-row items-center justify-center gap-3"
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.98 : 1 }],
        opacity: disabled ? 0.5 : pressed ? 0.9 : 1,
      })}
    >
      {icon && (
        <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: iconColor }}>
          <MaterialCommunityIcons name={icon as any} size={20} color="#1E1E1E" />
        </View>
      )}
      <Text className="font-sans-bold text-sm text-white uppercase tracking-wide-1">
        {label}
      </Text>
    </Pressable>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/mobile/components/ui/primary-button.tsx
git commit -m "feat(mobile): add PrimaryButton component"
```

---

### Task 6: Build BentoStat

**Files:**
- Create: `apps/mobile/components/ui/bento-stat.tsx`

- [ ] **Step 1: Create BentoStat component**

```tsx
import { View, Text } from 'react-native';

interface BentoStatProps {
  label: string;
  value: string;
  accent?: boolean;
}

export function BentoStat({ label, value, accent = false }: BentoStatProps) {
  return (
    <View
      className="bg-surface-card p-5 rounded-xl flex-1"
      style={accent ? { borderBottomWidth: 2, borderBottomColor: '#F2D06B' } : undefined}
    >
      <Text className="font-sans-bold text-xxs text-outline uppercase tracking-widest mb-1">
        {label}
      </Text>
      <Text className="font-sans-bold text-lg text-charcoal">{value}</Text>
    </View>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/mobile/components/ui/bento-stat.tsx
git commit -m "feat(mobile): add BentoStat component"
```

---

### Task 7: Build TimelineEntry

**Files:**
- Create: `apps/mobile/components/ui/timeline-entry.tsx`

- [ ] **Step 1: Create TimelineEntry component**

```tsx
import { View, Text, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type TimelineColor = 'yellow' | 'charcoal' | 'danger';

interface TimelineEntryProps {
  date: string;
  title: string;
  cost: string;
  icon: string;
  color: TimelineColor;
  tags?: { label: string; danger?: boolean }[];
  quote?: string;
  imageUri?: string;
}

const nodeColors: Record<TimelineColor, string> = {
  yellow: '#F2D06B',
  charcoal: '#1E1E1E',
  danger: '#DC2626',
};

export function TimelineEntry({
  date,
  title,
  cost,
  icon,
  color,
  tags,
  quote,
  imageUri,
}: TimelineEntryProps) {
  return (
    <View className="relative pl-12 mb-12">
      {/* Node */}
      <View
        className="absolute left-0 top-1 w-8 h-8 rounded-full items-center justify-center z-10"
        style={{ backgroundColor: nodeColors[color] }}
      >
        <MaterialCommunityIcons name={icon as any} size={14} color="#FFFFFF" />
      </View>

      {/* Card */}
      <View className="bg-surface-card p-6 rounded-2xl border border-outline/10">
        <View className="flex-row justify-between items-start mb-4">
          <View className="flex-1 mr-4">
            <Text className="font-sans-bold text-xxs text-charcoal uppercase tracking-widest mb-1">
              {date}
            </Text>
            <Text className="font-sans-xbold text-xl text-charcoal">{title}</Text>
          </View>
          <Text className="font-sans-bold text-lg text-charcoal">{cost}</Text>
        </View>

        {tags && tags.length > 0 && (
          <View className="flex-row flex-wrap gap-2 mb-4">
            {tags.map((tag) => (
              <View
                key={tag.label}
                className={`px-3 py-1 rounded-full ${
                  tag.danger ? 'bg-danger-surface' : 'bg-surface-low'
                }`}
              >
                <Text
                  className={`font-sans-bold text-xxs uppercase tracking-widest ${
                    tag.danger ? 'text-danger' : 'text-charcoal'
                  }`}
                >
                  {tag.label}
                </Text>
              </View>
            ))}
          </View>
        )}

        {quote && (
          <View className="bg-sand/10 rounded-xl p-3">
            <Text className="text-sm text-sand italic font-sans-medium">{quote}</Text>
          </View>
        )}

        {imageUri && (
          <Image
            source={{ uri: imageUri }}
            className="w-full h-32 rounded-xl mt-2"
            resizeMode="cover"
          />
        )}
      </View>
    </View>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/mobile/components/ui/timeline-entry.tsx
git commit -m "feat(mobile): add TimelineEntry component"
```

---

### Task 8: Build ProfileHero

**Files:**
- Create: `apps/mobile/components/ui/profile-hero.tsx`

- [ ] **Step 1: Create ProfileHero component**

```tsx
import { View, Text, Image } from 'react-native';

interface ProfileHeroProps {
  name: string;
  role: string;
  avatarUri?: string;
}

export function ProfileHero({ name, role, avatarUri }: ProfileHeroProps) {
  return (
    <View className="relative overflow-hidden bg-surface-low rounded-3xl p-8 items-center">
      {/* Decorative circles */}
      <View
        className="absolute rounded-full bg-yellow/10"
        style={{ width: 192, height: 192, top: -48, right: -48 }}
      />
      <View
        className="absolute rounded-full bg-sand/10"
        style={{ width: 192, height: 192, bottom: -48, left: -48 }}
      />

      {/* Content */}
      <View className="z-10 items-center">
        <View className="w-24 h-24 rounded-full overflow-hidden mb-4" style={{ borderWidth: 4, borderColor: '#FFFFFF' }}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} className="w-full h-full" />
          ) : (
            <View className="w-full h-full bg-sand/30" />
          )}
        </View>
        <Text className="font-sans-xbold text-2xl text-charcoal mb-1">{name}</Text>
        <View className="bg-charcoal px-3 py-1 rounded-full">
          <Text className="font-sans-bold text-xxs text-white uppercase tracking-wide-1">
            {role}
          </Text>
        </View>
      </View>
    </View>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/mobile/components/ui/profile-hero.tsx
git commit -m "feat(mobile): add ProfileHero component"
```

---

### Task 9: Build BikeImageCard

**Files:**
- Create: `apps/mobile/components/bike/bike-image-card.tsx`

- [ ] **Step 1: Create BikeImageCard component**

```tsx
import { View, Text, Image, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface BikeImageCardProps {
  make: string;
  model: string;
  imageUri?: string;
  status: 'ready' | 'overdue';
  battery?: { value: number; status: string };
  tires?: { value: number; unit: string; status?: string };
  onPress: () => void;
  onMenuPress?: () => void;
}

export function BikeImageCard({
  make,
  model,
  imageUri,
  status,
  battery,
  tires,
  onPress,
  onMenuPress,
}: BikeImageCardProps) {
  const isOverdue = status === 'overdue';

  return (
    <Pressable
      onPress={onPress}
      className="bg-surface-card rounded-3xl overflow-hidden border border-charcoal/5"
      style={({ pressed }) => [
        pressed && { transform: [{ scale: 0.98 }], opacity: 0.95 },
        { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
      ]}
    >
      {/* Hero Image */}
      <View className="relative h-56 overflow-hidden">
        {imageUri ? (
          <Image source={{ uri: imageUri }} className="w-full h-full" resizeMode="cover" />
        ) : (
          <View className="w-full h-full bg-surface-low items-center justify-center">
            <MaterialCommunityIcons name="motorbike" size={48} color="#D0C5BA" />
          </View>
        )}
        {/* Status Badge */}
        <View className="absolute top-4 left-4">
          <View className={`px-3 py-1 rounded-full ${isOverdue ? 'bg-danger' : 'bg-yellow'}`}>
            <Text className={`font-sans-xbold text-xxs uppercase tracking-widest ${isOverdue ? 'text-white' : 'text-charcoal'}`}>
              {isOverdue ? 'Service Overdue' : 'Ready to Ride'}
            </Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <View className="p-6">
        <View className="flex-row justify-between items-start mb-4">
          <View>
            <Text className="font-sans-bold text-xxs text-sand uppercase tracking-widest mb-1">
              {make}
            </Text>
            <Text className="font-sans-xbold text-xl text-charcoal">{model}</Text>
          </View>
          {onMenuPress && (
            <Pressable onPress={onMenuPress} hitSlop={8} className="active:opacity-70">
              <MaterialCommunityIcons name="dots-vertical" size={20} color="#D0C5BA" />
            </Pressable>
          )}
        </View>

        {/* Stats Row */}
        <View className="flex-row gap-3">
          {battery && (
            <View className="flex-1 bg-surface-low/50 px-4 py-3 rounded-2xl">
              <Text className="font-sans-bold text-xxs text-sand uppercase mb-1">Battery</Text>
              <Text className="font-sans-bold text-sm text-charcoal">
                {battery.value}%{' '}
                <Text className={`text-xxs ${battery.value < 20 ? 'text-danger' : 'text-success'}`}>
                  {battery.status}
                </Text>
              </Text>
            </View>
          )}
          {tires && (
            <View className="flex-1 bg-surface-low/50 px-4 py-3 rounded-2xl">
              <Text className="font-sans-bold text-xxs text-sand uppercase mb-1">Tires</Text>
              <Text className="font-sans-bold text-sm text-charcoal">
                {tires.value}{' '}
                <Text className={`text-xxs font-sans-medium ${tires.status === 'Low' ? 'text-danger' : 'text-charcoal/50'}`}>
                  {tires.unit}
                </Text>
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/mobile/components/bike/bike-image-card.tsx
git commit -m "feat(mobile): add BikeImageCard component with hero image and stats"
```

---

### Task 10: Update existing shared components

**Files:**
- Modify: `apps/mobile/components/ui/hero-card.tsx`
- Modify: `apps/mobile/components/ui/screen-header.tsx`
- Modify: `apps/mobile/components/ui/filter-chips.tsx`
- Modify: `apps/mobile/components/ui/progress-bar.tsx`
- Modify: `apps/mobile/components/ui/list-card.tsx`
- Modify: `apps/mobile/components/ui/pill-badge.tsx`
- Modify: `apps/mobile/components/ui/status-card.tsx`
- Modify: `apps/mobile/components/ui/safe-screen.tsx`
- Modify: `apps/mobile/components/ui/section.tsx`
- Modify: `apps/mobile/components/ui/empty-state.tsx`
- Modify: `apps/mobile/components/ui/text-field.tsx`
- Modify: `apps/mobile/components/ui/bottom-sheet.tsx`

This is a large batch. Each component gets token color updates + any structural changes from the spec. Update them all in sequence.

- [ ] **Step 1: Update hero-card.tsx**

```tsx
import { View, ViewProps } from 'react-native';

interface HeroCardProps {
  children: React.ReactNode;
  className?: string;
}

export function HeroCard({ children, className = '' }: HeroCardProps) {
  return (
    <View
      className={`bg-charcoal rounded-3xl p-8 mb-6 overflow-hidden ${className}`}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 25 },
        shadowOpacity: 0.3,
        shadowRadius: 50,
        elevation: 12,
      }}
    >
      {children}
    </View>
  );
}
```

- [ ] **Step 2: Update screen-header.tsx**

```tsx
import { View, Text, Pressable } from 'react-native';

interface ScreenHeaderProps {
  title: string;
  label?: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
  onTitlePress?: () => void;
  size?: 'lg' | 'md';
}

export function ScreenHeader({ title, label, subtitle, rightAction, onTitlePress, size = 'lg' }: ScreenHeaderProps) {
  const titleSize = size === 'lg' ? 'text-4xl' : 'text-3xl';

  return (
    <View className="mb-8">
      {label && (
        <Text className="font-sans-bold text-xxs text-charcoal uppercase tracking-wide-2 mb-2">
          {label}
        </Text>
      )}
      <View className="flex-row items-center justify-between">
        <Pressable onPress={onTitlePress} disabled={!onTitlePress}>
          <Text className={`${titleSize} font-sans-xbold text-charcoal tracking-tight`}>{title}</Text>
        </Pressable>
        {rightAction}
      </View>
      {subtitle && (
        <Text className="font-sans-bold text-xxs text-sand uppercase tracking-wide-1 mt-1">
          {subtitle}
        </Text>
      )}
    </View>
  );
}
```

- [ ] **Step 3: Update filter-chips.tsx**

```tsx
import { ScrollView, View, Pressable, Text } from 'react-native';

interface FilterChipsProps {
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
  wrap?: boolean;
}

export function FilterChips({ options, selected, onSelect, wrap = false }: FilterChipsProps) {
  const chips = options.map((option) => {
    const isSelected = option === selected;
    return (
      <Pressable
        key={option}
        onPress={() => onSelect(option)}
        className={`px-6 py-2.5 rounded-full ${
          isSelected ? 'bg-charcoal' : 'bg-surface-low'
        }`}
      >
        <Text
          className={`font-sans-bold text-sm ${
            isSelected ? 'text-white' : 'text-sand'
          }`}
        >
          {option}
        </Text>
      </Pressable>
    );
  });

  if (wrap) {
    return <View className="flex-row flex-wrap gap-3">{chips}</View>;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 12, paddingHorizontal: 4, paddingVertical: 4 }}
    >
      {chips}
    </ScrollView>
  );
}
```

- [ ] **Step 4: Update progress-bar.tsx**

```tsx
import { View, Text } from 'react-native';

type ProgressColor = 'yellow' | 'sand' | 'danger' | 'charcoal';

interface ProgressBarProps {
  value: number; // 0-100
  color?: ProgressColor;
  label?: string;
  statusText?: string;
  size?: 'sm' | 'md';
}

const colorMap: Record<ProgressColor, string> = {
  yellow: 'bg-yellow',
  sand: 'bg-sand',
  danger: 'bg-danger',
  charcoal: 'bg-charcoal',
};

export function ProgressBar({
  value,
  color = 'yellow',
  label,
  statusText,
  size = 'sm',
}: ProgressBarProps) {
  const height = size === 'md' ? 'h-3' : 'h-2';

  return (
    <View>
      {(label || statusText) && (
        <View className="flex-row justify-between items-end mb-2">
          {label && (
            <Text className="font-sans-bold text-sm text-charcoal uppercase tracking-wide-1">
              {label}
            </Text>
          )}
          {statusText && (
            <Text className={`font-sans-bold text-xs ${color === 'danger' ? 'text-danger' : color === 'sand' ? 'text-sand' : 'text-yellow'}`}>
              {statusText}
            </Text>
          )}
        </View>
      )}
      <View className={`${height} w-full bg-surface-low rounded-full overflow-hidden`}>
        <View
          className={`h-full ${colorMap[color]} rounded-full`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </View>
    </View>
  );
}
```

- [ ] **Step 5: Update list-card.tsx**

```tsx
import { View, Text, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ListCardProps {
  icon?: string;
  iconBg?: string;
  iconColor?: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  children?: React.ReactNode;
}

export function ListCard({
  icon,
  iconBg = 'bg-surface-low',
  iconColor = '#1E1E1E',
  title,
  subtitle,
  onPress,
  children,
}: ListCardProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      className="bg-surface-card rounded-2xl p-5 flex-row items-center justify-between active:bg-surface-low"
    >
      <View className="flex-row items-center gap-4 flex-1">
        {icon && (
          <View className={`w-12 h-12 rounded-xl ${iconBg} items-center justify-center`}>
            <MaterialCommunityIcons name={icon as any} size={22} color={iconColor} />
          </View>
        )}
        <View className="flex-1">
          <Text className="font-sans-bold text-sm text-charcoal">{title}</Text>
          {subtitle && (
            <Text className="font-sans-medium text-xs text-outline mt-0.5">{subtitle}</Text>
          )}
          {children}
        </View>
      </View>
      {onPress && (
        <MaterialCommunityIcons name="chevron-right" size={20} color="#D0C5BA" />
      )}
    </Pressable>
  );
}
```

- [ ] **Step 6: Update pill-badge.tsx**

```tsx
import { View, Text } from 'react-native';

interface PillBadgeProps {
  label: string;
  variant: 'yellow' | 'danger' | 'charcoal' | 'surface';
}

const variantStyles: Record<string, { bg: string; text: string }> = {
  yellow: { bg: 'bg-yellow', text: 'text-charcoal' },
  danger: { bg: 'bg-danger', text: 'text-white' },
  charcoal: { bg: 'bg-charcoal', text: 'text-white' },
  surface: { bg: 'bg-surface-card', text: 'text-charcoal' },
};

export function PillBadge({ label, variant }: PillBadgeProps) {
  const styles = variantStyles[variant];
  return (
    <View className={`${styles.bg} self-start px-3 py-1 rounded-full`}>
      <Text className={`font-sans-xbold text-xxs uppercase tracking-widest ${styles.text}`}>
        {label}
      </Text>
    </View>
  );
}
```

- [ ] **Step 7: Update status-card.tsx**

```tsx
import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PillBadge } from './pill-badge';

interface StatusCardProps {
  icon: string;
  iconColor: string;
  title: string;
  status: string;
  statusVariant: 'yellow' | 'danger' | 'surface';
  bgClass?: string;
}

export function StatusCard({
  icon,
  iconColor,
  title,
  status,
  statusVariant,
  bgClass = 'bg-surface-low',
}: StatusCardProps) {
  return (
    <View className={`${bgClass} rounded-3xl p-6 flex-1 aspect-square justify-between`}>
      <View>
        <MaterialCommunityIcons
          name={icon as any}
          size={28}
          color={iconColor}
          style={{ marginBottom: 16 }}
        />
        <Text className="font-sans-bold text-lg text-charcoal leading-tight">{title}</Text>
      </View>
      <PillBadge label={status} variant={statusVariant} />
    </View>
  );
}
```

- [ ] **Step 8: Update safe-screen.tsx**

```tsx
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopAppBar } from './top-app-bar';

interface SafeScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  showAppBar?: boolean;
  className?: string;
}

export function SafeScreen({ children, scrollable = true, showAppBar = true, className = '' }: SafeScreenProps) {
  return (
    <SafeAreaView className={`flex-1 bg-surface ${className}`}>
      {showAppBar && <TopAppBar />}
      {scrollable ? (
        <ScrollView
          contentContainerStyle={{ paddingTop: 80, paddingBottom: 128, paddingHorizontal: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View className="flex-1 px-6" style={{ paddingTop: 80 }}>
          {children}
        </View>
      )}
    </SafeAreaView>
  );
}
```

- [ ] **Step 9: Update section.tsx**

```tsx
import { View, Text, Pressable } from 'react-native';

interface SectionProps {
  label?: string;
  action?: string;
  onAction?: () => void;
  children: React.ReactNode;
}

export function Section({ label, action, onAction, children }: SectionProps) {
  return (
    <View className="mb-6">
      {(label || action) && (
        <View className="flex-row items-center justify-between mb-4">
          {label && (
            <Text className="font-sans-bold text-xl text-charcoal tracking-tight">{label}</Text>
          )}
          {action && (
            <Pressable onPress={onAction}>
              <Text className="font-sans-bold text-sm text-charcoal">{action}</Text>
            </Pressable>
          )}
        </View>
      )}
      {children}
    </View>
  );
}
```

- [ ] **Step 10: Update empty-state.tsx**

```tsx
import { View, Text, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <Pressable
      onPress={onAction}
      disabled={!onAction}
      className="h-40 border-2 border-dashed border-sand/40 rounded-3xl items-center justify-center gap-2 active:border-yellow"
    >
      <View className="w-12 h-12 rounded-full bg-sand/10 items-center justify-center">
        <MaterialCommunityIcons name="plus" size={24} color="#C7B299" />
      </View>
      <Text className="font-sans-bold text-sm text-sand tracking-wide-1">
        {actionLabel || title}
      </Text>
      {description && (
        <Text className="font-sans-medium text-xs text-sand/70 text-center px-6">
          {description}
        </Text>
      )}
    </Pressable>
  );
}
```

- [ ] **Step 11: Update text-field.tsx**

```tsx
import { View, Text, TextInput, TextInputProps } from 'react-native';

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
  prefix?: string;
}

export function TextField({ label, error, prefix, ...props }: TextFieldProps) {
  return (
    <View className="bg-surface-low p-6 rounded-xl">
      <Text className="font-sans-bold text-xxs text-sand uppercase tracking-wide-1 mb-2">
        {label}
      </Text>
      <View className="flex-row items-end gap-2">
        {prefix && (
          <Text className="font-sans-bold text-xl text-charcoal">{prefix}</Text>
        )}
        <TextInput
          className="flex-1 text-2xl font-sans-bold text-charcoal p-0"
          placeholderTextColor="#D0C5BA"
          {...props}
        />
      </View>
      {error && <Text className="text-xs text-danger font-sans mt-2">{error}</Text>}
    </View>
  );
}
```

- [ ] **Step 12: Update bottom-sheet.tsx**

Token-only update: replace `bg-surface` → `bg-surface-card`, `bg-surface-muted` → `bg-surface-low`, `text-text-primary` → `text-charcoal`. Keep all animation logic unchanged.

- [ ] **Step 13: Commit all updated components**

```bash
git add apps/mobile/components/ui/
git commit -m "feat(mobile): update all shared components to Precision Atelier tokens"
```

---

### Task 11: Rebuild FloatingTabBar and update tab layout

**Files:**
- Modify: `apps/mobile/components/ui/floating-tab-bar.tsx`
- Modify: `apps/mobile/app/(tabs)/_layout.tsx`

- [ ] **Step 1: Rewrite floating-tab-bar.tsx**

```tsx
import { View, Pressable, Keyboard } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useState, useEffect } from 'react';

const TAB_ICONS: Record<string, string> = {
  index: 'wrench',
  'garage/index': 'motorbike',
  agent: 'microphone',
  log: 'chart-bar',
  settings: 'cog',
};

interface FloatingTabBarProps extends BottomTabBarProps {
  onAgentPress?: () => void;
}

export function FloatingTabBar({ state, navigation, onAgentPress }: FloatingTabBarProps) {
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  if (keyboardVisible) return null;

  return (
    <View className="absolute bottom-6 left-0 right-0 items-center">
      <BlurView
        intensity={80}
        tint="dark"
        className="w-[90%] max-w-md rounded-3xl overflow-hidden"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 20 },
          shadowOpacity: 0.1,
          shadowRadius: 40,
          elevation: 10,
        }}
      >
        <View className="flex-row items-center justify-between px-8 py-3">
          {state.routes.map((route, index) => {
            const isFocused = state.index === index;
            const isCenter = route.name === 'agent';
            const iconName = TAB_ICONS[route.name] || 'help-circle';

            const onPress = () => {
              if (isCenter) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onAgentPress?.();
                return;
              }
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            if (isCenter) {
              return (
                <Pressable
                  key={route.key}
                  onPress={onPress}
                  className="bg-yellow rounded-full p-3 active:opacity-80"
                  style={{ transform: [{ scale: 1.1 }] }}
                >
                  <MaterialCommunityIcons name={iconName as any} size={24} color="#1E1E1E" />
                </Pressable>
              );
            }

            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                className="p-3 active:opacity-70"
              >
                <MaterialCommunityIcons
                  name={iconName as any}
                  size={24}
                  color={isFocused ? '#F2D06B' : '#C7B299'}
                />
              </Pressable>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}
```

- [ ] **Step 2: Update (tabs)/_layout.tsx with new tab order**

```tsx
import { Tabs } from 'expo-router';
import { useState } from 'react';
import { FloatingTabBar } from '../../components/ui/floating-tab-bar';
import { BottomSheet } from '../../components/ui/bottom-sheet';

export default function TabLayout() {
  const [agentVisible, setAgentVisible] = useState(false);

  return (
    <>
      <Tabs
        screenOptions={{ headerShown: false }}
        tabBar={(props) => (
          <FloatingTabBar {...props} onAgentPress={() => setAgentVisible(true)} />
        )}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="garage/index" />
        <Tabs.Screen name="agent" options={{ href: null }} />
        <Tabs.Screen name="log" />
        <Tabs.Screen name="settings" />
        {/* Hidden routes */}
        <Tabs.Screen name="garage/add" options={{ href: null }} />
        <Tabs.Screen name="garage/[id]" options={{ href: null }} />
        <Tabs.Screen name="garage/[id]/index" options={{ href: null }} />
        <Tabs.Screen name="garage/[id]/edit" options={{ href: null }} />
        <Tabs.Screen name="garage/[id]/services" options={{ href: null }} />
      </Tabs>
      <BottomSheet
        visible={agentVisible}
        onClose={() => setAgentVisible(false)}
        title="Voice Agent"
      >
        {/* Agent content placeholder */}
      </BottomSheet>
    </>
  );
}
```

Note: The agent tab has `href: null` so it never navigates. The center FAB triggers `onAgentPress` which opens the BottomSheet.

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/components/ui/floating-tab-bar.tsx apps/mobile/app/\(tabs\)/_layout.tsx
git commit -m "feat(mobile): rebuild FloatingTabBar with center Agent FAB and reorder tabs"
```

---

## Phase 3: Screens

### Task 12: Dashboard screen

**Files:**
- Modify: `apps/mobile/app/(tabs)/index.tsx`

- [ ] **Step 1: Rewrite Dashboard screen**

Reference: `stitch/modern_minimalist_mechanic/` (see spec Section 4.1)

The dashboard shows:
1. ScreenHeader with label "DASHBOARD OVERVIEW" and title "Welcome back, {name}!"
2. HeroCard with total mileage, progress bar for next service
3. Compliance grid (2 StatusCards in a row)
4. Section "Recent Services" with ListCard rows
5. Precision badge footer

Rewrite `index.tsx` using `SafeScreen`, `ScreenHeader` (with `label` prop), `HeroCard`, `ProgressBar`, `StatusCard`, `Section`, `ListCard`, and `PillBadge`.

Use the existing `useBikes` hook for data. Keep the empty state / loading logic but update components. Decorative circle in HeroCard: absolute View, bg-yellow/10, width 192, rounded-full, top -40, right -40.

- [ ] **Step 2: Verify it renders**

```bash
cd apps/mobile && npx expo start
```

Open in simulator, check Dashboard tab matches `stitch/modern_minimalist_mechanic/`.

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/app/\(tabs\)/index.tsx
git commit -m "feat(mobile): redesign Dashboard to Precision Atelier style"
```

---

### Task 13: My Garage screen

**Files:**
- Modify: `apps/mobile/app/(tabs)/garage/index.tsx`

- [ ] **Step 1: Rewrite My Garage screen**

Reference: `stitch/home_modern_minimalist/` (see spec Section 4.2)

The garage shows:
1. ScreenHeader with title "My Garage" and subtitle "Your Fleet • {count} Machines"
2. BikeImageCard list (gap-6)
3. EmptyState "Expand Your Fleet" button → navigates to `garage/add`
4. Fleet Integrity summary: 3-column grid (Active, Logs, Alerts)

Use `SafeScreen`, `ScreenHeader` (with `subtitle`), `BikeImageCard`, `EmptyState`, `Skeleton`.

- [ ] **Step 2: Verify it renders**

Check Garage tab matches `stitch/home_modern_minimalist/`.

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/app/\(tabs\)/garage/index.tsx
git commit -m "feat(mobile): redesign My Garage with BikeImageCards"
```

---

### Task 14: Bike Detail screen

**Files:**
- Modify: `apps/mobile/app/(tabs)/garage/[id]/index.tsx`

- [ ] **Step 1: Rewrite Bike Detail screen**

Reference: `stitch/bike_profile_modern_minimalist/` (see spec Section 4.3)

The detail shows:
1. Hero image (full-bleed, 400px height) with LinearGradient overlay, status badge, bike name
2. Stats Bento Grid: 2-column grid of BentoStat (first has accent)
3. Vitals section: ProgressBar with label/statusText for oil, tires, chain
4. Section "Service History" with ListCard rows
5. PrimaryButton "Start Ride Track"

Use `SafeScreen` (with `showAppBar` since hero is full-bleed — consider custom layout), `BentoStat`, `ProgressBar`, `Section`, `ListCard`, `PrimaryButton`, `LinearGradient` from expo-linear-gradient, `PillBadge`.

Note: This screen needs a custom scroll layout since the hero image goes full-bleed behind the TopAppBar. Use ScrollView directly with TopAppBar overlaid.

- [ ] **Step 2: Verify it renders**

Navigate to a bike detail, check it matches `stitch/bike_profile_modern_minimalist/`.

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/app/\(tabs\)/garage/\[id\]/index.tsx
git commit -m "feat(mobile): redesign Bike Detail with hero image and vitals"
```

---

### Task 15: New Service Log screen

**Files:**
- Modify: `apps/mobile/app/(tabs)/garage/[id]/services.tsx`

- [ ] **Step 1: Rewrite Service Log screen**

Reference: `stitch/service_entry_modern_minimalist/` (see spec Section 4.4)

The form shows:
1. Header with version badge pill, "New Service Log" title, bike name subtitle
2. FilterChips with `wrap={true}` for service type selection
3. Bento form grid (2-column): TextField for mileage, date picker, cost (with decorative circle), service ID
4. Multiline TextInput for notes
5. Evidence section: photo grid + upload placeholder
6. PrimaryButton "Save Log"

Use `SafeScreen`, `ScreenHeader`, `FilterChips`, `TextField`, `PrimaryButton`, `PillBadge`.

- [ ] **Step 2: Verify it renders**

Navigate to a bike → service history. Check it matches `stitch/service_entry_modern_minimalist/`.

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/app/\(tabs\)/garage/\[id\]/services.tsx
git commit -m "feat(mobile): redesign Service Log form with bento grid"
```

---

### Task 16: Service History screen

**Files:**
- Modify: `apps/mobile/app/(tabs)/log.tsx`

- [ ] **Step 1: Rewrite Service History screen**

Reference: `stitch/log_modern_minimalist/` (see spec Section 4.5)

The history shows:
1. Header: "Service History" title + Total Spend badge (yellow bg)
2. FilterChips with `wrap={false}` (horizontal scroll)
3. Timeline: vertical line (absolute, left 16px) + TimelineEntry components

Use `SafeScreen`, `ScreenHeader` (with `size="md"` for `text-3xl`), `FilterChips`, `TimelineEntry`, `PillBadge`.

Replace the current `Redirect` with a full screen implementation.

- [ ] **Step 2: Verify it renders**

Check Log tab matches `stitch/log_modern_minimalist/`.

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/app/\(tabs\)/log.tsx
git commit -m "feat(mobile): redesign Service History with timeline view"
```

---

### Task 17: Settings screen

**Files:**
- Modify: `apps/mobile/app/(tabs)/settings.tsx`

- [ ] **Step 1: Rewrite Settings screen**

Reference: `stitch/settings_modern_minimalist/` (see spec Section 4.6)

The settings shows:
1. ProfileHero with name, role, avatar
2. "Account Settings" section label + grouped ListCard rows (Personal Info, Security, Subscription)
3. "Appearance" section with dark mode toggle (disabled) + accent color circles
4. PrimaryButton "Log Out"
5. Version footer

Use `SafeScreen`, `ProfileHero`, `ListCard`, `PrimaryButton`.

**RN adaptation note:** The spec's accent color selector uses `ring-2 ring-offset-2` which doesn't work in NativeWind. Use `style={{ borderWidth: 2, borderColor: '#F2D06B', margin: 2 }}` on the selected circle instead. Use `ScreenHeader` with `size="md"` if the title needs to be smaller than 4xl.

- [ ] **Step 2: Verify it renders**

Check Settings tab matches `stitch/settings_modern_minimalist/`.

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/app/\(tabs\)/settings.tsx
git commit -m "feat(mobile): redesign Settings with ProfileHero and grouped options"
```

---

### Task 18: Agent placeholder

**Files:**
- Modify: `apps/mobile/app/(tabs)/agent.tsx`

- [ ] **Step 1: Replace agent.tsx with empty placeholder**

```tsx
import { View } from 'react-native';

export default function AgentScreen() {
  return <View />;
}
```

This route exists only to satisfy Expo Router. The actual agent is triggered via the center FAB → BottomSheet (handled in `_layout.tsx`).

- [ ] **Step 2: Commit**

```bash
git add apps/mobile/app/\(tabs\)/agent.tsx
git commit -m "feat(mobile): replace agent screen with empty placeholder for FAB trigger"
```

---

## Phase 4: Cleanup

### Task 19: Remove deprecated components and Lucide

**Files:**
- Delete: `apps/mobile/components/ui/status-dot.tsx`
- Delete: `apps/mobile/components/ui/alert-banner.tsx`
- Delete: `apps/mobile/components/ui/metric-display.tsx`
- Delete: `apps/mobile/components/bike/bike-card.tsx`
- Modify: `apps/mobile/package.json` (remove lucide-react-native)

- [ ] **Step 1: Delete deprecated component files**

```bash
rm apps/mobile/components/ui/status-dot.tsx
rm apps/mobile/components/ui/alert-banner.tsx
rm apps/mobile/components/ui/metric-display.tsx
rm apps/mobile/components/bike/bike-card.tsx
```

- [ ] **Step 2: Remove lucide-react-native dependency**

```bash
cd apps/mobile && npm uninstall lucide-react-native
```

- [ ] **Step 3: Grep for any remaining Lucide imports**

```bash
grep -r "lucide-react-native" apps/mobile/app/ apps/mobile/components/ --include="*.tsx" --include="*.ts"
```

Expected: no matches. If any remain, update those files to use MaterialCommunityIcons.

- [ ] **Step 4: Grep for old token names that should have been migrated**

```bash
grep -rE "bg-background|bg-hero|text-text-primary|text-text-secondary|text-text-muted|border-border|bg-surface-muted|text-hero-text|text-hero-muted|bg-accent|text-accent|bg-warning" apps/mobile/app/ apps/mobile/components/ --include="*.tsx" --include="*.ts"
```

Expected: no matches. If any remain, update to new token names per spec migration mapping.

- [ ] **Step 5: Commit**

```bash
git add -A apps/mobile/
git commit -m "chore(mobile): remove deprecated components and lucide-react-native"
```

---

### Task 20: Update unchanged components with new tokens

**Files:**
- Modify: `apps/mobile/components/ui/select-field.tsx`
- Modify: `apps/mobile/components/ui/date-field.tsx`
- Modify: `apps/mobile/components/ui/confirmation-dialog.tsx`
- Modify: `apps/mobile/components/ui/skeleton.tsx`
- Modify: `apps/mobile/components/ui/toast.tsx`
- Modify: `apps/mobile/components/bike/bike-details-card.tsx`
- Modify: `apps/mobile/components/bike/bike-form.tsx`
- Modify: `apps/mobile/components/welcome-screen.tsx`
- Modify: `apps/mobile/app/(auth)/login.tsx`
- Modify: `apps/mobile/app/(auth)/register.tsx`
- Modify: `apps/mobile/app/(auth)/_layout.tsx`
- Modify: `apps/mobile/app/_layout.tsx`
- Modify: `apps/mobile/app/+not-found.tsx`
- Modify: `apps/mobile/components/illustrations/motorcycle.tsx`
- Modify: `apps/mobile/app/(tabs)/garage/add.tsx`
- Modify: `apps/mobile/app/(tabs)/garage/[id]/edit.tsx`

- [ ] **Step 1: Find-and-replace old tokens in each file**

Apply the token migration mapping from spec Section 2.1 to each file:
- `bg-background` → `bg-surface`
- `bg-surface` (when used for cards) → `bg-surface-card`
- `bg-surface-muted` → `bg-surface-low`
- `text-text-primary` → `text-charcoal`
- `text-text-secondary` → `text-sand`
- `text-text-muted` → `text-sand`
- `border-border` / `border-border-subtle` → `border-outline`
- `bg-hero` → `bg-charcoal`
- `text-hero-text` → `text-white`
- `text-hero-muted` → `text-sand`
- `bg-accent` → `bg-yellow`
- `text-accent` → `text-yellow`
- `bg-warning` → `bg-yellow`
- `text-warning` → `text-yellow`
- `bg-warning-surface` → `bg-yellow/10`
- `bg-danger-surface` → `bg-danger-surface` (unchanged)
- `bg-success-surface` → `bg-success/10`

Also replace any `lucide-react-native` imports with `MaterialCommunityIcons` equivalents.

- [ ] **Step 2: Verify no old tokens remain**

Re-run the grep from Task 19 Step 4.

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/components/ apps/mobile/app/
git commit -m "chore(mobile): migrate remaining components to new design tokens"
```

---

### Task 21: Final verification

- [ ] **Step 1: Run TypeScript type check**

```bash
cd apps/mobile && npx tsc --noEmit
```

Fix any type errors.

- [ ] **Step 2: Run existing tests**

```bash
cd apps/mobile && npx jest
```

Fix any test failures (theme.test.ts may need updating for the new font).

- [ ] **Step 3: Visual verification against stitch references**

Open each tab in the simulator and compare to corresponding `stitch/` HTML:
- Dashboard → `stitch/modern_minimalist_mechanic/screen.png`
- Garage → `stitch/home_modern_minimalist/screen.png`
- Bike Detail → `stitch/bike_profile_modern_minimalist/screen.png`
- Service Log → `stitch/service_entry_modern_minimalist/screen.png`
- Service History → `stitch/log_modern_minimalist/screen.png`
- Settings → `stitch/settings_modern_minimalist/screen.png`

- [ ] **Step 4: Commit any final fixes**

```bash
git add -A apps/mobile/
git commit -m "chore(mobile): final verification fixes for Precision Atelier redesign"
```
