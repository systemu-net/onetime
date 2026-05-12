/** @type {import('tailwindcss').Config} */
const plugin = require("tailwindcss/plugin")

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      fontFamily: {
        rubik: ['Rubik', 'sans-serif'],
        // Dashboard mockup typography
        display: ['"Bricolage Grotesque"', 'sans-serif'],
        sans: ['Geist', 'sans-serif'],
        mono: ['"Geist Mono"', 'monospace'],
      },

      colors: {
        accent: `var(--clr-primary-400)`,
        primary: `var(--clr-primary-500)`,
        primaryDark: `var(--clr-primary-500)`,
        textPrimary: '#203053',
        secondary: `var(--clr-secondary-400)`,
        neutral100: `var(--clr-neutral-100: hsl(0, 0%, 100%))`,
        neutral200: `var(--clr-neutral-200: hsl(0, 0%, 75%))`,
        neutral300: `var(--clr-neutral-300: hsl(257, 7%, 63%))`,
        neutral400: `var(--clr-neutral-400: hsl(255, 11%, 22%))`,
        neutral500: `var(--clr-neutral-500: hsl(260, 8%, 14%))`,
        neutral900: `var(--clr-neutral-900: hsl(0, 0%, 0%))`,

        // Dashboard design tokens (from thinly-home-improved.html mockup)
        canvas: { DEFAULT: '#f4f5f1', 2: '#ffffff' },
        ink: {
          DEFAULT: '#15151b',
          2: '#3a3a48',
          3: '#6a6a78',
          4: '#9a9aa8',
        },
        dashline: { DEFAULT: '#e5e7e0', 2: 'rgba(0,0,0,0.05)' },
        mint: { DEFAULT: '#b7e6d0', 2: '#d3efe1', 3: '#e8f5ee', d: '#2a7a5c' },
        coral: { DEFAULT: '#f5a99a', 2: '#fbcfc4', d: '#b54a31' },
        peach: { DEFAULT: '#fcd9b8', 2: '#fde8d2', d: '#b5613c' },
        lilac: { DEFAULT: '#d8c9f0', 2: '#ebe2f7', d: '#6b4ba6' },
        sun: { DEFAULT: '#fce58b', 2: '#fdefb4', d: '#8a6f0d' },
        sky: { DEFAULT: '#c8def5', 2: '#dde8f7', d: '#2c5d8f' },
        rose: '#f4a4c0',
        forest: '#1f3a32',
        violetBrand: { DEFAULT: '#7c3aed', 2: '#a855f7' },
      },
      borderRadius: {
        bento: '18px',
      },
      boxShadow: {
        'bento-sm': '0 1px 0 rgba(0,0,0,0.03), 0 2px 8px rgba(0,0,0,0.03)',
        'bento': '0 1px 0 rgba(0,0,0,0.04), 0 8px 24px rgba(20,20,30,0.06)',
        'bento-lift': '0 1px 0 rgba(0,0,0,0.04), 0 16px 40px rgba(20,20,30,0.1)',
      },
      keyframes: {
        wave: {
          '0%, 60%, 100%': { transform: 'rotate(0)' },
          '10%, 30%': { transform: 'rotate(14deg)' },
          '20%': { transform: 'rotate(-8deg)' },
          '40%': { transform: 'rotate(14deg)' },
          '50%': { transform: 'rotate(-4deg)' },
        },
        floatY: {
          '0%, 100%': { transform: 'translateY(0) rotate(0)' },
          '50%': { transform: 'translateY(-4px) rotate(2deg)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-live': {
          '0%, 100%': { boxShadow: '0 0 0 0 #2a7a5c', opacity: '1' },
          '70%': { boxShadow: '0 0 0 6px transparent', opacity: '0.8' },
        },
      },
      animation: {
        wave: 'wave 2.5s ease-in-out infinite',
        float: 'floatY 5s ease-in-out infinite',
        'pulse-live': 'pulse-live 1.8s infinite',
      },
      scale: {
        'preview': '0.20'
      }
    },
  },
  plugins: [
    plugin(({ addUtilities }) => {
      addUtilities({
        /* Chrome, Safari and Opera */
        ".scrollbar-hidden::-webkit-scrollbar": {
          display: "none",
        },

        ".scrollbar-hidden": {
          "scrollbar-width": "none",
          "-ms-overflow-style": "none",
        },

        /* Mobile slider utilities */
        ".slide-in-right": {
          "transform": "translateX(0)",
        },
        ".slide-out-right": {
          "transform": "translateX(100%)",
        },
      })
    }),
  ],
};
