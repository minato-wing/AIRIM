import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#00C0FE",
          50: "#E5F8FF",
          100: "#CCF1FF",
          200: "#99E4FF",
          300: "#66D6FF",
          400: "#33C9FF",
          500: "#00C0FE",
          600: "#0099CB",
          700: "#007398",
          800: "#004C66",
          900: "#002633",
          950: "#001319",
        },
        secondary: {
          DEFAULT: "#6777FF",
          50: "#F0F2FF",
          100: "#E1E5FF",
          200: "#C3CBFF",
          300: "#A5B1FF",
          400: "#8697FF",
          500: "#6777FF",
          600: "#3349FF",
          700: "#001BFF",
          800: "#0015CB",
          900: "#000F98",
          950: "#00094C",
        },
        accent: {
          DEFAULT: "#2FFFFF",
          50: "#E5FFFF",
          100: "#CCFFFF",
          200: "#99FFFF",
          300: "#66FFFF",
          400: "#33FFFF",
          500: "#2FFFFF",
          600: "#00CCCC",
          700: "#009999",
          800: "#006666",
          900: "#003333",
          950: "#001919",
        },
      },
    },
  },
  plugins: [],
};

export default config;
