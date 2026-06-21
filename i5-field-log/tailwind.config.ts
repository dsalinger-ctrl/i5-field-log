import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#224778',
          dark:    '#1a3860',
          light:   '#2d5f9e',
          muted:   '#3a5f8a',
        },
        accent: {
          DEFAULT: '#871e5e',
          dark:    '#6b1749',
          light:   '#a32572',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
