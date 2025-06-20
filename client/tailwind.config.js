/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#d97706', // amber-600
          hover: '#b45309', // amber-700
        }
      }
    },
  },
  plugins: [],
}
