/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      screens: {
        'xs': '380px',
      },
      colors: {
        primary: '#fd6730',
        'background-light': '#f8f6f5',
        'background-dark': '#23140f',
        success: '#16a34a',
        warning: '#f97316',
        danger: '#dc2626',
        'card-light': '#ffffff',
        'card-dark': '#23140f',
        'text-light-primary': '#181210',
        'text-light-secondary': '#8d6a5e',
        'text-dark-primary': '#f8f6f5',
        'text-dark-secondary': '#a89a95',
        'border-light': '#e7deda',
        'border-dark': '#40312c',
      },
      fontFamily: {
        sans: ['Nunito', 'system-ui', 'sans-serif'],
        display: ['Nunito', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px',
      },
    },
  },
  darkMode: 'class',
  plugins: [],
}
