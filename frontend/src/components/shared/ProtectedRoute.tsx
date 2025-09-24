import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { apiClient } from '../../api/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

interface OnboardingStatus {
  is_completed: boolean;
  current_step: number;
  completion_percentage: number;
  next_step?: number;
  started_at: string;
  completed_at?: string;
  can_proceed_to_final: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        console.log('ProtectedRoute: Checking onboarding status...');
        const response = await apiClient.get('/api/onboarding/status');
        const status: OnboardingStatus = response.data;
        
        console.log('ProtectedRoute: Onboarding status:', status);
        
        if (status.is_completed) {
          console.log('ProtectedRoute: Onboarding is complete, allowing access');
          setOnboardingComplete(true);
        } else {
          console.log('ProtectedRoute: Onboarding not complete, redirecting to onboarding');
          setOnboardingComplete(false);
        }
      } catch (err) {
        console.error('ProtectedRoute: Error checking onboarding status:', err);
        setError('Failed to check onboarding status');
        // On error, assume onboarding is not complete for security
        setOnboardingComplete(false);
      } finally {
        setLoading(false);
      }
    };

    checkOnboardingStatus();
  }, []);

  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        gap={2}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="textSecondary">
          Verifying access...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        gap={2}
        p={3}
      >
        <Typography variant="h5" color="error" gutterBottom>
          Access Error
        </Typography>
        <Typography variant="body1" color="textSecondary" textAlign="center">
          {error}
        </Typography>
        <Typography variant="body2" color="textSecondary" textAlign="center">
          Please complete the setup process first.
        </Typography>
      </Box>
    );
  }

  // If onboarding is not complete, redirect to onboarding
  if (!onboardingComplete) {
    console.log('ProtectedRoute: Redirecting to onboarding');
    return <Navigate to="/onboarding" replace />;
  }

  // If onboarding is complete, render the protected component
  console.log('ProtectedRoute: Rendering protected component');
  return <>{children}</>;
};

export default ProtectedRoute;
