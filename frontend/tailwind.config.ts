import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)'],
        heading: ['var(--font-space)'],
        mono: ['var(--font-mono)'],
      },
      colors: {
        gray: {
          850: '#182032',
          950: '#070a13',
        }
      }
    },
  },
  plugins: [],
};
export default config;
