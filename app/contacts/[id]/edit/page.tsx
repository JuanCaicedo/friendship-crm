'use client';

import { Container, Typography, CircularProgress, Alert } from '@mui/material';
import { useContact } from '@/hooks/useContacts';
import { ContactForm } from '@/components/ContactForm';
import { useParams } from 'next/navigation';

export default function EditContactPage() {
  const params = useParams();
  const id = Number(params.id);
  const { contact, isLoading, isError, error } = useContact(id);

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (isError) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error?.message || 'Couldn\'t load contact. Please try again.'}
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

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Edit Contact
      </Typography>
      <ContactForm contact={contact} />
    </Container>
  );
}

