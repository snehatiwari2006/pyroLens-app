/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Original brand palette preserved
        navy: "#0F1E2E",
        navyDeep: "#0A141F",
        ink: "#0F1E2E",
        slateink: "#5E6573",
        paper: "#F8FAFC",
        line: "#E2E8F0",
        critical: "#B3261E",
        criticalBg: "#FBEAE9",
        high: "#C2410C",
        highBg: "#FFF4EB",
        medium: "#B45309",
        mediumBg: "#FEF3C7",
        safe: "#1E7A4C",
        safeBg: "#E7F4EC",
        info: "#B45309",
        infoBg: "#FEF3C7",
        orange: "#C2410C",
        orangeHover: "#9A3412",
        amber: "#D97706",
        amberBg: "#FEF3C7",
        warmWell: "#F5F1EB",
        
        // Extended vivid accent palette for light theme enhancements
        brandOrange: "#EA580C",
        brandBlue: "#2563EB",
        brandTeal: "#0D9488",
        brandPurple: "#7C3AED",
        brandEmerald: "#059669",
        brandRose: "#E11D48",
        softCream: "#FFFDF9",
        warmCard: "#FCFAF6",
      },
      boxShadow: {
        card: "0 2px 8px -1px rgba(15, 30, 46, 0.05), 0 1px 3px rgba(15, 30, 46, 0.03)",
        cardHover: "0 10px 22px -4px rgba(15, 30, 46, 0.08), 0 4px 8px -2px rgba(15, 30, 46, 0.04)",
        cardActive: "0 14px 28px -4px rgba(194, 65, 12, 0.12), 0 6px 12px -2px rgba(15, 30, 46, 0.06)",
        badgeGlow: "0 0 12px rgba(194, 65, 12, 0.25)",
      },
      keyframes: {
        pulseDot: {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.3)", opacity: "0.7" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        pulseDot: "pulseDot 2s ease-in-out infinite",
        fadeIn: "fadeIn 0.3s ease-out forwards",
      },
    },
  },
  plugins: [],
};
