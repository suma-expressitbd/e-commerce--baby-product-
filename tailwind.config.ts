import tailwindScrollbar from "tailwind-scrollbar";
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Urbanist", "sans-serif"],
        pollinator: "Pollinator",
        autography: "Autography",
        airstrip: "airstrip",
        noto: ["Noto Sans Bengali"],
        jakarta: ["Plus Jakarta Sans", "sans-serif"],
        poppins: ["Poppins", "sans-serif"],
        urbanist: ["Urbanist", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: "var(--color-primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: "var(--color-secondary)",
        base: "var(--color-base)",
        tertiary: "var(--color-tertiary)",
        accent: "var(--color-accent)",
        muted: "var(--color-muted)",
      },
      screens: {
        "mobile-lg": "425px", // custom breakpoint
        "mobile-sm": "375px",
        "mobile-xs": "360px",
      },
      animation: {
        "light-up-down": "light-up-down 1.5s infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        "light-up-down": {
          "0%, 100%": { backgroundPosition: "0% 0%" },
          "50%": { backgroundPosition: "0% 100%" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
    },
  },
  plugins: [tailwindScrollbar, require("@tailwindcss/typography")],
};

export default config;
