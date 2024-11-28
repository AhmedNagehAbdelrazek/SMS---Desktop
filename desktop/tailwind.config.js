/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx,ejs}',
    './release/**/*.{js,jsx,ts,tsx,ejs}',
    './.erb/**/*.{js,jsx,ts,tsx,ejs}',
  ],
  theme: {
    extend: {
      colors: {
        // macOS-inspired colors
        background: '#f5f5f7', // Light gray for the background
        surface: '#ffffff', // White for cards or containers
        textPrimary: '#1d1d1f', // Dark gray for primary text
        textSecondary: '#6e6e73', // Light gray for secondary text
        accent: '#007aff', // macOS blue for accents
        accentHover: '#005bb5', // Darker blue for hover
        danger: '#ff3b30', // macOS red for errors
        warning: '#ffcc00', // Yellow for warnings
        success: '#34c759', // Green for success
        border: '#d1d1d6', // Light gray for borders
        'macos-light-gray': '#f5f5f7', // macOS background gray
        'macos-text': '#1c1c1e', // macOS text color
        'macos-icon': '#007aff', // macOS icon blue
        'macos-selected': '#007aff', // macOS selected item background
        'macos-hover': '#e5e5ea', // macOS hover gray
      },
      borderRadius: {
        md: '8px', // Slightly rounded corners
        lg: '12px', // More rounded corners for macOS-like buttons
        xl: '16px', // Larger radii for modals or special elements
      },
      spacing: {
        72: '18rem', // Add larger spacings for macOS-like spacing
        84: '21rem',
        96: '24rem',
      },
      boxShadow: {
        // macOS-like shadows
        light: '0 2px 4px rgba(0, 0, 0, 0.1)',
        medium: '0 4px 8px rgba(0, 0, 0, 0.15)',
        heavy: '0 8px 16px rgba(0, 0, 0, 0.2)',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};