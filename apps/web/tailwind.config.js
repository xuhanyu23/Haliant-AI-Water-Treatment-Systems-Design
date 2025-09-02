/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: { 
          primary: '#0EA5E9', 
          accent: '#10B981' 
        } // sky-500 / emerald-500
      }
    },
  },
  plugins: [],
}
