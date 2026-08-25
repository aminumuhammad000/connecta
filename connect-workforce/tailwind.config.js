/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans"', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#FD6730',
          hover: '#e55520',
          light: '#FF8F6B',
        },
        secondary: '#FF8F6B',
      },
    },
  },
  plugins: [],
}
