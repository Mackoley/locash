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
        cyber: {
          darkest: '#050811',
          bg: '#080d1a',
          surface: '#0d1527',
          card: 'rgba(13, 21, 39, 0.75)',
          border: 'rgba(30, 58, 102, 0.45)',
          borderHover: 'rgba(0, 242, 254, 0.4)',
          cyan: '#00f2fe',
          blue: '#1e88e5',
          blueGlow: '#0284c7',
          emerald: '#00f0aa',
          amber: '#f59e0b',
          purple: '#a855f7',
          red: '#ef4444',
          muted: '#64748b',
          text: '#e2e8f0',
          textMuted: '#94a3b8',
        }
      },
      boxShadow: {
        'neon-cyan': '0 0 15px rgba(0, 242, 254, 0.35)',
        'neon-blue': '0 0 20px rgba(30, 136, 229, 0.35)',
        'neon-emerald': '0 0 15px rgba(0, 240, 170, 0.35)',
        'neon-amber': '0 0 15px rgba(245, 158, 11, 0.35)',
        'neon-purple': '0 0 15px rgba(168, 85, 247, 0.35)',
        'neon-red': '0 0 15px rgba(239, 68, 68, 0.35)',
        'cockpit-panel': '0 8px 32px 0 rgba(0, 0, 0, 0.55)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 2.5s infinite ease-in-out',
        'beam-pulse': 'beamPulse 3s infinite ease-in-out',
        'float': 'float 4s infinite ease-in-out',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.08)' },
        },
        beamPulse: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.85' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
