import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Outfit", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Fraunces", "Outfit", "serif"]
      },
      colors: {
        paper: "oklch(var(--paper) / <alpha-value>)",
        "paper-deep": "oklch(var(--paper-deep) / <alpha-value>)",
        surface: "oklch(var(--surface) / <alpha-value>)",
        "surface-strong": "oklch(var(--surface-strong) / <alpha-value>)",
        ink: "oklch(var(--ink) / <alpha-value>)",
        muted: "oklch(var(--muted) / <alpha-value>)",
        line: "oklch(var(--line) / <alpha-value>)",
        ember: "oklch(var(--ember) / <alpha-value>)",
        teal: "oklch(var(--teal) / <alpha-value>)",
        violet: "oklch(var(--violet) / <alpha-value>)"
      },
      boxShadow: {
        sketch: "0 18px 40px oklch(24% 0.04 64 / 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
