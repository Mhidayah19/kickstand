import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Atelier tokens (source of truth — matches design-systems/DESIGN.md §2)
        ink:          '#1A1A1A',
        'ink-2':      '#2E2B27',
        bg:           '#F4F2EC',
        'bg-2':       '#EBE8DF',
        surface:      '#FFFFFF',
        muted:        '#7A756C',
        hairline:     'rgba(26,26,26,0.09)',
        'hairline-2': 'rgba(26,26,26,0.16)',

        // Brand
        accent:           '#F2D06B',
        yellow:           '#F2D06B', // alias for accent (historical name retained)
        danger:           '#DC2626',
        'danger-surface': '#FFDAD6',
        success:          '#22C55E',
      },
      fontFamily: {
        sans: ['Inter_400Regular'],
        'sans-medium': ['Inter_500Medium'],
        'sans-semibold': ['Inter_600SemiBold'],
        'sans-bold': ['Inter_700Bold'],
        'sans-xbold': ['Inter_800ExtraBold'],
        display: ['Inter_700Bold'],
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
        // Atelier spec radii (DESIGN.md §5)
        card:       '14px',
        'card-lg':  '18px',
        hero:       '22px',
        phone:      '28px',
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
