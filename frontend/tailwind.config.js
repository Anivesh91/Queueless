/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Newsreader', 'Georgia', 'serif'],
      },
      colors: {
        forest: {
          50: '#F2F7F4',
          100: '#E2EDE7',
          200: '#C5DCCF',
          300: '#96BEA9',
          400: '#5E987B',
          500: '#3F6451',
          600: '#2D5A43',
          700: '#184E38', // Brand Evergreen
          800: '#123E2C',
          900: '#0D2B1F',
          950: '#071711',
        },
        cream: {
          50: '#FCFAF6',
          100: '#F5F2EB', // Canvas
          200: '#EBE4D5',
          300: '#E8E0CE',
          400: '#D9D2C5',
          500: '#C4BCAC',
        },
        ink: {
          900: '#1A231E',
          800: '#1C2520',
          700: '#37433C',
          600: '#4D5D55',
          500: '#59665F',
          400: '#65736B',
        },
        coral: {
          400: '#F8A084',
          500: '#D95D39',
        },
        primary: {
          50: '#F2F7F4',
          100: '#E2EDE7',
          200: '#C5DCCF',
          300: '#96BEA9',
          400: '#5E987B',
          500: '#3F6451',
          600: '#2D5A43',
          700: '#184E38',
          800: '#123E2C',
          900: '#0D2B1F',
        },
      },
      boxShadow: {
        'soft-float': '0 25px 60px -15px rgba(25, 35, 30, 0.08)',
        'soft-lift': '0 30px 70px -10px rgba(25, 35, 30, 0.12)',
        '2xs': '0 1px 2px 0 rgba(25, 35, 30, 0.03)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounce 2s infinite',
        'shimmer': 'shimmer 2s infinite',
      },
    },
  },
  plugins: [],
}
