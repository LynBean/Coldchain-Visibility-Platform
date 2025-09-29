/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  plugins: [require('@tailwindcss/container-queries')],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: 'hsl(var(--background))',
          200: 'hsl(var(--background-200))',
        },
        foreground: {
          DEFAULT: 'hsl(var(--foreground))',
          lighter: 'hsl(var(--foreground-lighter))',
        },
        brand: {
          DEFAULT: 'hsl(var(--brand))',
          200: 'hsl(var(--brand-200))',
          300: 'hsl(var(--brand-300))',
          400: 'hsl(var(--brand-400))',
          500: 'hsl(var(--brand-500))',
          600: 'hsl(var(--brand-600))',
        },
        border: {
          DEFAULT: 'hsl(var(--border))',
        },
        alternative: {
          DEFAULT: 'hsl(var(--alternative))',
          200: 'hsl(var(--alternative-200))',
          border: 'hsl(var(--alternative-border))',
        },
        button: {
          DEFAULT: 'hsl(var(--button))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
        },
        overlay: {
          DEFAULT: 'hsl(var(--overlay))',
        },
        selection: {
          DEFAULT: 'hsl(var(--selection))',
        },
      },
    },
  },
  plugins: [],
}
