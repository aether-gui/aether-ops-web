/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        intel: {
          50:  '#e6f4ff',
          100: '#cceeff',
          200: '#99ddff',
          300: '#4ac8fd',
          400: '#00C7FD',
          500: '#0097d9',
          600: '#0068B5',
          700: '#0059a0',
          800: '#004a8a',
          900: '#003a75',
        },
      },
    },
  },
  plugins: [],
};
