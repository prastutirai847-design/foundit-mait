/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#F8F5EF',
        surface: '#FFFFFF',
        ink: {
          DEFAULT: '#111827',
          soft: '#2B3646',
          muted: '#5E6877',
          faint: '#8A929E',
        },
        accent: {
          DEFAULT: '#2E45CC',
          dark: '#1F319C',
          soft: '#EDF0FF',
          line: '#C9D0F7',
        },
        line: '#E6E0D5',
        sand: '#EFE8DB',
        found: {
          DEFAULT: '#0C6B54',
          soft: '#E6F4EE',
          line: '#C5E5D9',
        },
        lost: {
          DEFAULT: '#9A5A0B',
          soft: '#FAF0DE',
          line: '#EFDCBA',
        },
      },
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        display: ['"Fraunces Variable"', 'Fraunces', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(17, 24, 39, 0.04), 0 14px 34px -22px rgba(17, 24, 39, 0.28)',
        lift: '0 2px 4px rgba(17, 24, 39, 0.04), 0 24px 48px -24px rgba(17, 24, 39, 0.3)',
        focus: '0 0 0 4px rgba(46, 69, 204, 0.14)',
      },
      borderRadius: {
        '2xl': '1.125rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      maxWidth: {
        page: '1180px',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'toast-in': {
          '0%': { opacity: '0', transform: 'translateY(12px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 500ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 200ms ease-out both',
        'toast-in': 'toast-in 240ms cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [],
}
