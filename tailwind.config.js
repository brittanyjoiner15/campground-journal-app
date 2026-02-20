/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Sunset Orange - Primary Brand
        brand: {
          50: '#FFF4ED',
          100: '#FFE6D5',
          200: '#FFC9AA',
          300: '#FFA474',
          400: '#FF7A3C',
          500: '#F25C2A', // Primary
          600: '#D63F13',
          700: '#B32F0F',
          800: '#8C2710',
          900: '#6B1F0D',
        },
        // Forest Green - Supporting
        pine: {
          50: '#F0F9F4',
          100: '#DBF0E3',
          200: '#B9E1CB',
          300: '#8BCBAD',
          400: '#5AAD8A',
          500: '#3A9270',
          600: '#2A7559',
          700: '#235E49',
          800: '#1F4B3C',
          900: '#1A3E32',
        },
        // Warm Neutrals - Sand/Cream
        sand: {
          50: '#FDFCFB',
          100: '#F9F7F4',
          200: '#F2EDE7',
          300: '#E8DFD6',
          400: '#D9CCC0',
          500: '#C4B5A8',
          600: '#A99484',
          700: '#8A7567',
          800: '#6D5E52',
          900: '#584D44',
        },
        // Dark Text - Ink
        ink: {
          DEFAULT: '#2D2821',
          light: '#4A4238',
          lighter: '#6B5F52',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 8px rgba(45, 40, 33, 0.08)',
        'card-hover': '0 4px 16px rgba(45, 40, 33, 0.12)',
        'stamp': '0 1px 3px rgba(242, 92, 42, 0.2)',
        'soft': '0 2px 12px rgba(45, 40, 33, 0.06)',
      },
      borderRadius: {
        'card': '12px',
        'button': '10px',
        'badge': '20px',
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },
    },
  },
  plugins: [],
}
