import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "var(--color-bg)",
          card: "var(--color-card)",
          dark: "var(--color-dark)",
          text: "var(--color-text)",
          "text-secondary": "var(--color-text-secondary)",
          muted: "var(--color-muted)",
          accent: "var(--color-accent)",
          "accent-hover": "var(--color-accent-hover)",
          gold: "var(--color-gold)",
          success: "var(--color-success)",
          border: "var(--color-border)",
          "hover-bg": "var(--color-hover-bg)",
          electric: "var(--color-electric-blue)",
          violet: "var(--color-violet)",
          cyan: "var(--color-cyan)",
          pink: "var(--color-pink)",
        },
      },
      fontFamily: {
        display: ['"Syne"', "system-ui", "sans-serif"],
        body: ['"Inter"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      borderRadius: {
        card: "16px",
        input: "10px",
        pill: "9999px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.08)",
        "card-hover": "0 4px 12px rgba(0,0,0,0.08), 0 16px 40px rgba(0,0,0,0.10)",
        "card-sm": "0 1px 2px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.06)",
        dropdown: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)",
        "glow-blue": "0 4px 20px rgba(99,102,241,0.3)",
        "glow-accent": "0 8px 24px rgba(249,115,22,0.3), 0 2px 8px rgba(0,0,0,0.1)",
        "sidebar": "4px 0 24px rgba(0,0,0,0.06)",
      },
      backgroundImage: {
        "gradient-accent": "linear-gradient(135deg, #f97316, #fb923c)",
        "gradient-blue": "linear-gradient(135deg, #6366f1, #8b5cf6)",
        "gradient-gold": "linear-gradient(135deg, #f59e0b, #fde68a)",
        "gradient-cyan": "linear-gradient(135deg, #06b6d4, #0ea5e9)",
        "gradient-aurora": "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #f97316 100%)",
        "gradient-sidebar": "linear-gradient(180deg, #1e1b4b 0%, #1e293b 100%)",
        "gradient-card": "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.8) 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.35s ease-out",
        "slide-up": "slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)",
        "slide-in-right": "slideInRight 0.45s cubic-bezier(0.34,1.56,0.64,1)",
        "scale-in": "scaleIn 0.25s cubic-bezier(0.34,1.56,0.64,1)",
        "spin-slow": "spin 1.2s linear infinite",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0", transform: "translateY(6px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        slideUp: { "0%": { opacity: "0", transform: "translateY(12px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        slideInRight: { "0%": { opacity: "0", transform: "translateX(100%) scale(0.9)" }, "100%": { opacity: "1", transform: "translateX(0) scale(1)" } },
        scaleIn: { "0%": { opacity: "0", transform: "scale(0.92)" }, "100%": { opacity: "1", transform: "scale(1)" } },
        spin: { to: { transform: "rotate(360deg)" } },
      },
    },
  },
  plugins: [],
};

export default config;
