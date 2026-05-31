import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary:   { DEFAULT: '#1E3A5F', light: '#2E5080', muted: '#EBF0F7' },
        success:   { DEFAULT: '#00A86B', light: '#00C27C', muted: '#E6F7F1' },
        warning:   { DEFAULT: '#FF7B00', muted: '#FFF3E6' },
        danger:    { DEFAULT: '#E63946', muted: '#FDECEA' },
        xp:        '#FFD700',
        streak:    '#FF6B35',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
      },
      boxShadow: {
        card: '0 2px 8px rgba(26,26,46,0.08)',
        'card-lg': '0 4px 16px rgba(26,26,46,0.12)',
      }
    },
  },
  plugins: [],
} satisfies Config
