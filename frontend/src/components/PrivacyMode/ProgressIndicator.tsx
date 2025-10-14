import React from 'react';
import {
  Box,
  LinearProgress,
  Typography,
  Chip,
  Fade,
} from '@mui/material';

export interface ProgressIndicatorProps {
  progress: number;
  label: string;
  sublabel?: string;
  status?: 'active' | 'completed' | 'error' | 'pending';
  showPercentage?: boolean;
  animated?: boolean;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  progress,
  label,
  sublabel,
  status = 'active',
  showPercentage = true,
  animated = true,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return '#10B981';
      case 'error':
        return '#EF4444';
      case 'pending':
        return '#6B7280';
      default:
        return '#6366F1';
    }
  };

  const getStatusChip = () => {
    switch (status) {
      case 'completed':
        return (
          <Chip
            label="Completed"
            size="small"
            sx={{
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              color: '#10B981',
              fontWeight: 500,
              fontSize: '0.75rem',
            }}
          />
        );
      case 'error':
        return (
          <Chip
            label="Error"
            size="small"
            sx={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#EF4444',
              fontWeight: 500,
              fontSize: '0.75rem',
            }}
          />
        );
      case 'pending':
        return (
          <Chip
            label="Pending"
            size="small"
            sx={{
              backgroundColor: 'rgba(107, 114, 128, 0.1)',
              color: '#6B7280',
              fontWeight: 500,
              fontSize: '0.75rem',
            }}
          />
        );
      default:
        return (
          <Chip
            label="In Progress"
            size="small"
            sx={{
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              color: '#6366F1',
              fontWeight: 500,
              fontSize: '0.75rem',
            }}
          />
        );
    }
  };

  return (
    <Fade in={true} timeout={300}>
      <Box sx={{ width: '100%' }}>
        {/* Header with label and status */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: status === 'error' ? '#EF4444' : 
                     status === 'completed' ? '#10B981' : '#374151',
            }}
          >
            {label}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {getStatusChip()}
            {showPercentage && (
              <Typography
                variant="caption"
                sx={{
                  color: '#6B7280',
                  fontWeight: 500,
                  minWidth: 35,
                  textAlign: 'right',
                }}
              >
                {Math.round(progress)}%
              </Typography>
            )}
          </Box>
        </Box>

        {/* Sub-label */}
        {sublabel && (
          <Typography
            variant="caption"
            sx={{
              color: '#6B7280',
              mb: 1.5,
              display: 'block',
            }}
          >
            {sublabel}
          </Typography>
        )}

        {/* Progress Bar */}
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: status === 'error' ? 6 : 8,
            borderRadius: 4,
            backgroundColor: 'rgba(226, 232, 240, 0.5)',
            '& .MuiLinearProgress-bar': {
              borderRadius: 4,
              backgroundColor: getStatusColor(),
              ...(animated && status === 'active' && {
                animation: 'progress-animation 2s ease-in-out infinite',
              }),
            },
          }}
        />

        {/* Custom keyframes for animation */}
        {animated && status === 'active' && (
          <style>
            {`
              @keyframes progress-animation {
                0% {
                  transform: translateX(-100%);
                }
                50% {
                  transform: translateX(0%);
                }
                100% {
                  transform: translateX(100%);
                }
              }
            `}
          </style>
        )}
      </Box>
    </Fade>
  );
};

export default ProgressIndicator;
