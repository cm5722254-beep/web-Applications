/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // CHEATZ ANIME Brand Colors (dynamic theme-aware)
        brand: {
          bg:       'var(--bg)',
          surface:  'var(--surface)',
          border:   'var(--border)',
          muted:    'var(--muted)',
          text:     'var(--text)',
          purple:   'var(--purple)',
          violet:   'var(--violet)',
          glow:     'var(--glow)',
          premium:  '#f59e0b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'var(--font-sans)', 'Kantumruy Pro', 'Noto Sans Khmer', 'system-ui', 'sans-serif'],
        khmer: ['Kantumruy Pro', 'Noto Sans Khmer', 'sans-serif'],
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease-in-out',
        'slide-up':   'slideUp 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer':    'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn:     { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp:    { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        pulseGlow:  { '0%, 100%': { boxShadow: '0 0 10px rgba(139, 92, 246, 0.3)' }, '50%': { boxShadow: '0 0 30px rgba(139, 92, 246, 0.6)' } },
        shimmer:    { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
