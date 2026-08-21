import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#17252c',
        canvas: '#f6f7f5',
        saffron: '#e9a92f',
        coral: '#d9684b',
        teal: '#2e8780',
      },
      boxShadow: {
        soft: '0 12px 32px rgba(23, 37, 44, 0.08)',
      },
    },
  },
  plugins: [],
} satisfies Config
