/** @type {import('tailwindcss').Config} */
const plugin = require("tailwindcss/plugin")

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        rubik: ['Rubik', 'sans-serif'], // Add 'rubik' font family
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
      },
      scale: {
        'preview': '0.20',
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
          "scrollbar-width": "none" /* Firefox */,
          "-ms-overflow-style": "none" /* IE and Edge */,
        },
      })
    }),
  ],
};
