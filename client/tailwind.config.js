/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        app: {
          background: '#0F172A',
          surface: '#111827',
          surfaceLight: '#1E293B',
          primary: '#14B8A6',
          primaryHover: '#0D9488',
          text: '#F8FAFC',
          muted: '#94A3B8',
          border: '#334155',
          success: '#22C55E',
          warning: '#F59E0B',
          danger: '#EF4444'
        }
      },

      boxShadow: {
        soft: '0 18px 48px rgba(0, 0, 0, 0.25)'
      },

      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Instrument Sans"', 'sans-serif']
      },

      backgroundImage: {
        grain:
          'radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.04) 1px, transparent 0)'
      }
    }
  },

  plugins: []
};