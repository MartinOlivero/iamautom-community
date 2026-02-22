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
          // New electric palette
          electric: "var(--color-electric-blue)",
          violet: "var(--color-violet)",
          cyan: "var(--color-cyan)",
        },
      },
      fontFamily: {
        // Modern premium font pairing
        display: ['"Syne"', "system-ui", "sans-serif"],
        body: ['"Inter"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      borderRadius: {
        card: "16px",
        input: "10px",
        pill: "9999px",
      },
      backgroundImage: {
        "hero": "url('/bg-hero.png')",
        "gradient-cosmic": "linear-gradient(135deg, #04080f 0%, #0d1525 50%, #04080f 100%)",
        "gradient-glass": "linear-gradient(135deg, rgba(56,189,248,0.08) 0%, rgba(167,139,250,0.05) 50%, rgba(249,115,22,0.05) 100%)",
        "gradient-card": "linear-gradient(135deg, rgba(10,16,30,0.8) 0%, rgba(7,13,26,0.6) 100%)",
        "gradient-accent": "linear-gradient(135deg, #f97316, #fb923c)",
        "gradient-blue": "linear-gradient(135deg, #0ea5e9, #6366f1)",
        "gradient-aurora": "linear-gradient(135deg, #38bdf8 0%, #a78bfa 50%, #f97316 100%)",
        "gradient-sidebar": "linear-gradient(180deg, rgba(4,8,15,0.95) 0%, rgba(7,13,26,0.92) 100%)",
      },
      boxShadow: {
        "glow-blue": "0 0 20px rgba(56,189,248,0.3), 0 0 60px rgba(56,189,248,0.1)",
        "glow-accent": "0 0 20px rgba(249,115,22,0.4), 0 0 60px rgba(249,115,22,0.15)",
        "glow-violet": "0 0 20px rgba(167,139,250,0.3), 0 0 60px rgba(167,139,250,0.1)",
        "card": "0 4px 24px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.04) inset",
        "card-hover": "0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(56,189,248,0.2), 0 1px 0 rgba(255,255,255,0.06) inset",
        "dropdown": "0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(56,189,248,0.1)",
      },
      backdropBlur: {
        xs: "4px",
        "2xl": "40px",
        "3xl": "60px",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "slide-in-right": "slideInRight 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "scale-in": "scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "float": "float 6s ease-in-out infinite",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
        "shimmer": "shimmer 6s linear infinite",
        "aurora": "aurora 8s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(100%) scale(0.9)" },
          "100%": { opacity: "1", transform: "translateX(0) scale(1)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.92)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(56,189,248,0.2)" },
          "50%": { boxShadow: "0 0 40px rgba(56,189,248,0.5), 0 0 80px rgba(167,139,250,0.2)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        aurora: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
