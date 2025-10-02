import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { CopilotKit } from "@copilotkit/react-core";
import { ClerkProvider, useAuth } from '@clerk/clerk-react';
import "@copilotkit/react-ui/styles.css";
import Wizard from './components/OnboardingWizard/Wizard';
import MainDashboard from './components/MainDashboard/MainDashboard';
import SEODashboard from './components/SEODashboard/SEODashboard';
import ContentPlanningDashboard from './components/ContentPlanningDashboard/ContentPlanningDashboard';
import FacebookWriter from './components/FacebookWriter/FacebookWriter';
import LinkedInWriter from './components/LinkedInWriter/LinkedInWriter';
import BlogWriter from './components/BlogWriter/BlogWriter';
import WixTestPage from './components/WixTestPage/WixTestPage';
import WixCallbackPage from './components/WixCallbackPage/WixCallbackPage';
import ProtectedRoute from './components/shared/ProtectedRoute';
import GSCAuthCallback from './components/SEODashboard/components/GSCAuthCallback';
import Landing from './components/Landing/Landing';
import ErrorBoundary from './components/shared/ErrorBoundary';
import ErrorBoundaryTest from './components/shared/ErrorBoundaryTest';
import { OnboardingProvider } from './contexts/OnboardingContext';

import { apiClient, setAuthTokenGetter } from './api/client';
import { useOnboarding } from './contexts/OnboardingContext';

// interface OnboardingStatus {
//   onboarding_required: boolean;
//   onboarding_complete: boolean;
//   current_step?: number;
//   total_steps?: number;
//   completion_percentage?: number;
// }

// Conditional CopilotKit wrapper that only shows sidebar on content-planning route
const ConditionalCopilotKit: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  // const isContentPlanningRoute = location.pathname === '/content-planning';

  // Do not render CopilotSidebar here. Let specific pages/components control it.
  return <>{children}</>;
};

// Component to handle initial routing based on onboarding status
// Now uses OnboardingContext instead of making its own API calls
const InitialRouteHandler: React.FC = () => {
  const { loading, error, isOnboardingComplete } = useOnboarding();

  // Loading state
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
          Checking onboarding status...
        </Typography>
      </Box>
    );
  }

  // Error state
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
          Error
        </Typography>
        <Typography variant="body1" color="textSecondary" textAlign="center">
          {error}
        </Typography>
      </Box>
    );
  }

  // Redirect based on onboarding status from context
  if (isOnboardingComplete) {
    console.log('InitialRouteHandler: Onboarding complete (from context), redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  } else {
    console.log('InitialRouteHandler: Onboarding not complete (from context), redirecting to onboarding');
    return <Navigate to="/onboarding" replace />;
  }
};

// Root route that chooses Landing (signed out) or InitialRouteHandler (signed in)
const RootRoute: React.FC = () => {
  const { isSignedIn } = useAuth();
  if (isSignedIn) {
    return <InitialRouteHandler />;
  }
  return <Landing />;
};

// Installs Clerk auth token getter into axios clients; must render under ClerkProvider
const TokenInstaller: React.FC = () => {
  const { getToken } = useAuth();
  useEffect(() => {
    setAuthTokenGetter(async () => {
      try {
        const template = process.env.REACT_APP_CLERK_JWT_TEMPLATE;
        // If a template is provided, request a template-specific JWT
        if (template) {
          // @ts-ignore Clerk types allow options object
          return await getToken({ template });
        }
        return await getToken();
      } catch {
        return null;
      }
    });
  }, [getToken]);
  return null;
};

const App: React.FC = () => {
  // React Hooks MUST be at the top before any conditionals
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get CopilotKit key from localStorage or .env
  const [copilotApiKey, setCopilotApiKey] = useState(() => {
    const savedKey = localStorage.getItem('copilotkit_api_key');
    return savedKey || process.env.REACT_APP_COPILOTKIT_API_KEY || '';
  });

  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        await apiClient.get('/health');
        setLoading(false);
      } catch (err) {
        setError('Backend service is not available. Please check if the server is running.');
        setLoading(false);
      }
    };

    checkBackendHealth();
  }, []);

  // Listen for CopilotKit key updates
  useEffect(() => {
    const handleKeyUpdate = (event: CustomEvent) => {
      const newKey = event.detail?.apiKey;
      if (newKey) {
        console.log('App: CopilotKit key updated, reloading...');
        setCopilotApiKey(newKey);
        setTimeout(() => window.location.reload(), 500);
      }
    };
    
    window.addEventListener('copilotkit-key-updated', handleKeyUpdate as EventListener);
    return () => window.removeEventListener('copilotkit-key-updated', handleKeyUpdate as EventListener);
  }, []);

  // Token installer must be inside ClerkProvider; see TokenInstaller below

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
          Connecting to ALwrity...
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
          Connection Error
        </Typography>
        <Typography variant="body1" color="textSecondary" textAlign="center">
          {error}
        </Typography>
        <Typography variant="body2" color="textSecondary" textAlign="center">
          Please ensure the backend server is running and try refreshing the page.
        </Typography>
      </Box>
    );
  }

  // Get environment variables with fallbacks
  const clerkPublishableKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY || '';

  // Show error if required keys are missing
  if (!clerkPublishableKey) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error" variant="h6">
          Missing Clerk Publishable Key
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Please add REACT_APP_CLERK_PUBLISHABLE_KEY to your .env file
        </Typography>
      </Box>
    );
  }

  return (
    <ErrorBoundary 
      context="Application Root"
      showDetails={process.env.NODE_ENV === 'development'}
      onError={(error, errorInfo) => {
        // Custom error handler - send to analytics/monitoring
        console.error('Global error caught:', { error, errorInfo });
        // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
      }}
    >
      <ClerkProvider publishableKey={clerkPublishableKey}>
        <OnboardingProvider>
          <CopilotKit 
            publicApiKey={copilotApiKey}
            showDevConsole={false}
            onError={(e) => console.error("CopilotKit Error:", e)}
            
          >
            <Router>
              <ConditionalCopilotKit>
                <TokenInstaller />
                <Routes>
                <Route path="/" element={<RootRoute />} />
                <Route 
                  path="/onboarding" 
                  element={
                    <ErrorBoundary context="Onboarding Wizard" showDetails>
                      <Wizard />
                    </ErrorBoundary>
                  } 
                />
                {/* Error Boundary Testing - Development Only */}
                {process.env.NODE_ENV === 'development' && (
                  <Route path="/error-test" element={<ErrorBoundaryTest />} />
                )}
                <Route path="/dashboard" element={<ProtectedRoute><MainDashboard /></ProtectedRoute>} />
                <Route path="/seo" element={<ProtectedRoute><SEODashboard /></ProtectedRoute>} />
                <Route path="/seo-dashboard" element={<ProtectedRoute><SEODashboard /></ProtectedRoute>} />
                <Route path="/content-planning" element={<ProtectedRoute><ContentPlanningDashboard /></ProtectedRoute>} />
                <Route path="/facebook-writer" element={<ProtectedRoute><FacebookWriter /></ProtectedRoute>} />
                <Route path="/linkedin-writer" element={<ProtectedRoute><LinkedInWriter /></ProtectedRoute>} />
                <Route path="/blog-writer" element={<ProtectedRoute><BlogWriter /></ProtectedRoute>} />
                <Route path="/wix-test" element={<WixTestPage />} />
                <Route path="/wix-test-direct" element={<WixTestPage />} />
                <Route path="/wix/callback" element={<WixCallbackPage />} />
                <Route path="/gsc/callback" element={<GSCAuthCallback />} />
              </Routes>
            </ConditionalCopilotKit>
          </Router>
        </CopilotKit>
        </OnboardingProvider>
      </ClerkProvider>
    </ErrorBoundary>
  );
};

export default App; 