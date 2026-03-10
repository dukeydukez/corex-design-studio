module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        corex: {
          primary: '#3B82F6',
          secondary: '#10B981',
          accent: '#F59E0B',
          dark: '#1F2937',
          light: '#F9FAFB',
        },
      },
      spacing: {
        gutter: '1rem',
      },
      zIndex: {
        dropdown: '1000',
        sticky: '1020',
        fixed: '1030',
        modal: '1040',
        popover: '1050',
        tooltip: '1070',
      },
    },
  },
  plugins: [],
};
