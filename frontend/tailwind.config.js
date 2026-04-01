/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#CC0000',
          dark: '#A80000',
          light: '#FF1A1A',
        },
        background: {
          dark: '#1A1A1A',
          light: '#FFFFFF',
          warm: '#F9F7F4',
        },
        text: {
          primary: '#1A1A1A',
          secondary: '#555555',
          'on-dark': '#F5F5F5',
        },
        accent: {
          gold: '#C9A84C',
        },
        whatsapp: '#25D366',
        secondary: '#222222',
        tertiary: '#FFC107',
        neutral: '#121212',
        success: '#16A34A',
        warning: '#F59E0B',
        danger: '#DC2626',
        info: '#2563EB',
      },
      fontFamily: {
        display: ['"Barlow Condensed"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        ui: ['Barlow', 'sans-serif'],
        'arabic-display': ['"Noto Kufi Arabic"', 'sans-serif'],
        'arabic-body': ['"Noto Sans Arabic"', 'sans-serif'],
      },
      fontSize: {
        'hero-desktop': ['clamp(80px, 10vw, 120px)', { lineHeight: '0.88', letterSpacing: '-0.02em' }],
        'hero-mobile': ['clamp(48px, 12vw, 72px)', { lineHeight: '0.92', letterSpacing: '-0.02em' }],
      },
      letterSpacing: {
        ui: '0.08em',
      },
      lineHeight: {
        'tight-display': '0.88',
        body: '1.7',
        arabic: '1.9',
      },
      transitionTimingFunction: {
        wak: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
      animation: {
        'pulse-whatsapp': 'pulse-whatsapp 3s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
        'slide-up': 'slideUp 0.4s ease-out',
        'fade-in': 'fadeIn 0.6s ease-out',
      },
      keyframes: {
        'pulse-whatsapp': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.05)', opacity: '0.9' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      backgroundImage: {
        grain: "url('/textures/grain.png')",
        'shimmer-gradient': 'linear-gradient(90deg, transparent, rgba(204,0,0,0.1), transparent)',
      },
      boxShadow: {
        'red-glow': '0 4px 20px rgba(204, 0, 0, 0.3)',
        card: '0 10px 40px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 20px 60px rgba(0, 0, 0, 0.15)',
      },
      perspective: {
        800: '800px',
      },
    },
  },
  plugins: [require('tailwindcss-rtl')],
}
