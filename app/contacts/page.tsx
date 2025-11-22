'use client';

import { useState, useMemo } from 'react';
import { Container, Typography, Box, Button, Alert, TextField, InputAdornment } from '@mui/material';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import Link from 'next/link';
import { useContacts } from '@/hooks/useContacts';
import { useDebounce } from '@/hooks/useDebounce';
import { EmptyState } from '@/components/shared/EmptyState';
import { ContactList } from '@/components/ContactList';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';

export default function ContactsPage() {
  const { contacts, isLoading, isError, error } = useContacts({ archived: false });
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Debounced search filter
  const filteredContacts = useMemo(() => {
    if (!debouncedSearchQuery.trim()) {
      return contacts;
    }
    const query = debouncedSearchQuery.toLowerCase();
    return contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(query) ||
        contact.profileNote?.toLowerCase().includes(query) ||
        contact.tags?.some((tag) => tag.name.toLowerCase().includes(query))
    );
  }, [contacts, debouncedSearchQuery]);

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Your Contacts
          </Typography>
        </Box>
        <LoadingSkeleton variant="card" count={5} />
      </Container>
    );
  }

  if (isError) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error?.message || 'Couldn\'t load contacts. Please try again.'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Your Contacts
        </Typography>
        <Button
          component={Link}
          href="/contacts/new"
          variant="contained"
          startIcon={<AddIcon />}
        >
          Add Contact
        </Button>
      </Box>
      {contacts.length > 0 && (
        <TextField
          fullWidth
          placeholder="Search contacts by name, notes, or tags..."
          variant="outlined"
          sx={{ mb: 3 }}
          onChange={(e) => setSearchQuery(e.target.value)}
          value={searchQuery}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      )}
      {contacts.length === 0 ? (
        <EmptyState
          title="No contacts yet"
          message="Start building your relationship network by adding your first contact."
          actionLabel="Add Your First Contact"
          actionHref="/contacts/new"
          icon={<AddIcon />}
        />
      ) : filteredContacts.length === 0 ? (
        <EmptyState
          title="No matches found"
          message={`No contacts match "${debouncedSearchQuery}". Try a different search term.`}
          actionLabel="Clear Search"
          onAction={() => setSearchQuery('')}
          icon={<SearchIcon />}
        />
      ) : (
        <ContactList contacts={filteredContacts} />
      )}
    </Container>
  );
}

