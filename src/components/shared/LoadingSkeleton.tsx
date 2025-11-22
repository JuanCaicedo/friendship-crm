'use client';

import { Box, Skeleton, Card, CardContent } from '@mui/material';

interface LoadingSkeletonProps {
  variant?: 'card' | 'list' | 'text';
  count?: number;
}

export function LoadingSkeleton({ variant = 'card', count = 3 }: LoadingSkeletonProps) {
  if (variant === 'card') {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Skeleton variant="circular" width={48} height={48} />
                <Box sx={{ flexGrow: 1 }}>
                  <Skeleton variant="text" width="60%" height={32} />
                  <Skeleton variant="text" width="40%" height={24} sx={{ mt: 1 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  }

  if (variant === 'list') {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {Array.from({ length: count }).map((_, i) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
            <Skeleton variant="circular" width={40} height={40} />
            <Skeleton variant="text" width="70%" height={24} />
          </Box>
        ))}
      </Box>
    );
  }

  return (
    <Box>
      <Skeleton variant="text" width="100%" height={32} />
      <Skeleton variant="text" width="80%" height={24} sx={{ mt: 1 }} />
      <Skeleton variant="text" width="90%" height={24} sx={{ mt: 1 }} />
    </Box>
  );
}

