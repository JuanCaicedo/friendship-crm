import { useState } from 'react';
import { Box, Typography, Button, TextField, InputAdornment, Card, CardContent, Avatar, Chip, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { Search, Add, PersonAdd } from '@mui/icons-material';
import { Contact } from '../App';
import HealthIndicator from './HealthIndicator';

interface ContactListProps {
  contacts: Contact[];
  onNavigate: (view: 'add-contact') => void;
  onSelectContact: (contactId: string) => void;
}

export default function ContactList({ contacts, onNavigate, onSelectContact }: ContactListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Get all unique tags
  const allTags = Array.from(new Set(contacts.flatMap(c => c.tags)));

  // Filter and sort contacts
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contact.profileNote.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = filterTag === 'all' || contact.tags.includes(filterTag);
    return matchesSearch && matchesTag;
  });

  const sortedContacts = [...filteredContacts].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'health') {
      const healthOrder = { overdue: 3, attention: 2, healthy: 1 };
      return healthOrder[b.health] - healthOrder[a.health];
    } else if (sortBy === 'recent') {
      if (!a.lastInteraction) return 1;
      if (!b.lastInteraction) return -1;
      return new Date(b.lastInteraction).getTime() - new Date(a.lastInteraction).getTime();
    }
    return 0;
  });

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatLastInteraction = (date?: string) => {
    if (!date) return 'No interactions yet';
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return `${diff} days ago`;
    if (diff < 30) return `${Math.floor(diff / 7)} weeks ago`;
    return `${Math.floor(diff / 30)} months ago`;
  };

  if (contacts.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <PersonAdd sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
        <Typography variant="h4" gutterBottom sx={{ color: 'primary.main' }}>
          No Contacts Yet
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary', maxWidth: 500, mx: 'auto' }}>
          Start building your network of meaningful relationships. Add your first contact to begin nurturing connections that matter.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<Add />}
          onClick={() => onNavigate('add-contact')}
        >
          Add Your First Contact
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ color: 'primary.main' }}>
          Your Contacts
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => onNavigate('add-contact')}
        >
          Add Contact
        </Button>
      </Box>

      {/* Search and Filter */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search contacts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ flex: 1, minWidth: 250 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Filter by Tag</InputLabel>
          <Select
            value={filterTag}
            label="Filter by Tag"
            onChange={(e) => setFilterTag(e.target.value)}
          >
            <MenuItem value="all">All Tags</MenuItem>
            {allTags.map(tag => (
              <MenuItem key={tag} value={tag}>{tag}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortBy}
            label="Sort By"
            onChange={(e) => setSortBy(e.target.value)}
          >
            <MenuItem value="name">Name</MenuItem>
            <MenuItem value="health">Health Status</MenuItem>
            <MenuItem value="recent">Recent Activity</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Contact Cards */}
      {sortedContacts.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            No contacts match your search. Try adjusting your filters.
          </Typography>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {sortedContacts.map((contact) => (
            <Card
              key={contact.id}
              sx={{
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
                  transition: 'box-shadow 0.3s ease',
                }
              }}
              onClick={() => onSelectContact(contact.id)}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                    {getInitials(contact.name)}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="h6">{contact.name}</Typography>
                      <HealthIndicator status={contact.health} />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5, mb: 1, flexWrap: 'wrap' }}>
                      {contact.tags.map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(100, 181, 246, 0.15)',
                            color: 'secondary.main',
                          }}
                        />
                      ))}
                    </Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                      {contact.profileNote}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                      Last contact: {formatLastInteraction(contact.lastInteraction)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}