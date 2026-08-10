import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: "#8C52FF", light: "#A880F9", dark: "#6F3FE8" },
        accent: { DEFAULT: "#FF5900", dark: "rgb(var(--color-accent-dark) / <alpha-value>)" },
        ink: "rgb(var(--color-text-main) / <alpha-value>)",
        muted: "rgb(var(--color-text-muted) / <alpha-value>)",
        line: "rgb(var(--color-border) / <alpha-value>)",
        canvas: "rgb(var(--color-background) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        "surface-variant": "rgb(var(--color-surface-variant) / <alpha-value>)",
      },
      boxShadow: {
        soft: "0 20px 55px rgba(111,63,232,.12)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};
export default config;
