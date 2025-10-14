import React, { useState } from 'react';
import {
  Button,
  Box,
  Typography,
  Chip,
  CircularProgress,
  Tooltip,
  Fade,
} from '@mui/material';
import {
  Security,
  CloudOff,
  CheckCircle,
  Error,
  Download,
} from '@mui/icons-material';

export interface PrivacyModeButtonProps {
  onInstallationStart: () => void;
  onInstallationComplete: () => void;
  onInstallationError: (error: string) => void;
  isInstalling: boolean;
  isInstalled: boolean;
  disabled?: boolean;
}

const PrivacyModeButton: React.FC<PrivacyModeButtonProps> = ({
  onInstallationStart,
  onInstallationComplete,
  onInstallationError,
  isInstalling,
  isInstalled,
  disabled = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (!isInstalling && !isInstalled) {
      onInstallationStart();
    }
  };

  const getButtonContent = () => {
    if (isInstalling) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={20} color="inherit" />
          <Typography variant="body2" fontWeight={600}>
            Installing OLLAMA...
          </Typography>
        </Box>
      );
    }

    if (isInstalled) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircle sx={{ fontSize: 20 }} />
          <Typography variant="body2" fontWeight={600}>
            Privacy Mode Active
          </Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Security sx={{ fontSize: 20 }} />
        <Typography variant="body2" fontWeight={600}>
          Enable Privacy Mode
        </Typography>
        <Chip
          label="Local AI"
          size="small"
          sx={{
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            color: '#3B82F6',
            fontWeight: 500,
            fontSize: '0.75rem',
          }}
        />
      </Box>
    );
  };

  const getButtonProps = () => {
    if (isInstalling) {
      return {
        disabled: true,
        sx: {
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          color: '#3B82F6',
          borderColor: '#3B82F6',
          '&:hover': {
            backgroundColor: 'rgba(59, 130, 246, 0.15)',
          },
        },
      };
    }

    if (isInstalled) {
      return {
        disabled: true,
        sx: {
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          color: '#10B981',
          borderColor: '#10B981',
        },
      };
    }

    return {
      disabled,
      sx: {
        backgroundColor: isHovered ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
        color: '#6366F1',
        borderColor: '#6366F1',
        borderWidth: 2,
        borderStyle: 'solid',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          borderColor: '#4F46E5',
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.15)',
        },
        '&:active': {
          transform: 'translateY(0)',
        },
      },
    };
  };

  return (
    <Fade in={true} timeout={500}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          p: 3,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: '#1E293B',
              mb: 0.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
            }}
          >
            <CloudOff sx={{ fontSize: 24, color: '#6366F1' }} />
            Privacy-First AI Processing
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: '#64748B',
              maxWidth: 400,
              lineHeight: 1.5,
            }}
          >
            Install OLLAMA locally to process AI requests on your device. 
            Your data never leaves your computer.
          </Typography>
        </Box>

        <Tooltip
          title={
            isInstalling
              ? 'Installing OLLAMA locally...'
              : isInstalled
              ? 'OLLAMA is installed and running locally'
              : 'Click to install OLLAMA for local AI processing'
          }
          placement="top"
        >
          <Button
            variant="outlined"
            size="large"
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            {...getButtonProps()}
            sx={{
              minWidth: 200,
              py: 1.5,
              px: 3,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '0.875rem',
              ...getButtonProps().sx,
            }}
          >
            {getButtonContent()}
          </Button>
        </Tooltip>

        {!isInstalling && !isInstalled && (
          <Typography
            variant="caption"
            sx={{
              color: '#64748B',
              textAlign: 'center',
              fontSize: '0.75rem',
              maxWidth: 300,
            }}
          >
            • Completely offline AI processing
            <br />
            • No data sent to external servers
            <br />
            • Works without internet connection
          </Typography>
        )}
      </Box>
    </Fade>
  );
};

export default PrivacyModeButton;
