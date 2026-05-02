/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        app: {
          cream: '#f8f4ea',
          sand: '#efe3cc',
          charcoal: '#203135',
          teal: '#3d7b80',
          mint: '#97c8a8',
          coral: '#ea866f',
          gold: '#d9ae5f'
        }
      },
      boxShadow: {
        soft: '0 18px 48px rgba(32, 49, 53, 0.08)'
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Instrument Sans"', 'sans-serif']
      },
      backgroundImage: {
        grain:
          'radial-gradient(circle at 1px 1px, rgba(32, 49, 53, 0.08) 1px, transparent 0)'
      }
    }
  },
  plugins: []
};
