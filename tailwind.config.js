/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#0F1E2E",
        navyDeep: "#0A141F",
        ink: "#0F1E2E",
        slateink: "#5E6573",
        paper: "#FAF8F5",
        line: "#E8E4DC",
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
      },
    },
  },
  plugins: [],
};
