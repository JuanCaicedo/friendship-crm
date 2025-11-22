import { useState } from 'react';
import { Box, Typography, Button, Card, CardContent, Avatar, Chip, Divider, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { Edit, Archive, Message, Cake, Phone, Textsms, Group, ArrowBack, Add, Notifications } from '@mui/icons-material';
import { Contact, Interaction, Reminder } from '../App';
import HealthIndicator from './HealthIndicator';

interface ContactDetailProps {
  contact: Contact;
  interactions: Interaction[];
  reminders: Reminder[];
  onNavigate: (view: 'contacts') => void;
  onEdit: () => void;
  onArchive: (contactId: string) => void;
  onLogInteraction: () => void;
  onAddReminder: (reminder: Omit<Reminder, 'id'>) => void;
}

export default function ContactDetail({ contact, interactions, reminders, onNavigate, onEdit, onArchive, onLogInteraction, onAddReminder }: ContactDetailProps) {
  const [reminderDialog, setReminderDialog] = useState(false);
  const [reminderMessage, setReminderMessage] = useState('');
  const [reminderDate, setReminderDate] = useState('');

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <Textsms sx={{ fontSize: 20, color: 'secondary.main' }} />;
      case 'call':
        return <Phone sx={{ fontSize: 20, color: 'secondary.main' }} />;
      case 'hangout':
        return <Group sx={{ fontSize: 20, color: 'secondary.main' }} />;
      default:
        return null;
    }
  };

  const getInteractionLabel = (type: string) => {
    switch (type) {
      case 'text':
        return 'Text';
      case 'call':
        return 'Call';
      case 'hangout':
        return 'Hangout';
      default:
        return type;
    }
  };

  const sortedInteractions = [...interactions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleCreateReminder = () => {
    if (reminderMessage && reminderDate) {
      onAddReminder({
        contactId: contact.id,
        message: reminderMessage,
        date: reminderDate,
      });
      setReminderDialog(false);
      setReminderMessage('');
      setReminderDate('');
    }
  };

  return (
    <Box>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => onNavigate('contacts')}
        sx={{ mb: 2, color: 'text.secondary' }}
      >
        Back to Contacts
      </Button>

      {/* Header Card */}
      <Card sx={{ mb: 3, p: 3 }}>
        <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 80, height: 80 }}>
            {getInitials(contact.name)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="h4">{contact.name}</Typography>
              <HealthIndicator status={contact.health} size="medium" />
            </Box>
            {contact.birthday && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Cake sx={{ fontSize: 20, color: 'secondary.main' }} />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {formatDate(contact.birthday)}
                </Typography>
              </Box>
            )}
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {contact.tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  sx={{
                    bgcolor: 'rgba(100, 181, 246, 0.15)',
                    color: 'secondary.main',
                  }}
                />
              ))}
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Message />}
            onClick={onLogInteraction}
          >
            Log Interaction
          </Button>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={onEdit}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            startIcon={<Notifications />}
            onClick={() => setReminderDialog(true)}
          >
            Create Reminder
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Archive />}
            onClick={() => {
              if (window.confirm(`Are you sure you want to archive ${contact.name}?`)) {
                onArchive(contact.id);
              }
            }}
          >
            Archive
          </Button>
        </Box>
      </Card>

      {/* Profile Note */}
      <Card sx={{ mb: 3, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          About {contact.name}
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
          "{contact.profileNote}"
        </Typography>
      </Card>

      {/* Reminders */}
      {reminders.length > 0 && (
        <Card sx={{ mb: 3, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Reminders
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {reminders
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map((reminder) => (
                <Box key={reminder.id} sx={{ p: 2, bgcolor: 'rgba(78, 205, 196, 0.05)', borderRadius: 2 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {formatDate(reminder.date)}
                  </Typography>
                  <Typography variant="body1">
                    {reminder.message}
                  </Typography>
                </Box>
              ))}
          </Box>
        </Card>
      )}

      {/* Interaction Timeline */}
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Interaction History
        </Typography>
        {sortedInteractions.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
              No interactions logged yet. Start by logging your first interaction!
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              onClick={onLogInteraction}
            >
              Log First Interaction
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            {sortedInteractions.map((interaction, index) => (
              <Box key={interaction.id}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <Box sx={{ 
                    mt: 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    bgcolor: 'rgba(78, 205, 196, 0.1)',
                  }}>
                    {getInteractionIcon(interaction.type)}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Chip 
                        label={getInteractionLabel(interaction.type)}
                        size="small"
                        sx={{ bgcolor: 'secondary.main', color: 'white' }}
                      />
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {formatDate(interaction.date)}
                      </Typography>
                    </Box>
                    {interaction.notes && (
                      <Typography variant="body2" sx={{ color: 'text.primary' }}>
                        {interaction.notes}
                      </Typography>
                    )}
                  </Box>
                </Box>
                {index < sortedInteractions.length - 1 && (
                  <Divider sx={{ my: 2 }} />
                )}
              </Box>
            ))}
          </Box>
        )}
      </Card>

      {/* Create Reminder Dialog */}
      <Dialog open={reminderDialog} onClose={() => setReminderDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create a Reminder</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Reminder message"
              placeholder={`e.g., Check in with ${contact.name} about their project`}
              value={reminderMessage}
              onChange={(e) => setReminderMessage(e.target.value)}
              fullWidth
              multiline
              rows={2}
            />
            <TextField
              label="Reminder date"
              type="date"
              value={reminderDate}
              onChange={(e) => setReminderDate(e.target.value)}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReminderDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateReminder} 
            variant="contained" 
            disabled={!reminderMessage || !reminderDate}
          >
            Create Reminder
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}