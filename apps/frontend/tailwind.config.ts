import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#0F766E",
          dark: "#115E59",
          light: "#14B8A6"
        }
      }
    }
  },
  plugins: []
};

export default config;
