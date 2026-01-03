import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        body: ["Inter", "sans-serif"],
        accent: ["Inter", "system-ui", "-apple-system", "sans-serif"], // Changed to normal font
        baloo: ["Baloo 2", "cursive"],
        fredoka: ["Fredoka", "sans-serif"],
        luckiest: ["Luckiest Guy", "cursive"],
        bungee: ["Bungee", "cursive"],
      },
      colors: {
        toy: "#22c55e",
        game: "#8b5cf6",
        fresh: "#06b6d4"
      }
    }
  },
  plugins: []
};

export default config;

