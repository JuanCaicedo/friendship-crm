'use client';

import { Card, CardContent, Typography, Box, Button, Chip, Alert } from '@mui/material';
import { Recommendation } from '@/lib/models';
import { HealthIndicator } from './shared/HealthIndicator';
import { useRouter } from 'next/navigation';
import { useSnooze } from '@/hooks/useSnooze';

interface RecommendationCardProps {
  recommendation: Recommendation;
}

export function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const router = useRouter();
  const { snooze, isSnoozing, error: snoozeError } = useSnooze();

  const handleLogInteraction = () => {
    router.push(`/interactions/${recommendation.contactId}`);
  };

  const handleSnooze = async () => {
    try {
      await snooze({ contactId: recommendation.contactId, days: 7 });
    } catch (error) {
      // Error is handled by SWR
      console.error('Error snoozing recommendation:', error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              backgroundColor: 'primary.main',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
            }}
          >
            {getInitials(recommendation.contact.name)}
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="h3">
              {recommendation.contact.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <HealthIndicator status={recommendation.healthStatus} />
              {recommendation.contact.tags && recommendation.contact.tags.length > 0 && (
                <Box sx={{ display: 'flex', gap: 0.5, ml: 1 }}>
                  {recommendation.contact.tags.map((tag) => (
                    <Chip
                      key={tag.id}
                      label={tag.name}
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(100, 181, 246, 0.15)',
                        color: 'secondary.dark',
                      }}
                    />
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        </Box>
        {recommendation.contact.profileNote && (
          <Typography
            variant="body2"
            sx={{ fontStyle: 'italic', color: 'text.secondary', mb: 2 }}
          >
            "{recommendation.contact.profileNote}"
          </Typography>
        )}
        <Typography variant="body1" sx={{ mb: 2 }}>
          {recommendation.reason}
        </Typography>
        {snoozeError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {snoozeError.message || 'Couldn\'t snooze recommendation. Please try again.'}
          </Alert>
        )}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="contained" onClick={handleLogInteraction}>
            Log Interaction
          </Button>
          <Button variant="outlined" onClick={handleSnooze} disabled={isSnoozing}>
            {isSnoozing ? 'Snoozing...' : 'Snooze'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

