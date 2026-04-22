import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // New redesign tokens
        ink:          '#1A1A1A',
        'ink-2':      '#2E2B27',
        bg:           '#F4F2EC',
        'bg-2':       '#EBE8DF',
        muted:        '#7A756C',
        hairline:     'rgba(26,26,26,0.09)',
        'hairline-2': 'rgba(26,26,26,0.16)',

        // Existing brand (unchanged)
        yellow:           '#F2D06B',
        danger:           '#DC2626',
        'danger-surface': '#FFDAD6',
        success:          '#22C55E',

        // Temporary aliases — remove at the end of Phase 4
        charcoal:        '#1A1A1A',
        sand:            '#C7B299',
        surface:         '#F4F2EC',
        'surface-low':   '#EBE8DF',
        'surface-card':  '#FFFFFF',
        outline:         'rgba(26,26,26,0.16)',
      },
      fontFamily: {
        // Existing
        sans: ['PlusJakartaSans-Regular'],
        'sans-medium': ['PlusJakartaSans-Medium'],
        'sans-semibold': ['PlusJakartaSans-SemiBold'],
        'sans-bold': ['PlusJakartaSans-Bold'],
        'sans-xbold': ['PlusJakartaSans-ExtraBold'],
        // New
        display: ['InstrumentSerif_400Regular'],
        mono: ['JetBrainsMono_500Medium'],
        'mono-semibold': ['JetBrainsMono_600SemiBold'],
      },
      fontSize: {
        xxs: ['10px', { lineHeight: '14px' }],
        'display-sm': ['48px', { lineHeight: '48px', letterSpacing: '-1.92px' }],
        'display-md': ['64px', { lineHeight: '64px', letterSpacing: '-3.2px' }],
        'display-lg': ['80px', { lineHeight: '80px', letterSpacing: '-4.4px' }],
        'display-xl': ['96px', { lineHeight: '96px', letterSpacing: '-5.28px' }],
      },
      letterSpacing: {
        'wide-1': '2px',
        'wide-2': '3px',
        widest: '4px',
        atelier: '2.2px',
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
        '2.5xl': '28px',
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
