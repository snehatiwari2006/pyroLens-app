/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#0F2A43",
        navyDeep: "#0A1D30",
        ink: "#1C2733",
        slateink: "#5B6B7A",
        paper: "#F5F6F8",
        line: "#DFE4E9",
        critical: "#B3261E",
        criticalBg: "#FBEAE9",
        high: "#C2600B",
        highBg: "#FBEEE0",
        medium: "#9A7B0A",
        mediumBg: "#FBF3DC",
        safe: "#1E7A4C",
        safeBg: "#E7F4EC",
        info: "#215C8E",
        infoBg: "#E9F1F8",
      },
    },
  },
  plugins: [],
};
