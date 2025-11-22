'use client';

import { Box, Card, CardContent, Typography, Chip } from '@mui/material';
import Link from 'next/link';
import { Contact } from '@/lib/models';
import { HealthIndicator } from './shared/HealthIndicator';
import { useHealth } from '@/hooks/useHealth';

interface ContactListProps {
  contacts: Contact[];
}

export function ContactList({ contacts }: ContactListProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {contacts.map((contact) => (
        <ContactCard key={contact.id} contact={contact} />
      ))}
    </Box>
  );
}

function ContactCard({ contact }: { contact: Contact }) {
  const { health, isError: healthError } = useHealth(contact.id);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card
      component={Link}
      href={`/contacts/${contact.id}`}
      sx={{
        textDecoration: 'none',
        color: 'inherit',
        '&:hover': {
          boxShadow: 4,
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              backgroundColor: 'primary.main',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
            }}
          >
            {getInitials(contact.name)}
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="h3">
              {contact.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              {health && !healthError && <HealthIndicator status={health.status} />}
              {contact.tags && contact.tags.length > 0 && (
                <Box sx={{ display: 'flex', gap: 0.5, ml: 1 }}>
                  {contact.tags.map((tag) => (
                    <Chip
                      key={tag.id}
                      label={tag.name}
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(100, 181, 246, 0.15)',
                        color: 'secondary.dark',
                      }}
                    />
                  ))}
                </Box>
              )}
            </Box>
            {contact.profileNote && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {contact.profileNote.slice(0, 100)}
                {contact.profileNote.length > 100 ? '...' : ''}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

