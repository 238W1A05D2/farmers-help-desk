/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        green: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        earth: {
          50: '#fdf8f0',
          100: '#faebd7',
          200: '#f5d5b0',
          300: '#e8b87a',
          400: '#d4854a',
          500: '#b8612e',
          600: '#9a4a22',
          700: '#7d3a1e',
          800: '#65301c',
          900: '#52271a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
