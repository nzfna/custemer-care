/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        deep:     '#0a0a0f',
        surface:  '#12121a',
        elevated: '#1a1a25',
        bright:   '#e2e8f0',
        dim:      '#94a3b8',
        faint:    '#64748b',
        indigo:   '#6366f1',
        cyan:     '#22d3ee',
        emerald:  '#34d399',
        amber:    '#fbbf24',
        rose:     '#fb7185',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        'sm':   '8px',
        'md':   '12px',
        'lg':   '16px',
        'xl':   '20px',
      },
      transitionDuration: {
        '250': '250ms',
      },
      boxShadow: {
        'card':         '0 4px 6px -1px rgba(0,0,0,0.3), 0 2px 4px -1px rgba(0,0,0,0.15)',
        'hover':        '0 10px 15px -3px rgba(0,0,0,0.4), 0 4px 6px -2px rgba(0,0,0,0.2)',
        'modal':        '0 25px 50px -12px rgba(0,0,0,0.5)',
        'glow-indigo':  '0 0 20px rgba(99,102,241,0.15), 0 0 40px rgba(99,102,241,0.05)',
        'glow-rose':    '0 0 20px rgba(251,113,133,0.15)',
        'glow-cyan':    '0 0 20px rgba(34,211,238,0.15)',
        'glow-emerald': '0 0 20px rgba(52,211,153,0.15)',
        'glow-amber':   '0 0 20px rgba(251,191,36,0.15)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}