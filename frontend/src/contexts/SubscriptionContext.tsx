import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '../api/client';

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

  const checkSubscription = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get user ID from localStorage or auth context
      const userId = localStorage.getItem('user_id') || 'anonymous';

      const response = await apiClient.get(`/api/subscription/status/${userId}`);
      const subscriptionData = response.data.data;

      setSubscription(subscriptionData);
    } catch (err) {
      console.error('Error checking subscription:', err);

      // Check if it's a connection error that should be handled at the app level
      if (err instanceof Error && (err.name === 'NetworkError' || err.name === 'ConnectionError')) {
        // Re-throw connection errors to be handled by the app-level error boundary
        throw err;
      }

      setError(err instanceof Error ? err.message : 'Failed to check subscription');

      // Default to free tier on error
      setSubscription({
        active: true,
        plan: 'free',
        tier: 'free',
        can_use_api: true,
        limits: {
          gemini_calls: 100,
          openai_calls: 100,
          anthropic_calls: 100,
          mistral_calls: 100,
          tavily_calls: 50,
          serper_calls: 50,
          metaphor_calls: 50,
          firecrawl_calls: 50,
          stability_calls: 20,
          monthly_cost: 5.0
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshSubscription = async () => {
    await checkSubscription();
  };

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

    window.addEventListener('subscription-updated', handleSubscriptionUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('subscription-updated', handleSubscriptionUpdate);
    };
  }, []);

  const value: SubscriptionContextType = {
    subscription,
    loading,
    error,
    checkSubscription,
    refreshSubscription,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
