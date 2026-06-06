/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          0: '#0a0a0f',
          1: '#12121a',
          2: '#1a1a27',
          3: '#222233',
          4: '#2a2a40',
        },
        accent: {
          DEFAULT: '#7c3aed',
          light: '#a855f7',
          glow: '#c084fc',
        },
        beat: {
          kick:    '#f59e0b',
          snare:   '#10b981',
          hihat:   '#06b6d4',
          melody:  '#8b5cf6',
          clap:    '#f43f5e',
          tom:     '#fb923c',
        },
      },
      boxShadow: {
        glow: '0 0 12px rgba(124,58,237,0.6)',
        'glow-sm': '0 0 6px rgba(124,58,237,0.4)',
        active: '0 0 16px rgba(168,85,247,0.8)',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
