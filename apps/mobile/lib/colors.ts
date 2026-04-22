/**
 * Shared color constants for use in style objects and icon props
 * where NativeWind className tokens can't be used directly.
 * Single source of truth — mirrors tailwind.config.ts.
 */
export const colors = {
  charcoal: '#1E1E1E',
  sand: '#C7B299',
  yellow: '#F2D06B',
  surface: '#F9F9F9',
  surfaceLow: '#F3F3F3',
  surfaceCard: '#FFFFFF',
  outline: '#D0C5BA',
  danger: '#DC2626',
  dangerSurface: '#FFDAD6',
  success: '#22C55E',
  white: '#FFFFFF',
} as const;

// Tailwind doesn't accept `color-mix()` or `oklch()` in RN.
// Use these for translucent fills where the prototype used color-mix().

const YELLOW = { r: 242, g: 208, b: 107 };
const INK    = { r: 26, g: 26, b: 26 };
const DANGER = { r: 220, g: 38, b: 38 };
const BG     = { r: 244, g: 242, b: 236 };

function rgba(c: { r: number; g: number; b: number }, alpha: number): string {
  return `rgba(${c.r}, ${c.g}, ${c.b}, ${alpha})`;
}

export const yellowTint = (alpha: number) => rgba(YELLOW, alpha);
export const inkTint    = (alpha: number) => rgba(INK, alpha);
export const dangerTint = (alpha: number) => rgba(DANGER, alpha);
export const bgTint     = (alpha: number) => rgba(BG, alpha);
