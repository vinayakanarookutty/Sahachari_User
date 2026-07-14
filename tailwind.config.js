/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        outfit: ["Outfit_400Regular"],
        "outfit-medium": ["Outfit_600SemiBold"],
        "outfit-bold": ["Outfit_700Bold"],
        malayalam: ["NotoSansMalayalam_400Regular"],
        "malayalam-bold": ["NotoSansMalayalam_700Bold"],
      }
    },
  },
  plugins: [],
};
