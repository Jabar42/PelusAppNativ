// tailwind.config.js
const gluestackPlugin = require('@gluestack-ui/nativewind-utils/tailwind-plugin');

/** @type {import('tailwindcss').Config} */
module.exports = {
  // 1. MANTENER el preset de NativeWind
  presets: [require("nativewind/preset")], 
  
  // 2. AGREGAR el plugin de Gluestack
  plugins: [gluestackPlugin],

  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
    // 3. IMPORTANTE: Incluir los componentes de Gluestack para que Tailwind los escanee
    "./node_modules/@gluestack-ui/**/*.{js,jsx,ts,tsx}", 
  ],
  theme: {
    extend: {
      // Tus tokens actuales (colores, fuentes)
      colors: {
        primary: {
          500: '#4F46E5', // Color primario actual del proyecto
          // ...
        }
      },
      // Breakpoints para tu Sidebar/MobileMenu
      screens: {
        'md': '768px',
        'lg': '1024px',
      },
    },
  },
  // Habilitar dark mode via clase (compatible con Gluestack)
  darkMode: 'class',
}






