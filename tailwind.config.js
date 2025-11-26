/** @type {import('tailwindcss').Config} */
module.exports = {
  // Importante: Esto busca clases en todos tus HTML y JS (incluyendo subcarpetas)
  content: ["./**/*.{html,js}"], 
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans"', 'sans-serif'],
        headings: ['"Montserrat"', 'sans-serif'],
      },
      colors: {
        gob: {
          guinda: '#9D2449',
          guindaDark: '#611232',
          oro: '#B38E5D',
          oroLight: '#DDC9A3',
          gris: '#545454',
          plata: '#98989A',
          verde: '#13322B',
          verdeDark: '#0C231E',
          fondo: '#F5F5F5'
        }
      }
    }
  },
  plugins: [],
}