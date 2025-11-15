/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'pine': {
          900: '#3E5F44',
          700: '#5E936C',
          400: '#93DA97',
          100: '#E8FFD7',
        }
      }
    },
  },
  plugins: [],
}
