import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Alert,
  Button,
  Chip,
  Fade,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Warning,
  Info,
  Refresh,
  Download,
  Settings,
  PlayArrow,
  Security,
} from '@mui/icons-material';
import { InstallationStep } from './InstallationModal';

export interface InstallationProgressFeedbackProps {
  steps: InstallationStep[];
  currentStep: number;
  overallProgress: number;
  isInstalling: boolean;
  hasError: boolean;
  error?: string;
  onRetry: () => void;
  onCancel: () => void;
}

const InstallationProgressFeedback: React.FC<InstallationProgressFeedbackProps> = ({
  steps,
  currentStep,
  overallProgress,
  isInstalling,
  hasError,
  error,
  onRetry,
  onCancel,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [failedSteps, setFailedSteps] = useState<number[]>([]);

  useEffect(() => {
    // Update completed and failed steps
    const completed: number[] = [];
    const failed: number[] = [];
    
    steps.forEach((step, index) => {
      if (step.status === 'completed') {
        completed.push(index);
      } else if (step.status === 'error') {
        failed.push(index);
      }
    });
    
    setCompletedSteps(completed);
    setFailedSteps(failed);
  }, [steps]);

  const getStepIcon = (step: InstallationStep, index: number) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle sx={{ color: '#10B981', fontSize: 20 }} />;
      case 'error':
        return <Error sx={{ color: '#EF4444', fontSize: 20 }} />;
      case 'in-progress':
        return <Settings sx={{ color: '#6366F1', fontSize: 20 }} />;
      default:
        return <Info sx={{ color: '#6B7280', fontSize: 20 }} />;
    }
  };

  const getStepColor = (step: InstallationStep) => {
    switch (step.status) {
      case 'completed': return '#10B981';
      case 'error': return '#EF4444';
      case 'in-progress': return '#6366F1';
      default: return '#6B7280';
    }
  };

  const getOverallStatus = () => {
    if (hasError) return 'error';
    if (isInstalling) return 'in-progress';
    if (completedSteps.length === steps.length) return 'completed';
    return 'pending';
  };

  const getStatusMessage = () => {
    const status = getOverallStatus();
    
    switch (status) {
      case 'completed':
        return 'Privacy Mode installation completed successfully!';
      case 'error':
        return 'Installation encountered an error';
      case 'in-progress':
        const currentStepData = steps[currentStep];
        return currentStepData ? `Installing: ${currentStepData.label}` : 'Installing Privacy Mode...';
      default:
        return 'Ready to install Privacy Mode';
    }
  };

  const getStatusIcon = () => {
    const status = getOverallStatus();
    
    switch (status) {
      case 'completed':
        return <CheckCircle sx={{ color: '#10B981', fontSize: 24 }} />;
      case 'error':
        return <Error sx={{ color: '#EF4444', fontSize: 24 }} />;
      case 'in-progress':
        return <Settings sx={{ color: '#6366F1', fontSize: 24 }} />;
      default:
        return <Security sx={{ color: '#6B7280', fontSize: 24 }} />;
    }
  };

  const getStatusChip = () => {
    const status = getOverallStatus();
    
    switch (status) {
      case 'completed':
        return (
          <Chip
            label="COMPLETED"
            size="small"
            sx={{
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              color: '#10B981',
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
          />
        );
      case 'error':
        return (
          <Chip
            label="ERROR"
            size="small"
            sx={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#EF4444',
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
          />
        );
      case 'in-progress':
        return (
          <Chip
            label="INSTALLING"
            size="small"
            sx={{
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              color: '#6366F1',
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
          />
        );
      default:
        return (
          <Chip
            label="READY"
            size="small"
            sx={{
              backgroundColor: 'rgba(107, 114, 128, 0.1)',
              color: '#6B7280',
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
          />
        );
    }
  };

  return (
    <Fade in={true}>
      <Box sx={{ width: '100%' }}>
        {/* Status Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          {getStatusIcon()}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1E293B', mb: 0.5 }}>
              Privacy Mode Installation
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280' }}>
              {getStatusMessage()}
            </Typography>
          </Box>
          {getStatusChip()}
        </Box>

        {/* Overall Progress */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 500, color: '#374151' }}>
              Overall Progress
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 500 }}>
              {Math.round(overallProgress)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={overallProgress}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'rgba(226, 232, 240, 0.5)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                backgroundColor: getOverallStatus() === 'error' ? '#EF4444' : 
                               getOverallStatus() === 'completed' ? '#10B981' : '#6366F1',
              },
            }}
          />
        </Box>

        {/* Error Display */}
        {hasError && error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
              Installation Error
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280' }}>
              {error}
            </Typography>
          </Alert>
        )}

        {/* Step Details */}
        <Box sx={{ mb: 3 }}>
          <Button
            onClick={() => setShowDetails(!showDetails)}
            sx={{
              textTransform: 'none',
              color: '#6366F1',
              fontWeight: 500,
              mb: 2,
            }}
          >
            {showDetails ? 'Hide Step Details' : 'Show Step Details'}
          </Button>

          <Collapse in={showDetails}>
            <Box sx={{ 
              p: 2, 
              borderRadius: 2, 
              backgroundColor: '#F9FAFB', 
              border: '1px solid #E5E7EB' 
            }}>
              <List dense>
                {steps.map((step, index) => (
                  <ListItem key={step.id} sx={{ py: 1 }}>
                    <ListItemIcon>
                      {getStepIcon(step, index)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              color: getStepColor(step),
                            }}
                          >
                            {step.label}
                          </Typography>
                          {step.status === 'in-progress' && step.progress !== undefined && (
                            <Typography variant="caption" sx={{ color: '#6B7280' }}>
                              {Math.round(step.progress)}%
                            </Typography>
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
                            {step.description}
                          </Typography>
                          {step.status === 'in-progress' && step.progress !== undefined && (
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
                          )}
                          {step.status === 'error' && step.error && (
                            <Alert severity="error" sx={{ mt: 1, fontSize: '0.75rem' }}>
                              {step.error}
                            </Alert>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Collapse>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          {hasError && (
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={onRetry}
              sx={{
                backgroundColor: '#EF4444',
                '&:hover': { backgroundColor: '#DC2626' },
                textTransform: 'none',
                fontWeight: 500,
              }}
            >
              Retry Installation
            </Button>
          )}
          
          {isInstalling && (
            <Button
              variant="outlined"
              onClick={onCancel}
              sx={{
                borderColor: '#6B7280',
                color: '#6B7280',
                '&:hover': { borderColor: '#4B5563', backgroundColor: '#F9FAFB' },
                textTransform: 'none',
                fontWeight: 500,
              }}
            >
              Cancel
            </Button>
          )}
        </Box>

        {/* Progress Stats */}
        <Box sx={{ 
          mt: 3, 
          p: 2, 
          borderRadius: 2, 
          backgroundColor: '#F3F4F6',
          display: 'flex',
          justifyContent: 'space-around',
          textAlign: 'center'
        }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#10B981' }}>
              {completedSteps.length}
            </Typography>
            <Typography variant="caption" sx={{ color: '#6B7280' }}>
              Completed
            </Typography>
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#EF4444' }}>
              {failedSteps.length}
            </Typography>
            <Typography variant="caption" sx={{ color: '#6B7280' }}>
              Failed
            </Typography>
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#6366F1' }}>
              {steps.length}
            </Typography>
            <Typography variant="caption" sx={{ color: '#6B7280' }}>
              Total Steps
            </Typography>
          </Box>
        </Box>
      </Box>
    </Fade>
  );
};

export default InstallationProgressFeedback;
