/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#1B4332',
          light: '#2D6A4F',
          muted: '#52796F',
        },
        cream: '#F5F0E8',
      },
    },
  },
  plugins: [],
};
