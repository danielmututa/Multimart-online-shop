/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      
      colors: {
        navbar: '#1E40AF',
        body: '#0F172A',
        buttons: '#F97316',
        primary: '#1E40AF',
        accent: '#F97316',
        'text-dark-gray': '#1F2937',
      },
      fontFamily: {
        montserrat: ["Montserrat-Regular", "sans-serif"],
        montserratBold: ["Montserrat-Bold", "sans-serif"],
      },
    },
  },
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Include all JavaScript, JSX, TypeScript, and TSX files in the src directory
    "./public/index.html", // Include your HTML files if necessary
  ],
 
  plugins: [],
}

