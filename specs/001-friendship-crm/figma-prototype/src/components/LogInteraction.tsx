import { useState } from 'react';
import { Box, Typography, Button, Card, Avatar, TextField, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { ArrowBack, Textsms, Phone, Group } from '@mui/icons-material';
import { Contact } from '../App';

interface LogInteractionProps {
  contact: Contact;
  onSave: (interaction: { contactId: string; type: 'text' | 'call' | 'hangout'; date: string; notes?: string; weight: number }) => void;
  onCancel: () => void;
}

export default function LogInteraction({ contact, onSave, onCancel }: LogInteractionProps) {
  const [type, setType] = useState<'text' | 'call' | 'hangout'>('text');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getWeightForType = (type: 'text' | 'call' | 'hangout') => {
    switch (type) {
      case 'text': return 1;
      case 'call': return 3;
      case 'hangout': return 6;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      contactId: contact.id,
      type,
      date,
      notes: notes.trim() || undefined,
      weight: getWeightForType(type),
    });
  };

  return (
    <Box>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBack />}
        onClick={onCancel}
        sx={{ mb: 2, color: 'text.secondary' }}
      >
        Cancel
      </Button>

      {/* Form Card */}
      <Card sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
            {getInitials(contact.name)}
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ color: 'primary.main' }}>
              Log Interaction
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              with {contact.name}
            </Typography>
          </Box>
        </Box>

        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
          Great job staying connected! Let's record this interaction so we can help you maintain this relationship.
        </Typography>

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Interaction Type */}
            <Box>
              <Typography variant="h6" gutterBottom>
                How did you connect?
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 2 }}>
                <Button
                  variant={type === 'text' ? 'contained' : 'outlined'}
                  color={type === 'text' ? 'primary' : 'inherit'}
                  onClick={() => setType('text')}
                  sx={{ 
                    p: 3, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 1,
                    height: '120px',
                  }}
                >
                  <Textsms sx={{ fontSize: 40 }} />
                  <Typography>Text</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    Quick message
                  </Typography>
                </Button>

                <Button
                  variant={type === 'call' ? 'contained' : 'outlined'}
                  color={type === 'call' ? 'primary' : 'inherit'}
                  onClick={() => setType('call')}
                  sx={{ 
                    p: 3, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 1,
                    height: '120px',
                  }}
                >
                  <Phone sx={{ fontSize: 40 }} />
                  <Typography>Call</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    Phone conversation
                  </Typography>
                </Button>

                <Button
                  variant={type === 'hangout' ? 'contained' : 'outlined'}
                  color={type === 'hangout' ? 'primary' : 'inherit'}
                  onClick={() => setType('hangout')}
                  sx={{ 
                    p: 3, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 1,
                    height: '120px',
                  }}
                >
                  <Group sx={{ fontSize: 40 }} />
                  <Typography>Hangout</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    Met in person
                  </Typography>
                </Button>
              </Box>
            </Box>

            {/* Date */}
            <TextField
              label="When did this happen?"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />

            {/* Notes */}
            <TextField
              label="Notes (optional)"
              placeholder="e.g., Grabbed coffee and caught up on life. They mentioned starting a new project..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              fullWidth
              multiline
              rows={4}
              helperText="Add any details you'd like to remember about this interaction"
            />

            {/* Submit Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
              >
                Save Interaction
              </Button>
              <Button
                variant="outlined"
                onClick={onCancel}
                size="large"
                fullWidth
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </form>
      </Card>
    </Box>
  );
}
