/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#ff0033', // YouTube Red punch
          600: '#e1062b',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
        },
        dark: {
          bg: '#0a0c10',
          card: '#11141c',
          cardHover: '#161a25',
          border: '#1f2533',
          borderHover: '#2d3748',
          subtle: '#64748b',
          text: '#f1f5f9',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-sm': '0 0 15px -3px rgba(255, 0, 51, 0.25)',
        'glow': '0 0 25px -3px rgba(255, 0, 51, 0.35)',
        'glow-lg': '0 0 40px -5px rgba(255, 0, 51, 0.45)',
      },
      keyframes: {
        pulseSubtle: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.6 },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        }
      },
      animation: {
        'pulse-subtle': 'pulseSubtle 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s infinite',
      }
    },
  },
  plugins: [],
}
