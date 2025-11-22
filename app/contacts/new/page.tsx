'use client';

import { Container, Typography } from '@mui/material';
import { ContactForm } from '@/components/ContactForm';

export default function NewContactPage() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Add New Contact
      </Typography>
      <ContactForm />
    </Container>
  );
}

