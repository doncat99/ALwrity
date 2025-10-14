import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  Chip,
  CircularProgress,
  Fade,
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Warning,
  Security,
  Download,
  Settings,
  PlayArrow,
} from '@mui/icons-material';

export interface InstallationStep {
  id: string;
  label: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
  error?: string;
  progress?: number;
}

export interface InstallationModalProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
  onError: (error: string) => void;
  platform: 'windows' | 'macos' | 'linux' | 'unknown';
  steps: InstallationStep[];
  currentStep: number;
  overallProgress: number;
  error: string | null;
  retryInstallation: () => void;
}

const InstallationModal: React.FC<InstallationModalProps> = ({
  open,
  onClose,
  onComplete,
  onError,
  platform,
  steps,
  currentStep,
  overallProgress,
  error,
  retryInstallation,
}) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const completed = steps.every(step => step.status === 'completed');
    const error = steps.some(step => step.status === 'error');
    
    setIsCompleted(completed);
    setHasError(error);
    
    if (completed) {
      setTimeout(() => {
        onComplete();
      }, 2000);
    } else if (error) {
      const errorStep = steps.find(step => step.status === 'error');
      if (errorStep?.error) {
        onError(errorStep.error);
      }
    }
  }, [steps, onComplete, onError]);

  const getStepIcon = (step: InstallationStep, index: number) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle sx={{ color: '#10B981' }} />;
      case 'in-progress':
        return <CircularProgress size={20} color="primary" />;
      case 'error':
        return <Error sx={{ color: '#EF4444' }} />;
      default:
        return index + 1;
    }
  };

  const getPlatformIcon = () => {
    switch (platform) {
      case 'windows':
        return '🪟';
      case 'macos':
        return '🍎';
      case 'linux':
        return '🐧';
      default:
        return '💻';
    }
  };

  const getPlatformName = () => {
    switch (platform) {
      case 'windows':
        return 'Windows';
      case 'macos':
        return 'macOS';
      case 'linux':
        return 'Linux';
      default:
        return 'Your System';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={isCompleted ? onClose : undefined}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Security sx={{ fontSize: 28, color: '#6366F1' }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1E293B' }}>
              Installing Privacy Mode
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              Setting up OLLAMA on {getPlatformName()} {getPlatformIcon()}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pb: 2 }}>
        {/* Overall Progress */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 500, color: '#374151' }}>
              Installation Progress
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280' }}>
              {Math.round(overallProgress)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={overallProgress}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                background: 'linear-gradient(90deg, #6366F1 0%, #8B5CF6 100%)',
              },
            }}
          />
        </Box>

        {/* Installation Steps */}
        <Stepper activeStep={currentStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.id} completed={step.status === 'completed'}>
              <StepLabel
                icon={getStepIcon(step, index)}
                sx={{
                  '& .MuiStepLabel-label': {
                    fontWeight: 600,
                    color: step.status === 'error' ? '#EF4444' : 
                           step.status === 'completed' ? '#10B981' :
                           step.status === 'in-progress' ? '#6366F1' : '#6B7280',
                  },
                }}
              >
                {step.label}
              </StepLabel>
              <StepContent>
                <Typography variant="body2" sx={{ color: '#64748B', mb: 2 }}>
                  {step.description}
                </Typography>
                
                {step.status === 'in-progress' && step.progress !== undefined && (
                  <Box sx={{ mb: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={step.progress}
                      sx={{
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 2,
                          backgroundColor: '#6366F1',
                        },
                      }}
                    />
                    <Typography variant="caption" sx={{ color: '#6B7280', mt: 0.5 }}>
                      {Math.round(step.progress)}%
                    </Typography>
                  </Box>
                )}

                {step.status === 'error' && step.error && (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    <Typography variant="body2">
                      {step.error}
                    </Typography>
                  </Alert>
                )}

                {step.status === 'completed' && (
                  <Alert severity="success" sx={{ mt: 1 }}>
                    <Typography variant="body2">
                      Step completed successfully
                    </Typography>
                  </Alert>
                )}
              </StepContent>
            </Step>
          ))}
        </Stepper>

        {/* Status Messages */}
        {isCompleted && (
          <Fade in={true}>
            <Alert 
              severity="success" 
              sx={{ 
                mt: 3,
                '& .MuiAlert-icon': {
                  fontSize: 24,
                },
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                🎉 Privacy Mode Successfully Installed!
              </Typography>
              <Typography variant="body2">
                OLLAMA is now running locally on your system. All AI processing 
                will happen on your device, keeping your data completely private.
              </Typography>
            </Alert>
          </Fade>
        )}

        {hasError && !isCompleted && (
          <Alert severity="error" sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Installation Failed
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              There was an error during installation. Please install OLLAMA manually:
            </Typography>
            <Box sx={{ ml: 2 }}>
              <Typography variant="body2" component="div" sx={{ mb: 1 }}>
                1. Open <a href="https://ollama.com/download" target="_blank" rel="noopener noreferrer" style={{ color: '#6366F1', textDecoration: 'underline' }}>https://ollama.com/download</a>
              </Typography>
              <Typography variant="body2" component="div" sx={{ mb: 1 }}>
                2. Click "Download for Windows"
              </Typography>
              <Typography variant="body2" component="div" sx={{ mb: 1 }}>
                3. Run the downloaded installer
              </Typography>
              <Typography variant="body2" component="div" sx={{ mb: 1 }}>
                4. Refresh this page - Privacy Mode will be automatically detected
              </Typography>
            </Box>
            {error && (
              <Typography variant="caption" sx={{ mt: 2, display: 'block', color: '#6B7280' }}>
                Error details: {error}
              </Typography>
            )}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        {isCompleted ? (
          <Button
            onClick={onClose}
            variant="contained"
            sx={{
              backgroundColor: '#10B981',
              '&:hover': { backgroundColor: '#059669' },
              px: 4,
            }}
          >
            Continue
          </Button>
        ) : hasError ? (
          <>
            <Button
              onClick={onClose}
              variant="outlined"
              color="error"
              sx={{ mr: 1 }}
            >
              Close
            </Button>
            <Button
              onClick={() => window.open('https://ollama.com/download', '_blank')}
              variant="contained"
              color="primary"
              sx={{ mr: 1 }}
            >
              Manual Install
            </Button>
            <Button
              onClick={retryInstallation}
              variant="contained"
              color="secondary"
            >
              Retry
            </Button>
          </>
        ) : (
          <Button
            onClick={onClose}
            variant="outlined"
            disabled={currentStep > 0}
          >
            Cancel
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default InstallationModal;
