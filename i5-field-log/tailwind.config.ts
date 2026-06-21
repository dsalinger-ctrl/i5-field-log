import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#1a5276', light: '#2e86c1', dark: '#154360' },
      },
    },
  },
  plugins: [],
}
export default config
