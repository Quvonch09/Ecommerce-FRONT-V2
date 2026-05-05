/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        tg: {
          bg: "var(--tg-bg-color)",
          surface: "var(--tg-secondary-bg-color)",
          text: "var(--tg-text-color)",
          hint: "var(--tg-hint-color)",
          accent: "var(--tg-button-color)",
          accentText: "var(--tg-button-text-color)",
          stroke: "var(--tg-section-separator-color)",
        },
      },
      boxShadow: {
        soft: "0 18px 40px rgba(15, 23, 42, 0.12)",
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        rise: "rise 0.45s ease-out both",
      },
    },
  },
  plugins: [],
};
