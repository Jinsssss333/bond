/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        aurora: "aurora 60s linear infinite",
      },
      keyframes: {
        aurora: {
          from: {
            backgroundPosition: "50% 50%, 50% 50%",
          },
          to: {
            backgroundPosition: "350% 50%, 350% 50%",
          },
        },
      },
    },
  },
  plugins: [
    function ({ addUtilities, theme }) {
      const colors = theme('colors');
      const colorUtilities = {};
      
      Object.keys(colors).forEach((color) => {
        if (typeof colors[color] === 'object') {
          Object.keys(colors[color]).forEach((shade) => {
            colorUtilities[`--${color}-${shade}`] = colors[color][shade];
          });
        } else {
          colorUtilities[`--${color}`] = colors[color];
        }
      });
      
      addUtilities({
        ':root': colorUtilities,
      });
    },
  ],
};
