/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0a0a1a',
          card: '#111128',
          glass: 'rgba(255, 255, 255, 0.03)',
          border: 'rgba(255, 255, 255, 0.08)',
        },
        brand: {
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },
        status: {
          new: '#3b82f6',
          contacted: '#8b5cf6',
          qualified: '#f59e0b',
          proposal: '#f97316',
          won: '#10b981',
          lost: '#ef4444',
        }
      },
      fontFamily: {
        body: ['Inter', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
