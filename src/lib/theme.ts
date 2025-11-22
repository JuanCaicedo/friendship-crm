import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#2196F3', // Friendly Blue
      light: '#64B5F6',
      dark: '#1976D2',
    },
    secondary: {
      main: '#64B5F6', // Light Blue
      light: '#90CAF9',
      dark: '#42A5F5',
    },
    background: {
      default: '#F5F9FF', // Light Blue-tinted
      paper: '#FFFFFF',
    },
    success: {
      main: '#4CAF50', // Green for healthy
    },
    warning: {
      main: '#FFC107', // Yellow for attention
    },
    error: {
      main: '#F44336', // Red for overdue
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          padding: '10px 24px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          },
        },
      },
    },
  },
});

