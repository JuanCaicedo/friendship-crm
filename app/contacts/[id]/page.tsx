'use client';

import React, { useState } from 'react';
import { Container, Typography, Box, Button, Card, CardContent, Chip, Alert, Divider, List, ListItem, ListItemText } from '@mui/material';
import { Edit as EditIcon, Archive as ArchiveIcon, Message as MessageIcon, Phone as PhoneIcon, Group as GroupIcon, CalendarToday as CalendarIcon } from '@mui/icons-material';
import Link from 'next/link';
import { format } from 'date-fns';
import { useContact } from '@/hooks/useContacts';
import { useHealth } from '@/hooks/useHealth';
import { useInteractions } from '@/hooks/useInteractions';
import { useReminders } from '@/hooks/useReminders';
import { useArchiveContact } from '@/hooks/useArchiveContact';
import { HealthIndicator } from '@/components/shared/HealthIndicator';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { useParams, useRouter } from 'next/navigation';

export default function ContactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const { contact, isLoading, isError: contactError, error: contactErrorObj, mutate: mutateContact } = useContact(id);
  const { health, isError: healthError } = useHealth(id);
  const { interactions, isLoading: interactionsLoading } = useInteractions({ contactId: id, orderBy: 'timestamp', order: 'desc', limit: 10 });
  const { reminders, isLoading: remindersLoading } = useReminders({ contactId: id, status: 'pending' });
  const { archiveContact, isArchiving, error: archiveError } = useArchiveContact();
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <LoadingSkeleton variant="text" count={1} />
        <Box sx={{ mt: 3 }}>
          <LoadingSkeleton variant="card" count={1} />
        </Box>
      </Container>
    );
  }

  if (contactError) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {contactErrorObj?.message || 'Couldn\'t load contact. Please try again.'}
        </Alert>
      </Container>
    );
  }

  if (!contact) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h5">Contact not found</Typography>
      </Container>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button component={Link} href="/contacts" sx={{ mb: 2 }}>
        ← Back to Contacts
      </Button>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: 'primary.main',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: '2rem',
              }}
            >
              {getInitials(contact.name)}
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h4" component="h1">
                {contact.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                {health && !healthError && <HealthIndicator status={health.status} size="large" />}
                {healthError && (
                  <Typography variant="body2" color="error">
                    Couldn't load health status
                  </Typography>
                )}
                {contact.tags && contact.tags.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 0.5, ml: 1 }}>
                    {contact.tags.map((tag) => (
                      <Chip
                        key={tag.id}
                        label={tag.name}
                        sx={{
                          backgroundColor: 'rgba(100, 181, 246, 0.15)',
                          color: 'secondary.dark',
                        }}
                      />
                    ))}
                  </Box>
                )}
              </Box>
              {contact.birthday && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Birthday: {contact.birthday}
                </Typography>
              )}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              component={Link}
              href={`/interactions/${contact.id}`}
            >
              Log Interaction
            </Button>
            <Button
              variant="outlined"
              component={Link}
              href={`/contacts/${contact.id}/edit`}
              startIcon={<EditIcon />}
            >
              Edit
            </Button>
            {!showArchiveConfirm ? (
              <Button
                variant="outlined"
                color="error"
                startIcon={<ArchiveIcon />}
                onClick={() => setShowArchiveConfirm(true)}
              >
                Archive
              </Button>
            ) : (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<ArchiveIcon />}
                  onClick={async () => {
                    try {
                      await archiveContact(id);
                    } catch (error) {
                      console.error('Error archiving contact:', error);
                      setShowArchiveConfirm(false);
                    }
                  }}
                  disabled={isArchiving}
                >
                  {isArchiving ? 'Archiving...' : 'Confirm Archive'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setShowArchiveConfirm(false)}
                  disabled={isArchiving}
                >
                  Cancel
                </Button>
              </Box>
            )}
            {archiveError && (
              <Alert severity="error" sx={{ mt: 1 }}>
                {archiveError.message || 'Failed to archive contact. Please try again.'}
              </Alert>
            )}
          </Box>
        </CardContent>
      </Card>

      {contact.profileNote && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              About {contact.name}
            </Typography>
            <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
              "{contact.profileNote}"
            </Typography>
          </CardContent>
        </Card>
      )}

      {reminders.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Reminders
            </Typography>
            <List>
              {reminders.map((reminder) => (
                <ListItem key={reminder.id} sx={{ px: 0 }}>
                  <CalendarIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  <ListItemText
                    primary={format(new Date(reminder.dueDate * 1000), 'MMMM d, yyyy')}
                    secondary={reminder.note || 'No note'}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Interactions
          </Typography>
          {interactionsLoading ? (
            <LoadingSkeleton variant="list" count={3} />
          ) : interactions.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
              No interactions yet. Log your first interaction to start tracking your relationship!
            </Typography>
          ) : (
            <List>
              {interactions.map((interaction, index) => (
                <React.Fragment key={interaction.id}>
                  <ListItem sx={{ px: 0 }}>
                    {interaction.type === 'text' && <MessageIcon sx={{ mr: 2, color: 'text.secondary' }} />}
                    {interaction.type === 'call' && <PhoneIcon sx={{ mr: 2, color: 'text.secondary' }} />}
                    {interaction.type === 'hangout' && <GroupIcon sx={{ mr: 2, color: 'text.secondary' }} />}
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                            {interaction.type}
                          </Typography>
                          <Chip
                            label={format(new Date(interaction.timestamp * 1000), 'MMM d, yyyy')}
                            size="small"
                            sx={{ height: 20 }}
                          />
                        </Box>
                      }
                      secondary={interaction.notes || 'No notes'}
                    />
                  </ListItem>
                  {index < interactions.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}

