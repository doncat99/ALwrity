import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { Box, CircularProgress, Typography, Alert, Button } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { useOnboarding } from '../../contexts/OnboardingContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isSignedIn } = useAuth();
  
  // Use onboarding context instead of making API calls
  const { 
    loading, 
    error, 
    isOnboardingComplete, 
    refresh,
    clearError 
  } = useOnboarding();

  // Loading state - show spinner
  if (loading) {
    console.log('ProtectedRoute: Loading onboarding state from context...');
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

  // Error state - show error with retry
  if (error) {
    console.error('ProtectedRoute: Error from context:', error);
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
        <Alert 
          severity="error" 
          sx={{ maxWidth: 500, mb: 2 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={() => {
                clearError();
                refresh();
              }}
              startIcon={<RefreshIcon />}
            >
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
        <Typography variant="body2" color="textSecondary" textAlign="center">
          Please try refreshing or complete the setup process first.
        </Typography>
      </Box>
    );
  }

  // Not signed in - redirect to landing
  if (!isSignedIn) {
    console.log('ProtectedRoute: Not signed in, redirecting to landing');
    return <Navigate to="/" replace />;
  }

  // Onboarding not complete - redirect to onboarding
  if (!isOnboardingComplete) {
    console.log('ProtectedRoute: Onboarding not complete (from context), redirecting');
    return <Navigate to="/onboarding" replace />;
  }

  // All checks passed - render protected component
  console.log('ProtectedRoute: Access granted (from context), rendering component');
  return <>{children}</>;
};

export default ProtectedRoute;
