/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#E61E25',
        secondary: '#222222',
        tertiary: '#FFC107',
        neutral: '#121212',
        success: '#16A34A',
        warning: '#F59E0B',
        danger: '#DC2626',
        info: '#2563EB',
      },
    },
  },
  plugins: [],
}
