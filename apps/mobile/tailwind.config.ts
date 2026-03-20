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
