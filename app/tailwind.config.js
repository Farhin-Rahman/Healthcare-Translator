// tailwind.config.js
module.exports = {
    content: [
      // These paths tell Tailwind where to scan for classes
      './app/**/*.{js,ts,jsx,tsx}',    // All files in /app
      './components/**/*.{js,ts,jsx,tsx}' // All files in /components
    ],
    theme: {
      extend: {}, // You can customize colors/fonts here later
    },
    plugins: [], // Add Tailwind plugins if needed
  }