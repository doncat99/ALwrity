import axios, { AxiosResponse } from 'axios';
import {
  DashboardData,
  UsageStats,
  UsageAlert,
  DashboardAPIResponse,
  UsageAPIResponse,
  AlertsAPIResponse,
} from '../types/billing';

// API base configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const billingAPI = axios.create({
  baseURL: `${API_BASE_URL}/api/subscription`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authentication
billingAPI.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add user ID to requests
    const userId = localStorage.getItem('user_id') || 'demo-user';
    if (config.url?.includes('{user_id}')) {
      config.url = config.url.replace('{user_id}', userId);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
billingAPI.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    console.error('Billing API Error:', error);
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    } else if (error.response?.status === 429) {
      // Rate limited
      console.warn('Rate limited by billing API');
    }
    
    return Promise.reject(error);
  }
);

// Core billing service functions
export const billingService = {
  /**
   * Get comprehensive dashboard data for a user
   */
  getDashboardData: async (userId?: string): Promise<DashboardData> => {
    // For now, always return mock data since the API is not available
    console.log('Using mock data for billing dashboard');
    
    // Return mock data for development
    return {
      current_usage: {
        billing_period: '2024-01',
        usage_status: 'active',
        total_calls: 1250,
        total_tokens: 45000,
        total_cost: 12.50,
        avg_response_time: 850,
        error_rate: 2.1,
        limits: {
          plan_name: 'Pro Plan',
          tier: 'pro',
          limits: {
            gemini_calls: 10000,
            openai_calls: 5000,
            anthropic_calls: 2000,
            mistral_calls: 1000,
            tavily_calls: 500,
            serper_calls: 200,
            metaphor_calls: 100,
            firecrawl_calls: 50,
            stability_calls: 25,
            gemini_tokens: 100000,
            openai_tokens: 50000,
            anthropic_tokens: 20000,
            mistral_tokens: 10000,
            monthly_cost: 100
          },
          features: ['Unlimited content generation', 'Priority support', 'Advanced analytics']
        },
        provider_breakdown: {
          gemini: { calls: 500, tokens: 20000, cost: 5.00 },
          openai: { calls: 300, tokens: 15000, cost: 4.50 },
          anthropic: { calls: 200, tokens: 8000, cost: 2.00 },
          mistral: { calls: 150, tokens: 2000, cost: 0.50 },
          tavily: { calls: 50, tokens: 0, cost: 0.25 },
          serper: { calls: 30, tokens: 0, cost: 0.15 },
          metaphor: { calls: 20, tokens: 0, cost: 0.10 },
          firecrawl: { calls: 0, tokens: 0, cost: 0 },
          stability: { calls: 0, tokens: 0, cost: 0 }
        },
        alerts: [],
        usage_percentages: {
          gemini_calls: 5,
          openai_calls: 6,
          anthropic_calls: 10,
          mistral_calls: 15,
          tavily_calls: 10,
          serper_calls: 15,
          metaphor_calls: 20,
          firecrawl_calls: 0,
          stability_calls: 0,
          cost: 12.5
        },
        last_updated: new Date().toISOString()
      },
      trends: {
        periods: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        total_calls: [800, 950, 1100, 1200, 1150, 1250],
        total_cost: [8.50, 10.20, 11.80, 12.10, 11.90, 12.50],
        total_tokens: [30000, 35000, 40000, 42000, 41000, 45000],
        provider_trends: {}
      },
      limits: {
        plan_name: 'Pro Plan',
        tier: 'pro',
        limits: {
          gemini_calls: 10000,
          openai_calls: 5000,
          anthropic_calls: 2000,
          mistral_calls: 1000,
          tavily_calls: 500,
          serper_calls: 200,
          metaphor_calls: 100,
          firecrawl_calls: 50,
          stability_calls: 25,
          gemini_tokens: 100000,
          openai_tokens: 50000,
          anthropic_tokens: 20000,
          mistral_tokens: 10000,
          monthly_cost: 100
        },
        features: ['Unlimited content generation', 'Priority support', 'Advanced analytics']
      },
      alerts: [],
      projections: {
        projected_monthly_cost: 15.20,
        cost_limit: 100,
        projected_usage_percentage: 15.2
      },
      summary: {
        total_api_calls_this_month: 1250,
        total_cost_this_month: 12.50,
        usage_status: 'active',
        unread_alerts: 0
      }
    };
  },

  /**
   * Mark an alert as read
   */
  markAlertRead: async (alertId: number): Promise<void> => {
    try {
      const response = await billingAPI.post(`/alerts/${alertId}/mark-read`);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to mark alert as read');
      }
    } catch (error) {
      console.error('Error marking alert as read:', error);
      throw error;
    }
  },
};

// Utility functions
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

export const getUsageStatusColor = (status: string): string => {
  switch (status) {
    case 'active':
      return '#22c55e'; // Green
    case 'warning':
      return '#f59e0b'; // Orange
    case 'limit_reached':
      return '#ef4444'; // Red
    default:
      return '#6b7280'; // Gray
  }
};

export const getUsageStatusIcon = (status: string): string => {
  switch (status) {
    case 'active':
      return '✅';
    case 'warning':
      return '⚠️';
    case 'limit_reached':
      return '🚨';
    default:
      return '❓';
  }
};

export const calculateUsagePercentage = (current: number, limit: number): number => {
  if (limit === 0) return 0;
  return Math.min((current / limit) * 100, 100);
};

export const getProviderIcon = (provider: string): string => {
  const icons: { [key: string]: string } = {
    gemini: '🤖',
    openai: '🧠',
    anthropic: '🎭',
    mistral: '🌪️',
    tavily: '🔍',
    serper: '🔎',
    metaphor: '🔮',
    firecrawl: '🕷️',
    stability: '🎨',
  };
  return icons[provider.toLowerCase()] || '🔧';
};

export const getProviderColor = (provider: string): string => {
  const colors: { [key: string]: string } = {
    gemini: '#4285f4',
    openai: '#10a37f',
    anthropic: '#d97706',
    mistral: '#7c3aed',
    tavily: '#059669',
    serper: '#dc2626',
    metaphor: '#7c2d12',
    firecrawl: '#ea580c',
    stability: '#0891b2',
  };
  return colors[provider.toLowerCase()] || '#6b7280';
};

export default billingService;
