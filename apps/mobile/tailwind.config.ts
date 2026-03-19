import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        'surface-muted': 'var(--color-surface-muted)',
        border: 'var(--color-border)',
        'border-subtle': 'var(--color-border-subtle)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-muted': 'var(--color-text-muted)',
        accent: 'var(--color-accent)',
        'accent-surface': 'var(--color-accent-surface)',
        warning: 'var(--color-warning)',
        'warning-surface': 'var(--color-warning-surface)',
        danger: 'var(--color-danger)',
        'danger-surface': 'var(--color-danger-surface)',
        success: 'var(--color-success)',
        'success-surface': 'var(--color-success-surface)',
        hero: 'var(--color-hero)',
        'hero-text': 'var(--color-hero-text)',
        'hero-muted': 'var(--color-hero-muted)',
      },
      fontFamily: {
        sans: ['PlusJakartaSans-Regular'],
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
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '32px',
      },
    },
  },
};

export default config;
