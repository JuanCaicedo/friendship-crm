'use client';

import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navigation() {
  const pathname = usePathname();
  const isDashboardActive = pathname === '/';
  const isContactsActive = pathname?.startsWith('/contacts');

  return (
    <AppBar position="static" sx={{ backgroundColor: 'primary.main', boxShadow: 1 }}>
      <Toolbar>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 0, 
            mr: 4,
            color: 'white',
            fontWeight: 600,
          }}
        >
          💝 Friendship CRM
        </Typography>
        <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
          <Button
            component={Link}
            href="/"
            sx={{
              color: isDashboardActive ? 'white' : 'rgba(255, 255, 255, 0.7)',
              backgroundColor: isDashboardActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
              fontWeight: isDashboardActive ? 600 : 400,
              '&:hover': {
                backgroundColor: isDashboardActive ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)',
                color: 'white',
              },
            }}
          >
            Dashboard
          </Button>
          <Button
            component={Link}
            href="/contacts"
            sx={{
              color: isContactsActive ? 'white' : 'rgba(255, 255, 255, 0.7)',
              backgroundColor: isContactsActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
              fontWeight: isContactsActive ? 600 : 400,
              '&:hover': {
                backgroundColor: isContactsActive ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)',
                color: 'white',
              },
            }}
          >
            Contacts
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

