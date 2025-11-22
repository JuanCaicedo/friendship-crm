import { AppBar, Toolbar, Button, Box, Typography } from '@mui/material';
import { Home, People } from '@mui/icons-material';

interface NavigationProps {
  currentView: string;
  onNavigate: (view: 'dashboard' | 'contacts') => void;
}

export default function Navigation({ currentView, onNavigate }: NavigationProps) {
  return (
    <AppBar position="static" sx={{ bgcolor: 'white', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)' }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, color: 'primary.main' }}>
          💝 Friendship CRM
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            startIcon={<Home />}
            onClick={() => onNavigate('dashboard')}
            sx={{
              color: currentView === 'dashboard' ? 'primary.main' : 'text.secondary',
              bgcolor: currentView === 'dashboard' ? 'rgba(33, 150, 243, 0.08)' : 'transparent',
            }}
          >
            Dashboard
          </Button>
          <Button
            startIcon={<People />}
            onClick={() => onNavigate('contacts')}
            sx={{
              color: currentView === 'contacts' || currentView === 'contact-detail' ? 'primary.main' : 'text.secondary',
              bgcolor: currentView === 'contacts' || currentView === 'contact-detail' ? 'rgba(33, 150, 243, 0.08)' : 'transparent',
            }}
          >
            Contacts
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}