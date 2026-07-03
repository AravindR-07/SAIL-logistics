/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#5B5FED', // Vibrant blue-purple
          light: '#8B5CF6',
          dark: '#4A4ED4',
        },
        background: {
          page: '#F5F6FA',
          card: '#FFFFFF',
          sidebar: '#FFFFFF',
          input: '#FFFFFF',
        },
        text: {
          primary: '#1A1D2E',
          secondary: '#6E7490',
          muted: '#9CA3B8',
          inverse: '#FFFFFF',
        },
        semantic: {
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#3B82F6',
        },
        status: {
          earlyStage: '#C4B5FD',
          ongoing: '#818CF8',
          maintenance: '#5B5FED',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        'card': '16px',
        'sidebar': '24px',
        'xl': '20px',
        '2xl': '24px',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'elevated': '0 8px 24px rgba(0, 0, 0, 0.12)',
        'sidebar': '2px 0 12px rgba(0, 0, 0, 0.15)',
      }
    },
  },
  plugins: [],
}
