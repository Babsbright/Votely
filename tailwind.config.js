/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
        fontFamily: {
        outfit: ["var(--font-outfit)"],
        inter: ["var(--font-inter)"],
        sora: ["var(--font-sora)"],
      },
    },
  },
    darkMode: "class",
  plugins: [],
};



