import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { apiClient, setGlobalSubscriptionErrorHandler } from '../api/client';
import SubscriptionExpiredModal from '../components/SubscriptionExpiredModal';

export interface SubscriptionLimits {
  gemini_calls: number;
  openai_calls: number;
  anthropic_calls: number;
  mistral_calls: number;
  tavily_calls: number;
  serper_calls: number;
  metaphor_calls: number;
  firecrawl_calls: number;
  stability_calls: number;
  monthly_cost: number;
}

export interface SubscriptionStatus {
  active: boolean;
  plan: string;
  tier: string;
  can_use_api: boolean;
  reason?: string;
  limits: SubscriptionLimits;
}

interface SubscriptionContextType {
  subscription: SubscriptionStatus | null;
  loading: boolean;
  error: string | null;
  checkSubscription: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
  showExpiredModal: () => void;
  hideExpiredModal: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

interface SubscriptionProviderProps {
  children: ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalErrorData, setModalErrorData] = useState<any>(null);
  const [lastModalShowTime, setLastModalShowTime] = useState<number>(0);
  const [deferredError, setDeferredError] = useState<any>(null);
  const [lastCheckTime, setLastCheckTime] = useState<number>(0);
  // New: Grace window after plan changes to avoid noisy UX
  const [graceUntil, setGraceUntil] = useState<number>(0);
  const [planSignature, setPlanSignature] = useState<string>("");

  const checkSubscription = useCallback(async () => {
    // Throttle subscription checks to prevent excessive API calls
    const now = Date.now();
    const THROTTLE_MS = 5000; // 5 seconds minimum between checks
    
    if (now - lastCheckTime < THROTTLE_MS) {
      console.log('SubscriptionContext: Check throttled (5s)');
      return;
    }
    
    setLastCheckTime(now);
    setLoading(true);
    setError(null);

    try {
      // Get user ID from localStorage or auth context
      const userId = localStorage.getItem('user_id') || 'anonymous';
      
      // Don't make API call if user is anonymous (not authenticated)
      if (userId === 'anonymous') {
        console.log('SubscriptionContext: User not authenticated, skipping subscription check');
        setLoading(false);
        return;
      }

      console.log('SubscriptionContext: Checking subscription for user:', userId);
      const response = await apiClient.get(`/api/subscription/status/${userId}`);
      const subscriptionData = response.data.data;

      console.log('SubscriptionContext: Received subscription data from backend:', subscriptionData);
      setSubscription(subscriptionData);

      // Detect plan/tier change and start a grace window (5 minutes)
      try {
        const newSignature = `${subscriptionData?.plan || ''}:${subscriptionData?.tier || ''}`;
        if (newSignature && newSignature !== planSignature) {
          console.log('SubscriptionContext: Plan change detected, starting grace window');
          setPlanSignature(newSignature);
          setGraceUntil(Date.now() + 5 * 60 * 1000);
          // Close any existing modal as plan just changed
          if (showModal) {
            setShowModal(false);
            setModalErrorData(null);
          }
        }
      } catch (_e) {}
      
      // If we have a valid subscription and the modal is open, close it
      if (subscriptionData && subscriptionData.active && showModal) {
        console.log('SubscriptionContext: Valid subscription detected, closing modal');
        setShowModal(false);
        setModalErrorData(null);
        setLastModalShowTime(0); // Reset the cooldown timer
      }

      // Also check if this is a usage limit error that should be suppressed
      if (subscriptionData && subscriptionData.active && modalErrorData) {
        const now = Date.now();
        const timeSinceLastModal = now - lastModalShowTime;

        // If it's been less than 10 minutes since modal was shown for usage limits, keep it closed
        if (timeSinceLastModal < 600000 && modalErrorData.usage_info) {
          console.log('SubscriptionContext: Recent usage limit modal, keeping it closed');
        }
      }

      // Check if we have a deferred error to process now that we have subscription data
      if (subscriptionData && deferredError) {
        console.log('SubscriptionContext: Processing deferred error now that subscription data is available');
        const error = deferredError;
        setDeferredError(null); // Clear the deferred error

        // Re-run the error handling logic now that we have subscription data
        const status = error.response?.status;
        if (status === 429 || status === 402) {
          const now = Date.now();

          // If active, suppress modal for usage limits
          if (subscriptionData.active) {
            console.log('SubscriptionContext: Active subscription (deferred); suppressing usage-limit modal');
            return;
          }

          // For inactive subscriptions, show modal immediately
          console.log('SubscriptionContext: Showing deferred modal for inactive subscription');
          const errorData = error.response?.data || {};
          setModalErrorData({
            provider: errorData.provider,
            usage_info: errorData.usage_info,
            message: errorData.message || errorData.error
          });
          setShowModal(true);
          setLastModalShowTime(now);
        }
      }
    } catch (err) {
      console.error('Error checking subscription:', err);

      // Check if it's a connection error that should be handled at the app level
      if (err instanceof Error && (err.name === 'NetworkError' || err.name === 'ConnectionError')) {
        // Re-throw connection errors to be handled by the app-level error boundary
        throw err;
      }

      setError(err instanceof Error ? err.message : 'Failed to check subscription');

      // Don't default to free tier on error - preserve existing subscription or leave null
      // This prevents overriding correct subscription data with 'free' on temporary errors
      console.warn('Subscription check failed, preserving existing data');
    } finally {
      setLoading(false);
    }
  }, [lastCheckTime, planSignature, showModal, modalErrorData, lastModalShowTime, graceUntil]);

  const refreshSubscription = useCallback(async () => {
    await checkSubscription();
  }, [checkSubscription]);

  const showExpiredModal = useCallback(() => {
    setShowModal(true);
  }, []);

  const hideExpiredModal = useCallback(() => {
    setShowModal(false);
  }, []);

  const handleRenewSubscription = useCallback(() => {
    window.location.href = '/pricing';
  }, []);

  // Global subscription error handler for API client
  const globalSubscriptionErrorHandler = useCallback((error: any) => {
    console.log('SubscriptionContext: Global error handler triggered', error);
    
    // Check if it's a subscription-related error
    const status = error.response?.status;
    
    if (status === 429 || status === 402) {
      console.log('SubscriptionContext: Subscription error detected');
      
      const now = Date.now();

      // If we have subscription data and it's active, always suppress modal for usage limits
      if (subscription && subscription.active) {
        console.log('SubscriptionContext: Active subscription; suppressing usage-limit modal');
        return true; // Do not show modal for active plan usage limits
      }

      // If we don't have subscription data yet, defer the decision
      if (!subscription) {
        console.log('SubscriptionContext: No subscription data yet, deferring modal decision');
        setDeferredError(error);
        return true; // Handle the error but don't show modal yet
      }

      // If subscription is not active, show modal immediately
      if (!subscription.active) {
        console.log('SubscriptionContext: Inactive subscription, showing modal immediately');
        const errorData = error.response?.data || {};
        setModalErrorData({
          provider: errorData.provider,
          usage_info: errorData.usage_info,
          message: errorData.message || errorData.error
        });
        setShowModal(true);
        setLastModalShowTime(now);
        return true;
      }
    }
    
    return false; // Not a subscription error
  }, [subscription]);

  // Register the global error handler with the API client
  useEffect(() => {
    console.log('SubscriptionContext: Registering global subscription error handler');
    setGlobalSubscriptionErrorHandler(globalSubscriptionErrorHandler);
  }, [globalSubscriptionErrorHandler]);

  useEffect(() => {
    // Check subscription on mount
    checkSubscription();

    // Set up periodic refresh (every 5 minutes)
    const interval = setInterval(checkSubscription, 5 * 60 * 1000);

    // Listen for subscription updates
    const handleSubscriptionUpdate = () => {
      console.log('Subscription updated, refreshing...');
      checkSubscription();
    };

    // Listen for user authentication changes
    const handleUserAuth = () => {
      console.log('User authenticated, checking subscription...');
      checkSubscription();
    };

    window.addEventListener('subscription-updated', handleSubscriptionUpdate);
    window.addEventListener('user-authenticated', handleUserAuth);

    return () => {
      clearInterval(interval);
      window.removeEventListener('subscription-updated', handleSubscriptionUpdate);
      window.removeEventListener('user-authenticated', handleUserAuth);
    };
  }, []); // Remove checkSubscription dependency to prevent loop

  const value: SubscriptionContextType = {
    subscription,
    loading,
    error,
    checkSubscription,
    refreshSubscription,
    showExpiredModal,
    hideExpiredModal,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
      <SubscriptionExpiredModal
        open={showModal}
        onClose={hideExpiredModal}
        onRenewSubscription={handleRenewSubscription}
        subscriptionData={subscription}
        errorData={modalErrorData}
      />
    </SubscriptionContext.Provider>
  );
};
