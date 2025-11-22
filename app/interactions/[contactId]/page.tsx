'use client';

import { Container, Typography, Box, Button, TextField, Alert, CircularProgress } from '@mui/material';
import { useContact } from '@/hooks/useContacts';
import { useLogInteraction } from '@/hooks/useInteractionMutations';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { InteractionType } from '@/lib/models';

export default function LogInteractionPage() {
  const params = useParams();
  const router = useRouter();
  const contactId = Number(params.contactId);
  const { contact, isLoading } = useContact(contactId);

  const [type, setType] = useState<InteractionType>('text');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const { logInteraction, isLogging, error: logError } = useLogInteraction();

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const timestamp = Math.floor(new Date(date).getTime() / 1000);
      await logInteraction({
        contactId,
        type,
        timestamp,
        notes: notes || undefined,
      });
      router.push(`/contacts/${contactId}`);
    } catch (err) {
      // Error is handled by SWR
      console.error('Failed to log interaction:', err);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Log Interaction with {contact.name}
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600, mt: 2 }}>
        {logError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {logError.message || 'Couldn\'t log interaction. Please try again.'}
          </Alert>
        )}

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Interaction Type
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant={type === 'text' ? 'contained' : 'outlined'}
              onClick={() => setType('text')}
            >
              Text
            </Button>
            <Button
              variant={type === 'call' ? 'contained' : 'outlined'}
              onClick={() => setType('call')}
            >
              Call
            </Button>
            <Button
              variant={type === 'hangout' ? 'contained' : 'outlined'}
              onClick={() => setType('hangout')}
            >
              Hangout
            </Button>
          </Box>
        </Box>

        <TextField
          fullWidth
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          label="Notes"
          multiline
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          sx={{ mb: 2 }}
        />

        <Button type="submit" variant="contained" disabled={isLogging} fullWidth>
          {isLogging ? 'Logging...' : 'Log Interaction'}
        </Button>
      </Box>
    </Container>
  );
}

