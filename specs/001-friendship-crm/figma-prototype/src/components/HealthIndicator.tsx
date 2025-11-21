import { Box, Tooltip } from '@mui/material';
import { FiberManualRecord } from '@mui/icons-material';

interface HealthIndicatorProps {
  status: 'healthy' | 'attention' | 'overdue';
  size?: 'small' | 'medium';
}

export default function HealthIndicator({ status, size = 'small' }: HealthIndicatorProps) {
  const getColor = () => {
    switch (status) {
      case 'healthy':
        return '#4CAF50';
      case 'attention':
        return '#FFC107';
      case 'overdue':
        return '#F44336';
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'healthy':
        return 'Healthy - staying connected!';
      case 'attention':
        return 'Could use some attention';
      case 'overdue':
        return 'It\'s been a while';
    }
  };

  const iconSize = size === 'small' ? 16 : 20;

  return (
    <Tooltip title={getLabel()} arrow>
      <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
        <FiberManualRecord sx={{ fontSize: iconSize, color: getColor() }} />
      </Box>
    </Tooltip>
  );
}
