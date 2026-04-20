/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Outfit"', 'system-ui', 'sans-serif'],
      },
      colors: {
        cream: '#FFFDF5',
        foreground: '#1E293B',
        accent: {
          DEFAULT: '#8B5CF6',
          light: '#A78BFA',
          dark: '#7C3AED',
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
        },
        secondary: {
          DEFAULT: '#F472B6',
          light: '#F9A8D4',
          dark: '#EC4899',
        },
        tertiary: {
          DEFAULT: '#FBBF24',
          light: '#FDE68A',
          dark: '#F59E0B',
        },
        quaternary: {
          DEFAULT: '#34D399',
          light: '#6EE7B7',
          dark: '#10B981',
        },
        muted: {
          DEFAULT: '#F1F5F9',
          foreground: '#64748B',
        },
        /* Keep brand aliases for dashboard compatibility */
        brand: {
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
        },
      },
      borderRadius: {
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '24px',
        '2xl': '32px',
      },
      borderWidth: {
        DEFAULT: '2px',
        0: '0',
        1: '1px',
        2: '2px',
        3: '3px',
        4: '4px',
      },
      boxShadow: {
        pop: '4px 4px 0px 0px #1E293B',
        'pop-hover': '6px 6px 0px 0px #1E293B',
        'pop-active': '2px 2px 0px 0px #1E293B',
        'pop-pink': '6px 6px 0px 0px #F472B6',
        'pop-violet': '6px 6px 0px 0px #8B5CF6',
        'pop-yellow': '6px 6px 0px 0px #FBBF24',
        'pop-mint': '6px 6px 0px 0px #34D399',
        'pop-soft': '8px 8px 0px 0px #E2E8F0',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease forwards',
        'slide-up': 'slideUp 0.4s ease forwards',
        'slide-in-right': 'slideInRight 0.3s ease forwards',
        'scale-in': 'scaleIn 0.2s ease forwards',
        shimmer: 'shimmer 1.5s infinite',
        wiggle: 'wiggle 0.4s ease',
        pop: 'pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        float: 'float 4s ease-in-out infinite',
        'float-reverse': 'float-reverse 5s ease-in-out infinite',
        marquee: 'marquee 30s linear infinite',
        'spin-slow': 'spin-slow 12s linear infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideInRight: { from: { opacity: 0, transform: 'translateX(16px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
        scaleIn: { from: { opacity: 0, transform: 'scale(0.95)' }, to: { opacity: 1, transform: 'scale(1)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(3deg)' },
          '75%': { transform: 'rotate(-3deg)' },
        },
        pop: {
          '0%': { transform: 'scale(0)', opacity: 0 },
          '60%': { transform: 'scale(1.15)', opacity: 1 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-15px) rotate(5deg)' },
        },
        'float-reverse': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(15px) rotate(-5deg)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
      },
    },
  },
  plugins: [],
}
