/**
 * AnalysisProgressDisplay Component
 * Displays the progress tracking for website analysis
 */

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import {
  Analytics as AnalyticsIcon
} from '@mui/icons-material';

interface AnalysisProgress {
  step: number;
  message: string;
  completed: boolean;
}

interface AnalysisProgressDisplayProps {
  loading: boolean;
  progress: AnalysisProgress[];
}

const AnalysisProgressDisplay: React.FC<AnalysisProgressDisplayProps> = ({
  loading,
  progress
}) => {
  const getProgressPercentage = () => {
    const completedSteps = progress.filter(p => p.completed).length;
    return (completedSteps / progress.length) * 100;
  };

  if (!loading) {
    return null;
  }

  return (
    <Card sx={{ mb: 3, p: 3 }}>
      <Typography variant="h6" gutterBottom>
        <AnalyticsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Analysis Progress
      </Typography>
      
      <LinearProgress 
        variant="determinate" 
        value={getProgressPercentage()} 
        sx={{ mb: 2 }}
      />
      
      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
        {Math.round(getProgressPercentage())}% Complete
      </Typography>

      <Stepper orientation="vertical" activeStep={progress.filter(p => p.completed).length}>
        {progress.map((step) => (
          <Step key={step.step} completed={step.completed}>
            <StepLabel>
              <Typography variant="body2">
                {step.message}
              </Typography>
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Card>
  );
};

export default AnalysisProgressDisplay;
