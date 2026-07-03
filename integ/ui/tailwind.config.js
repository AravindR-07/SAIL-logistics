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
          DEFAULT: '#4F46E5', // brand
          light: '#6366F1',   // brandLight
          dark: '#4338CA',    // brandDark
        },
        background: {
          page: '#2D3561',
          card: '#FFFFFF',
          cardSecondary: '#F8F9FC',
          sidebar: '#1A1F3A',
        },
        text: {
          primary: '#1F2937',
          secondary: '#6B7280',
          tertiary: '#9CA3AF',
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
          maintenance: '#4F46E5',
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

