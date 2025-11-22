'use client';

import { HealthStatus } from '@/lib/models';
import { Box } from '@mui/material';

interface HealthIndicatorProps {
  status: HealthStatus;
  size?: 'small' | 'medium' | 'large';
}

const sizeMap = {
  small: 8,
  medium: 12,
  large: 16,
};

const colorMap = {
  green: '#4CAF50',
  yellow: '#FFC107',
  red: '#F44336',
};

export function HealthIndicator({ status, size = 'medium' }: HealthIndicatorProps) {
  return (
    <Box
      sx={{
        width: sizeMap[size],
        height: sizeMap[size],
        borderRadius: '50%',
        backgroundColor: colorMap[status],
        display: 'inline-block',
      }}
    />
  );
}

