import { Card, CardContent, Box, Typography, Button, Avatar, Chip } from '@mui/material';
import { Message, Snooze } from '@mui/icons-material';
import { Contact } from '../App';
import HealthIndicator from './HealthIndicator';

interface RecommendationCardProps {
  contact: Contact;
  message: string;
  onLogInteraction: () => void;
  onSnooze: () => void;
  onViewContact: () => void;
}

export default function RecommendationCard({ contact, message, onLogInteraction, onSnooze, onViewContact }: RecommendationCardProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Card sx={{ 
      p: 3,
      bgcolor: 'white',
      '&:hover': {
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
        transition: 'box-shadow 0.3s ease',
      }
    }}>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Avatar 
          sx={{ 
            bgcolor: 'primary.main', 
            width: 56, 
            height: 56,
            cursor: 'pointer',
            '&:hover': {
              opacity: 0.9,
            }
          }}
          onClick={onViewContact}
        >
          {getInitials(contact.name)}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                cursor: 'pointer',
                '&:hover': {
                  color: 'primary.main',
                }
              }}
              onClick={onViewContact}
            >
              {contact.name}
            </Typography>
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
          <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic', mb: 1 }}>
            "{contact.profileNote}"
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.primary' }}>
            {message}
          </Typography>
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
          color="secondary"
          startIcon={<Snooze />}
          onClick={onSnooze}
        >
          Snooze
        </Button>
      </Box>
    </Card>
  );
}