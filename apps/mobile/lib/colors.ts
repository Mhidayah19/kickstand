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
