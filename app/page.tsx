'use client';

import { Container, Typography, Box, Alert, IconButton } from '@mui/material';
import { Refresh as RefreshIcon, Add as AddIcon } from '@mui/icons-material';
import { useRecommendations } from '@/hooks/useRecommendations';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { RecommendationCard } from '@/components/RecommendationCard';

export default function Dashboard() {
  const { recommendations, isLoading, isError, error, refresh } = useRecommendations();

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Your Dashboard
          </Typography>
        </Box>
        <Typography variant="h6" component="h2" sx={{ mb: 2, color: 'text.secondary' }}>
          Friendly Suggestions
        </Typography>
        <LoadingSkeleton variant="card" count={3} />
      </Container>
    );
  }

  if (isError) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Couldn't load recommendations. Please try again.
        </Alert>
        <Box sx={{ textAlign: 'center' }}>
          <IconButton onClick={() => refresh()} color="primary">
            <RefreshIcon />
          </IconButton>
        </Box>
      </Container>
    );
  }

  if (recommendations.length === 0) {
    return (
      <EmptyState
        title="No recommendations yet"
        message="Start by adding someone you care about to your contact list."
        actionLabel="Add Your First Contact"
        actionHref="/contacts/new"
        icon={<AddIcon />}
      />
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Your Dashboard
        </Typography>
        <IconButton onClick={() => refresh()} color="primary">
          <RefreshIcon />
        </IconButton>
      </Box>
      <Typography variant="h6" component="h2" sx={{ mb: 2, color: 'text.secondary' }}>
        Friendly Suggestions
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {recommendations.map((recommendation) => (
          <RecommendationCard key={recommendation.contactId} recommendation={recommendation} />
        ))}
      </Box>
    </Container>
  );
}

