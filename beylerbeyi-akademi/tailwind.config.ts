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
        bb: {
          red: "#E30A17",
          "red-dark": "#B80811",
          "red-light": "#FF1F2D",
          green: "#00843D",
          "green-dark": "#006B31",
          "green-light": "#00A64D",
          white: "#FFFFFF",
          cream: "#FFF8F0",
          dark: "#1A1A2E",
          "dark-light": "#16213E",
          "dark-card": "#0F3460",
        },
      },
      backgroundImage: {
        "bb-gradient": "linear-gradient(135deg, #E30A17 0%, #00843D 100%)",
        "bb-gradient-dark":
          "linear-gradient(135deg, #1A1A2E 0%, #0F3460 50%, #1A1A2E 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
