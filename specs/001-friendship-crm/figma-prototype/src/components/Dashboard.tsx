import { useState } from 'react';
import { Box, Typography, Button, Card, CardContent, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Refresh } from '@mui/icons-material';
import { Contact, Interaction, Reminder } from '../App';
import HealthIndicator from './HealthIndicator';
import RecommendationCard from './RecommendationCard';

interface DashboardProps {
  contacts: Contact[];
  interactions: Interaction[];
  reminders: Reminder[];
  onNavigate: (view: 'add-contact') => void;
  onLogInteraction: (contactId: string) => void;
  onAddReminder: (reminder: Omit<Reminder, 'id'>) => void;
  onViewContact: (contactId: string) => void;
}

export default function Dashboard({ contacts, interactions, reminders, onNavigate, onLogInteraction, onAddReminder, onViewContact }: DashboardProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [snoozeDialog, setSnoozeDialog] = useState<{ open: boolean; contactId: string | null }>({ open: false, contactId: null });

  // Calculate recommendations based on health status
  const getRecommendations = () => {
    const activeContacts = contacts.filter(c => !c.archived);
    const needsAttention = activeContacts.filter(c => c.health === 'overdue' || c.health === 'attention');
    
    // Sort by health priority (overdue first, then attention)
    const sorted = needsAttention.sort((a, b) => {
      const priority = { overdue: 3, attention: 2, healthy: 1 };
      return priority[b.health] - priority[a.health];
    });

    return sorted.slice(0, 3);
  };

  const recommendations = getRecommendations();

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleSnooze = (contactId: string, days: number) => {
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return;

    const snoozeDate = new Date();
    snoozeDate.setDate(snoozeDate.getDate() + days);

    onAddReminder({
      contactId,
      message: `Snoozed - check back in with ${contact.name}`,
      date: snoozeDate.toISOString().split('T')[0],
    });

    setSnoozeDialog({ open: false, contactId: null });
  };

  const getPersonalizedMessage = (contact: Contact) => {
    if (contact.health === 'overdue') {
      const tag = contact.tags[0];
      return `It's been a while since you connected with ${contact.name}${tag ? ` (your ${tag.toLowerCase()})` : ''}. They'd probably love to hear from you! 💙`;
    } else if (contact.health === 'attention') {
      return `You might want to reach out to ${contact.name} soon. A quick message could brighten their day! ✨`;
    }
    return '';
  };

  if (contacts.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h4" gutterBottom sx={{ color: 'primary.main' }}>
          Welcome to Your Friendship CRM! 👋
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary', maxWidth: 500, mx: 'auto' }}>
          Let's help you nurture the relationships that matter most. Start by adding your first contact, and we'll help you stay connected with the people you care about.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
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
          Your Dashboard
        </Typography>
        <IconButton onClick={handleRefresh} sx={{ color: 'secondary.main' }}>
          <Refresh />
        </IconButton>
      </Box>

      {recommendations.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center', bgcolor: 'rgba(100, 181, 246, 0.08)' }}>
          <Typography variant="h5" gutterBottom sx={{ color: 'secondary.main' }}>
            You're doing great! 🌟
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            All your relationships are in good shape. Keep up the wonderful work staying connected with the people you care about!
          </Typography>
        </Card>
      ) : (
        <>
          <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
            Friendly Suggestions
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {recommendations.map((contact) => (
              <RecommendationCard
                key={`${contact.id}-${refreshKey}`}
                contact={contact}
                message={getPersonalizedMessage(contact)}
                onLogInteraction={() => onLogInteraction(contact.id)}
                onSnooze={() => setSnoozeDialog({ open: true, contactId: contact.id })}
                onViewContact={() => onViewContact(contact.id)}
              />
            ))}
          </Box>
        </>
      )}

      {/* Upcoming Reminders */}
      {reminders.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
            Your Reminders
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {reminders
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .slice(0, 5)
              .map((reminder) => {
                const contact = contacts.find(c => c.id === reminder.contactId);
                return (
                  <Card key={reminder.id} sx={{ p: 2 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {new Date(reminder.date).toLocaleDateString()} - {reminder.message}
                      {contact && (
                        <>
                          {' ('}
                          <Typography 
                            component="span"
                            variant="body2"
                            sx={{ 
                              color: 'primary.main',
                              cursor: 'pointer',
                              '&:hover': {
                                textDecoration: 'underline',
                              }
                            }}
                            onClick={() => onViewContact(reminder.contactId)}
                          >
                            {contact.name}
                          </Typography>
                          {')'}
                        </>
                      )}
                    </Typography>
                  </Card>
                );
              })}
          </Box>
        </Box>
      )}

      {/* Snooze Dialog */}
      <Dialog open={snoozeDialog.open} onClose={() => setSnoozeDialog({ open: false, contactId: null })}>
        <DialogTitle>Snooze this suggestion?</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            No worries! Life gets busy. Choose when you'd like us to remind you again:
          </Typography>
        </DialogContent>
        <DialogActions sx={{ flexDirection: 'column', gap: 1, p: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => snoozeDialog.contactId && handleSnooze(snoozeDialog.contactId, 3)}
          >
            Remind me in 3 days
          </Button>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => snoozeDialog.contactId && handleSnooze(snoozeDialog.contactId, 7)}
          >
            Remind me in 7 days
          </Button>
          <Button onClick={() => setSnoozeDialog({ open: false, contactId: null })}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}