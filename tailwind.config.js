/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Semantic tokens — driven by CSS custom properties
        bg: {
          DEFAULT: 'var(--bg)',
          subtle: 'var(--bg-subtle)',
          inset: 'var(--bg-inset)',
          overlay: 'var(--bg-overlay)',
        },
        surface: {
          DEFAULT: 'var(--surface)',
          hover: 'var(--surface-hover)',
          active: 'var(--surface-active)',
        },
        fg: {
          DEFAULT: 'var(--fg)',
          secondary: 'var(--fg-secondary)',
          muted: 'var(--fg-muted)',
          onAccent: 'var(--fg-on-accent)',
        },
        bd: {
          DEFAULT: 'var(--border)',
          subtle: 'var(--border-subtle)',
        },
        // Fixed brand colors
        primary: '#6366f1',
        secondary: '#a855f7',
        accent: '#f43f5e',
        exhaust: {
          done: '#10b981',
          pending: '#3f3f46',
          omission: '#f59e0b',
          unknown: '#71717a'
        }
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
