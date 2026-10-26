/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#26382A',
          light: '#314736',
          dark: '#1c2b20',
        },
        olive: {
          DEFAULT: '#414B32',
          light: '#525e3f',
          dark: '#323a26',
        },
        field: {
          DEFAULT: '#747653',
          light: '#888a64',
          dark: '#5f6143',
        },
        khaki: {
          DEFAULT: '#B7AA83',
          light: '#c8be9d',
          dark: '#9d916b',
        },
        sandstone: {
          DEFAULT: '#D9D2B8',
          light: '#e7e2cf',
          dark: '#c4bc9f',
        },
        command: {
          DEFAULT: '#151A17',
          black: '#151A17',
        },
        tactical: {
          DEFAULT: '#E8EBDD',
          grey: '#E8EBDD',
          muted: '#A9B39F',
        },
        surface: {
          bg: '#151A17',
          card: '#202821',
          raised: '#263128',
          border: '#465044',
        },
        status: {
          success: '#48C774',
          warning: '#F2B84B',
          critical: '#FF6464',
          info: '#62B7E8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'IBM Plex Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'IBM Plex Mono', 'Menlo', 'Courier New', 'monospace'],
      },
      boxShadow: {
        tactical: '0 1px 3px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.24)',
        raised: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
      }
    },
  },
  plugins: [],
}
