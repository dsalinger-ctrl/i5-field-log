import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#1a1a1a',   // near-black nav
          dark:    '#111111',
          light:   '#2d2d2d',
          muted:   '#3a3a3a',
        },
        accent: {
          DEFAULT: '#F5C518',   // I-5 yellow
          dark:    '#D4A900',
          light:   '#F8D44A',
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
