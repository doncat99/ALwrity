import React from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Tooltip,
  Fade
} from '@mui/material';
import {
  HelpOutline,
  Close
} from '@mui/icons-material';
import UserBadge from '../../shared/UserBadge';
import UsageDashboard from '../../shared/UsageDashboard';

interface WizardHeaderProps {
  activeStep: number;
  progress: number;
  stepHeaderContent: {
    title: string;
    description: string;
  };
  showProgressMessage: boolean;
  progressMessage: string;
  showHelp: boolean;
  isMobile: boolean;
  steps: Array<{
    label: string;
    description: string;
    icon: string;
  }>;
  onStepClick: (stepIndex: number) => void;
  onHelpToggle: () => void;
}

export const WizardHeader: React.FC<WizardHeaderProps> = ({
  activeStep,
  progress,
  stepHeaderContent,
  showProgressMessage,
  progressMessage,
  showHelp,
  isMobile,
  steps,
  onStepClick,
  onHelpToggle
}) => {
  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        p: { xs: 3, md: 4 },
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
          pointerEvents: 'none',
        }
      }}
    >
      {/* Progress Message */}
      {showProgressMessage && (
        <Fade in={showProgressMessage}>
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              background: 'rgba(16, 185, 129, 0.9)',
              color: 'white',
              p: 2,
              textAlign: 'center',
              zIndex: 10,
              backdropFilter: 'blur(10px)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {progressMessage}
            </Typography>
          </Box>
        </Fade>
      )}
      
      {/* Top Row - Title and Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, position: 'relative', zIndex: 1 }}>
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
          <UserBadge colorMode="dark" />
          {/* Usage Dashboard - Show API usage statistics during onboarding */}
          <UsageDashboard compact={true} />
        </Box>
        <Box sx={{ flex: 2, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: '-0.025em' }}>
            {stepHeaderContent.title}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flex: 1, justifyContent: 'flex-end' }}>
          <Tooltip title="Get Help" arrow>
            <IconButton 
              onClick={onHelpToggle}
              sx={{ 
                color: 'white', 
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                }
              }}
            >
              <HelpOutline />
            </IconButton>
          </Tooltip>
          <Tooltip title="Skip for now" arrow>
            <IconButton 
              sx={{ 
                color: 'white',
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                }
              }}
            >
              <Close />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {/* Progress Bar */}
      <Box sx={{ mb: 3, position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
            Setup Progress
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 600 }}>
            {Math.round(progress)}% Complete
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: 'rgba(255,255,255,0.2)',
            '& .MuiLinearProgress-bar': {
              borderRadius: 4,
              background: 'linear-gradient(90deg, #fff 0%, #f8fafc 100%)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }
          }}
        />
      </Box>

      {/* Stepper in Header */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Stepper 
          activeStep={activeStep} 
          alternativeLabel={!isMobile}
          sx={{
            '& .MuiStepLabel-root': {
              cursor: 'pointer',
            },
            '& .MuiStepLabel-label': {
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'white',
            },
            '& .MuiStepLabel-labelContainer': {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            },
            '& .MuiStepLabel-label.Mui-completed': {
              color: 'rgba(255, 255, 255, 0.9)',
            },
            '& .MuiStepLabel-label.Mui-active': {
              color: 'white',
            },
            '& .MuiStepLabel-label.Mui-disabled': {
              color: 'rgba(255, 255, 255, 0.6)',
            },
          }}
        >
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel
                onClick={() => onStepClick(index)}
                sx={{
                  cursor: index <= activeStep ? 'pointer' : 'default',
                  '& .MuiStepLabel-iconContainer': {
                    background: index <= activeStep 
                      ? 'rgba(255, 255, 255, 0.2)'
                      : 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '50%',
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: index <= activeStep ? 'white' : 'rgba(255, 255, 255, 0.6)',
                    fontSize: '1.2rem',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: index <= activeStep 
                      ? '0 4px 12px rgba(255, 255, 255, 0.2)'
                      : 'none',
                    '&:hover': {
                      transform: index <= activeStep ? 'scale(1.05)' : 'none',
                      boxShadow: index <= activeStep 
                        ? '0 6px 16px rgba(255, 255, 255, 0.3)'
                        : 'none',
                    }
                  },
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                  <Typography variant="h6" sx={{ mb: 0.5 }}>
                    {step.icon}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'center' }}>
                    {step.label}
                  </Typography>
                </Box>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
    </Box>
  );
};
