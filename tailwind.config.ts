/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        aurora: {
          1: "#99f6e4",
          2: "#a5b4fc",
          3: "#f0abfc",
        }
      },
      boxShadow: {
        glow: "0 0 60px rgba(99,102,241,0.3)",
      },
      backdropBlur: {
        xs: '2px'
      }
    },
  },
  plugins: [],
}