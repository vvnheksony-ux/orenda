// /** @type {import('tailwindcss').Config} */
// module.exports = {
//   content: [
//     // Look into your Next.js app directory
//     './app/**/*.{js,ts,jsx,tsx,mdx}',
//     './src/**/*.{js,ts,jsx,tsx,mdx}', // Add this if your code lives inside a /src folder
    
//     // Explicitly add wherever you placed this custom component file
//     './components/**/*.{js,ts,jsx,tsx}',
//     './collections/**/*.{js,ts,jsx,tsx}',
//   ],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// }

/** @type {import('tailwindcss').Config} */
module.exports = {
  // STEP 1: Turn off the aggressive global element reset
  corePlugins: {
    preflight: false, 
  },
  
  // STEP 2: Force Tailwind utility classes to have a unique prefix
  prefix: 'tw-', 

  content: [
    "./src/**/*.{js,ts,jsx,tsx}", // Wherever your custom code lives
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}