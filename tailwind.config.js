/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './dashboard-module/**/*.{html,js}',
    './calendario-module/**/*.{html,js}',
    './expediente-module/**/*.{html,js}',
    './usuario-module/**/*.{html,js}',
    './notificaciones-module/**/*.{html,js}',
    './agenda-general-module/**/*.{html,js}',
    './global/**/*.{html,js}'
  ],
  theme: {
    extend: {
      colors: {
        // Paleta GOB.MX V3
        'gob-guinda': '#9D2449',
        'gob-guindaDark': '#691736',
        'gob-oro': '#B38E5D',
        'gob-oroLight': '#DDC9A3',
        'gob-verde': '#13322B',
        'gob-verdeDark': '#0C231E',
        'gob-verdeClaro': '#7FA59B',
        'gob-gris': '#545454',
        'gob-grisClaro': '#A3A3A3',
        'gob-plata': '#98989A',
        'gob-fondo': '#F5F5F5',
        
        // Colores de estado
        'estado-activo': '#34D399',    // Verde success
        'estado-pendiente': '#FBBF24', // Amarillo warning
        'estado-cerrado': '#EF4444',   // Rojo error
        'estado-pausado': '#A78BFA',   // Morado info
      },
      fontFamily: {
        'headings': ['Montserrat', 'sans-serif'],
        'sans': ['Noto Sans', 'sans-serif'],
      },
      boxShadow: {
        'gob': '0 2px 4px rgba(157, 36, 73, 0.1)',
        'gob-lg': '0 4px 6px rgba(157, 36, 73, 0.15)',
      },
      screens: {
        'xs': '475px',
      },
    },
  },
  plugins: [],
  safelist: [
    'bg-estado-activo',
    'bg-estado-pendiente',
    'bg-estado-cerrado',
    'bg-estado-pausado',
    'text-estado-activo',
    'text-estado-pendiente',
    'text-estado-cerrado',
    'text-estado-pausado',
    'border-estado-activo',
    'border-estado-pendiente',
    'border-estado-cerrado',
    'border-estado-pausado',
    // Clases dinámicas para charts
    'h-[350px]',
    'h-[400px]',
    'min-h-[350px]',
    'min-h-[400px]',
  ],
}
