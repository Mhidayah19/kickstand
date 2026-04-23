/**
 * Shared color constants for use in style objects, SVG strokes, and icon
 * props where NativeWind classes can't be used directly.
 *
 * Mirrors tailwind.config.ts and design-systems/DESIGN.md §2.
 */
export const colors = {
  // Atelier tokens
  ink:      '#1A1A1A',
  ink2:     '#2E2B27',
  bg:       '#F4F2EC',
  bg2:      '#EBE8DF',
  surface:  '#FFFFFF',
  muted:    '#7A756C',
  hairline: 'rgba(26,26,26,0.09)',
  hairline2:'rgba(26,26,26,0.16)',

  // Brand
  accent:       '#F2D06B',
  yellow:       '#F2D06B', // alias for accent
  danger:       '#DC2626',
  dangerSurface:'#FFDAD6',
  success:      '#22C55E',
  white:        '#FFFFFF',
} as const;

// Tailwind doesn't accept `color-mix()` or `oklch()` in RN.
// Use these for translucent fills.

const ACCENT = { r: 242, g: 208, b: 107 };
const INK    = { r: 26, g: 26, b: 26 };
const DANGER = { r: 220, g: 38, b: 38 };
const BG     = { r: 244, g: 242, b: 236 };

function rgba(c: { r: number; g: number; b: number }, alpha: number): string {
  return `rgba(${c.r}, ${c.g}, ${c.b}, ${alpha})`;
}

export const accentTint = (alpha: number) => rgba(ACCENT, alpha);
export const yellowTint = (alpha: number) => rgba(ACCENT, alpha); // alias
export const inkTint    = (alpha: number) => rgba(INK, alpha);
export const dangerTint = (alpha: number) => rgba(DANGER, alpha);
export const bgTint     = (alpha: number) => rgba(BG, alpha);
