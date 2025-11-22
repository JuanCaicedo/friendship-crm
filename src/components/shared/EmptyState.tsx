'use client';

import { Box, Typography, Button } from '@mui/material';
import Link from 'next/link';
import { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  message: string;
  actionLabel: string;
  actionHref?: string;
  onAction?: () => void;
  icon?: ReactNode;
}

export function EmptyState({
  title,
  message,
  actionLabel,
  actionHref,
  onAction,
  icon,
}: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        textAlign: 'center',
        px: 2,
      }}
    >
      {icon && (
        <Box sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }}>{icon}</Box>
      )}
      <Typography variant="h5" component="h2" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400 }}>
        {message}
      </Typography>
      {actionHref ? (
        <Button
          component={Link}
          href={actionHref}
          variant="contained"
          size="large"
          startIcon={icon}
        >
          {actionLabel}
        </Button>
      ) : onAction ? (
        <Button
          onClick={onAction}
          variant="contained"
          size="large"
          startIcon={icon}
        >
          {actionLabel}
        </Button>
      ) : null}
    </Box>
  );
}

