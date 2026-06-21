import type { Config } from "tailwindcss";

// Colors map to CSS custom properties defined in app/tokens.css so that
// dark mode resolves automatically via prefers-color-scheme. Never hard-code
// hex in components — use these semantic tokens (see CLAUDE.md conventions).
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: "var(--brand)",
        "brand-soft": "var(--brand-soft)",
        "brand-strong": "var(--brand-strong)",
        "brand-secondary": "var(--brand-secondary)",
        "brand-tertiary": "var(--brand-tertiary)",
        "brand-quaternary": "var(--brand-quaternary)",
        ink: "var(--ink)",
        heading: "var(--heading)",
        body: "var(--body)",
        "body-subtle": "var(--body-subtle)",
        disabled: "var(--disabled)",
        "fg-disabled": "var(--fg-disabled)",
        success: "var(--success)",
        danger: "var(--danger)",
        warning: "var(--warning)",
      },
      fontFamily: {
        sans: ["Oswald", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "20px",
        card: "20px",
        nested: "12px",
        sm: "8px",
      },
      borderWidth: {
        DEFAULT: "4px",
        divider: "2px",
      },
      // Hard offset block shadows — the system signature. Always solid black.
      boxShadow: {
        "hard-2xs": "2px 2px 0 0 #000000",
        "hard-xs": "4px 4px 0 0 #000000",
        "hard-sm": "6px 6px 0 0 #000000",
        "hard-md": "8px 8px 0 0 #000000",
        "hard-lg": "10px 10px 0 0 #000000",
        "hard-xl": "14px 14px 0 0 #000000",
        "hard-2xl": "20px 20px 0 0 #000000",
      },
    },
  },
  plugins: [],
};

export default config;
