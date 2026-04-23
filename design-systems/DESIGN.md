# Kickstand Design System — Atelier

Editorial-technical design language for a bike/motorcycle service-tracking app.
Warm off-white canvas, near-black ink, burnt-orange accent. Serif display + sans body + mono meta.
Mobile-first (402×874 iPhone class). Hairlines and whitespace instead of heavy cards or shadows.

---

## 1. Brand & tone

- **Feel**: mechanical precision meets editorial sophistication. Controlled, considered, calm.
- **Voice**: field-journal terse. Someone who logs things in a notebook, not marketing copy.
- **Second person** for prompts ("you"). Third-person objective for data. Never "I".
- **No emoji, anywhere.** No exclamation points. No "Let's…", "Ready to…", "soon", "in a bit".
- **Casing**: Title Case for section headers and screen names. Sentence case for body. `UPPERCASE MONO` for eyebrows, meta labels, unit markers.
- **Units** always abbreviated and smaller/muted vs. the number: `km`, `D` (days), `S$`.
- **Specificity wins**: `5W-40 · Motul · 3.2L` > `Oil change`. `12,400 km` > `recently`.
- **Time phrasing**: relative for recent ("4 days ago"), absolute for scheduled ("10 May").
- **CTAs**: imperative, short. `Save entry`, `Log service`, `Scan receipt instead`.
- **No filler**. Empty sections stay empty or collapse.

Examples:

> *Hero*: `NEXT SERVICE · ENGINE OIL` → `18 DAYS` → `OR 420 KM`
> *Callout*: `SEASONAL · MONSOON` → "Lube the chain more often" → "Wet weather strips lubricant fast. Every 200km recommended."
> *Log row*: "Engine oil change" → `5W-40 · MOTUL · 3.2L` → `S$85`

---

## 2. Color

Warm off-white, never pure white. Ink is near-black, never pure black. Accent is warm yellow — used sparingly, one primary action per screen.

### Studio Editorial (default, light)

| Token | Value | Role |
|---|---|---|
| `--bg` | `#F4F2EC` | canvas |
| `--bg-2` | `#EBE8DF` | recessed surface |
| `--surface` | `#FFFFFF` | popover / modal card |
| `--ink` | `#1A1A1A` | primary text |
| `--ink-2` | `#2E2B27` | secondary ink |
| `--muted` | `#7A756C` | meta / captions |
| `--hairline` | `rgba(26,26,26,0.09)` | light divider inside content |
| `--hairline-2` | `rgba(26,26,26,0.16)` | card border / field outline |
| `--accent` | `#F2D06B` | warm yellow — primary action, key highlights |
| `--danger` | `#DC2626` | rare; not an alert-heavy product |
| `--success` | `#22C55E` | rare |

### Rules

- Layer with surfaces (`bg → bg-2 → surface`), **not** shadows.
- Separate content blocks with **hairlines + whitespace**, not drop shadows or heavy card chrome.
- Accent (yellow) is precious — one primary call-to-action per screen. On dark surfaces it's a fill; on light surfaces it's typically a short stroke, pill, or highlight band, never a large flood.

---

## 3. Typography

Three families, each with a dedicated role. No font weights below 400. Plus Jakarta Sans is already in the Expo app; Instrument Serif + JetBrains Mono are the editorial/numeric layers.

| Family | Usage |
|---|---|
| **Instrument Serif** 400 | big numbers, one headline per screen, empty-state quotes. Negative tracking (`-0.01em`) above 32px. |
| **Plus Jakarta Sans** 400 / 500 / 600 / 700 | body (400), emphasis (500), row titles (600), section headers (700). |
| **JetBrains Mono** 400 / 500 | eyebrows (10px, 0.14em tracking, uppercase), meta rows, unit labels, tabular numbers. |

### Recipes

| Class | Rule |
|---|---|
| `ks-eyebrow` | mono · 10px · `0.14em` tracking · uppercase · `--muted` · 500 |
| `ks-display` | serif · 400 · `-0.01em` tracking · line-height 1.02 |
| `ks-big-number` | serif · 400 · 72px · line-height 1 · `-0.03em` tracking · `tabular-nums` |
| `ks-h1` | sans · 28px · 700 · `-0.02em` · line-height 1.1 |
| `ks-h2` | sans · 20px · 600 · `-0.01em` · line-height 1.2 |
| `ks-section-title` | sans · 16px · 600 · `-0.01em` |
| `ks-body` | sans · 14px · 400 · line-height 1.45 · `--ink` |
| `ks-meta` | mono · 11px · `0.04em` tracking · `--muted` |
| `ks-tabular` | mono · `tabular-nums` |

### The eyebrow is structural

Every section starts with a short uppercase mono label that says what the block is. **It replaces card chrome** — you don't also need a heavy border or shadow on that section.

---

## 4. Spacing & rhythm

Base unit **4px**. Common values: **8, 12, 16, 20, 24, 32**.

- Mobile gutters: **20px** edge-to-content.
- Sections stack with **24–32px** between them — no dividers unless grouping needs clarification.
- Content scrolls with **110px bottom padding** so the floating tab bar never occludes it.

---

## 5. Corner radii

| Token | Value | Use |
|---|---|---|
| `--r-card` | 14px | standard cards, form fields |
| `--r-card-lg` | 18px | feature cards (upcoming service tiles) |
| `--r-hero` | 22px | hero blocks, tab bar pill |
| `--r-phone` | 28px | phone frame, modal sheet |
| `--r-chip` | 999px | chips, FAB, avatar |

---

## 6. Elevation

Two real shadows. Everything else uses hairline borders.

| Token | Value | Use |
|---|---|---|
| `--shadow-nav` | `0 12px 32px -8px rgba(0,0,0,0.35), 0 2px 6px rgba(0,0,0,0.1)` | floating tab bar |
| `--shadow-fab` | `0 14px 28px -6px color-mix(in srgb, var(--accent) 55%, transparent), 0 2px 6px rgba(0,0,0,0.15)` | `+` FAB, accent-tinted glow |
| `--shadow-card` | `0 1px 2px rgba(0,0,0,0.04)` | optional, faint; prefer hairlines |

---

## 7. Motion

Quiet. 200–300ms ease-out. No bouncy springs. No hover scale transforms.

| Animation | Trigger |
|---|---|
| `fadeIn 0.3s` (opacity + 6px rise) | screen swap |
| `slideUp 0.3s` from below | add-service sheet |
| Cursor-tracked tilt (0.2s transition) | 3D hero parallax |
| `dropFall 3.2s infinite` | hero oil drop |

### Press / hover

- **Rows**: bg shifts to `color-mix(in srgb, var(--bg-2) 75%, var(--ink) 6%)`.
- **Icon buttons**: `background: var(--hairline)` on press.
- **FAB**: `transform: scale(0.94)` on press, no hover state (mobile-first).

---

## 8. Layout

- Phone canvas: **402×874** (iPhone 14 Pro class).
- **Floating tab bar**: pill on left (4 tabs) + isolated circular FAB on right. Bottom-docked, 14px side padding, 18px bottom inset.
- **Top app bar** sticks during scroll, with blur. It is the **only** surface that uses glass:
  `backdrop-filter: blur(20px) saturate(140%)` over `color-mix(in srgb, var(--bg) 88%, transparent)`.
- Transparency/blur is reserved as a hierarchy signal — nothing else gets it.

---

## 9. Iconography

**Custom monoline set**, drawn specifically for moto service. **1.5px stroke**, 24×24 viewBox, no fills. For glyphs <14px, snap to **1.25px** stroke. Stroke inherits from `currentColor`.

Current glyphs: `home · bike · clipboard · profile · plus · close · chevron · search · filter · bell · camera · settings · receipt · sparkle · shield · wrench · tune · zap · arrowDown · oil · chain · tire · brake · gauge`.

**No emoji.** The generic MDI set feels stock — don't fall back to it.

---

## 10. Imagery & illustration

No stock photos. No gradients on backgrounds. Three sanctioned illustrations:

- **3D isometric oil can** on Home (pure SVG, parallax-tilts on hover, label band reads `Kickstand 5W-40 · 1L`).
- **Rotating pedestal bike** on Garage (CSS 3D, continuous rotation).
- **Monoline custom icons** (see §9).

---

## 11. NativeWind / Expo mapping

The mobile app already ships atelier tokens:

- Tokens live in `apps/mobile/lib/colors.ts` and `apps/mobile/lib/theme.ts`.
- Tailwind mapping in `apps/mobile/tailwind.config.ts`.
- Plus Jakarta Sans is bundled; Instrument Serif + JetBrains Mono need to be loaded via `expo-font` (or Google Fonts CDN in web preview builds).
- Glass on the top app bar uses **`expo-blur`**.
- Icons should be ported from `shared.jsx` to `react-native-svg`.

When building new UI in RN, prefer the NativeWind classes that map to these tokens rather than hard-coded hex.

---

## 12. Component patterns — quick reference

- **Cards**: `bg-surface` or `bg-bg-2`, `rounded-2xl` / `rounded-3xl`, no shadow, no border. Lead with an eyebrow.
- **Fields**: `bg-surface-low`, no border, 2px accent underline on focus.
- **Buttons** (primary): filled `--accent`, `--ink` label, `rounded-full` or `rounded-2xl` depending on context.
- **Buttons** (secondary): `bg-bg-2`, `--ink` label, no border.
- **Badges / chips**: `rounded-full`, mono 10px, uppercase, `--muted` on `--bg-2`.
- **Rows**: title (600) + meta (mono 11px), separated by hairline only if the list density needs it.
- **Hero**: big serif number + eyebrow above + unit meta below. One per screen.
- **FAB**: circular, accent-filled, accent-glow shadow, `+` glyph, scale-press only.
