import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './notifications/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FFF9F9',
          100: '#FFF1F2',
          200: '#FFE4E6',
          300: '#FBCFE8',
          400: '#FB7185',
          500: '#F43F5E',
          600: '#E11D48',
          700: '#BE123C',
          800: '#9F1239',
          900: '#881337',
        },
        surface: {
          base: '#FFF9F9',
          card: '#FFFFFF',
          border: '#FFE4E6',
          muted: '#FFF1F2',
        },
        text: {
          heading: '#1F2937',
          body: '#4B5563',
          subtitle: '#9CA3AF',
          muted: '#D1D5DB',
        },
        chart: {
          1: '#FFF1F2',
          2: '#FECDD3',
          3: '#FDA4AF',
          4: '#FB7185',
          5: '#F43F5E',
          6: '#E11D48',
          7: '#BE123C',
        },
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        info: '#6366F1',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.03)',
        card: '0 10px 25px -5px rgba(225, 29, 72, 0.08), 0 4px 10px -4px rgba(225, 29, 72, 0.04)',
        sidebar: '4px 0 24px -2px rgba(0, 0, 0, 0.04)',
        button: '0 1px 3px 0 rgba(225, 29, 72, 0.2), 0 1px 2px -1px rgba(225, 29, 72, 0.12)',
      },
      borderRadius: {
        '2xl': '1.5rem',
        pill: '9999px',
      },
      backgroundImage: {
        'pink-gradient': 'linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 50%, #FECDD3 100%)',
        'accent-gradient': 'linear-gradient(135deg, #F43F5E 0%, #E11D48 50%, #BE123C 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
