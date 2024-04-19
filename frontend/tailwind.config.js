/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      "dark",
      "light",
      {
        mytheme: {
          primary: "#2dd4bf",

          secondary: "#0093ff",

          accent: "#00b1c5",

          neutral: "#374151",

          "base-100": "#dbeafe",

          info: "#c084fc",

          success: "#00f7b2",

          warning: "#bc6700",

          error: "#d8002f",
        },
      },
    ],
  },
};
