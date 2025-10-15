/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d7fe',
          300: '#a5bbfc',
          400: '#8299f8',
          500: '#667eea',
          600: '#5568d3',
          700: '#4653b5',
          800: '#3a4493',
          900: '#333d76',
        },
        secondary: {
          50: '#fdf4f7',
          100: '#fce8f0',
          200: '#fad1e3',
          300: '#f7a8ca',
          400: '#f175a7',
          500: '#f5576c',
          600: '#e03e5c',
          700: '#c32d4a',
          800: '#a22742',
          900: '#87253d',
        },
      },
    },
  },
  plugins: [],
}

