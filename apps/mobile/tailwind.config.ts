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
