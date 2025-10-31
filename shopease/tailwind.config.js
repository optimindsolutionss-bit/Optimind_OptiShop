/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6B8E23", // verde oliva
        secondary: "#D4A373", // tierra cálida
        background: "#FFFBEA", // crema claro
        accent: "#A3B18A", // verde suave
        dark: "#3C403D", // gris oscuro
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
      },
    },
  },
  plugins: [],
};
