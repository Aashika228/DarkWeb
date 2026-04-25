/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['IBM Plex Mono', 'Courier New', 'monospace'],
        sans: ['Syne', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: '#080C10',
        surface: '#0D1117',
        border: '#1C2333',
        muted: '#8B949E',
        accent: '#F97316',
        'accent-dim': 'rgba(249,115,22,0.15)',
        danger: '#EF4444',
        warn: '#EAB308',
        safe: '#22C55E',
        glow: 'rgba(249,115,22,0.4)',
      },
      boxShadow: {
        glow: '0 0 20px rgba(249,115,22,0.25)',
        'glow-sm': '0 0 8px rgba(249,115,22,0.2)',
        card: '0 2px 20px rgba(0,0,0,0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan-line': 'scanLine 2s linear infinite',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
      },
      keyframes: {
        scanLine: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
