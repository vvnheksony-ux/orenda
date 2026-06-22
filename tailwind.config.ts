import type { Config } from "tailwindcss";

const config = {
  // STEP 1: Turn off the aggressive global element reset
  corePlugins: {
    preflight: false,
  },

  // STEP 2: Force Tailwind utility classes to have a unique prefix
  prefix: "tw-",

  content: [
    "./src/**/*.{js,ts,jsx,tsx}", // Wherever your custom code lives
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} as Config;

export default config;
