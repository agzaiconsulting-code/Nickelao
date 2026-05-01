import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark:    '#1E2A27',
          green:   '#547832',
          yellow:  '#F2C230',
          cream:   '#F5F4E6',
          gray1:   '#A7A8A3',
          gray2:   '#C8C9C4',
          gray3:   '#E6E6E0',
        },
      },
      fontFamily: {
        display: ['var(--font-playfair)', 'serif'],
        sans:    ['var(--font-dm-sans)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
