import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-be-vietnam-pro)', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#3B82F6', // Blue
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#1E40AF', // Dark Blue
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#10B981', // Green
          foreground: '#FFFFFF',
        },
        background: '#FFFFFF',
        foreground: '#1E293B',
        muted: {
          DEFAULT: '#F8FAFC',
          foreground: '#64748B',
        },
        border: '#E2E8F0',
        input: '#F1F5F9',
        ring: '#3B82F6',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      scale: {
        '102': '1.02',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-subtle': 'bounceSubtle 0.6s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
