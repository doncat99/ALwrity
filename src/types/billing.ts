import { z } from 'zod';

// Core data structures for billing and usage tracking
export interface DashboardData {
  current_usage: UsageStats;
  trends: UsageTrends;
  limits: SubscriptionLimits;
  alerts: UsageAlert[];
  projections: CostProjections;
  summary: UsageSummary;
}

export interface UsageStats {
  billing_period: string;
  usage_status: 'active' | 'warning' | 'limit_reached';
  total_calls: number;
  total_tokens: number;
  total_cost: number;
  avg_response_time: number;
  error_rate: number;
  limits: SubscriptionLimits;
  provider_breakdown: ProviderBreakdown;
  alerts: UsageAlert[];
  usage_percentages: UsagePercentages;
  last_updated: string;
}

export interface ProviderBreakdown {
  gemini: ProviderUsage;
  openai: ProviderUsage;
  anthropic: ProviderUsage;
  mistral: ProviderUsage;
  tavily: ProviderUsage;
  serper: ProviderUsage;
  metaphor: ProviderUsage;
  firecrawl: ProviderUsage;
  stability: ProviderUsage;
}

export interface ProviderUsage {
  calls: number;
  tokens: number;
  cost: number;
}

export interface SubscriptionLimits {
  plan_name: string;
  tier: 'free' | 'basic' | 'pro' | 'enterprise';
  limits: {
    gemini_calls: number;
    openai_calls: number;
    anthropic_calls: number;
    mistral_calls: number;
    tavily_calls: number;
    serper_calls: number;
    metaphor_calls: number;
    firecrawl_calls: number;
    stability_calls: number;
    gemini_tokens: number;
    openai_tokens: number;
    anthropic_tokens: number;
    mistral_tokens: number;
    monthly_cost: number;
  };
  features: string[];
}

export interface UsageTrends {
  periods: string[];
  total_calls: number[];
  total_cost: number[];
  total_tokens: number[];
  provider_trends: {
    [key: string]: {
      calls: number[];
      cost: number[];
      tokens: number[];
    };
  };
}

export interface UsageAlert {
  id: number;
  type: string;
  threshold_percentage: number;
  provider?: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
  is_sent: boolean;
  sent_at?: string;
  is_read: boolean;
  read_at?: string;
  billing_period: string;
  created_at: string;
}

export interface CostProjections {
  projected_monthly_cost: number;
  cost_limit: number;
  projected_usage_percentage: number;
}

export interface UsageSummary {
  total_api_calls_this_month: number;
  total_cost_this_month: number;
  usage_status: string;
  unread_alerts: number;
}

export interface UsagePercentages {
  gemini_calls: number;
  openai_calls: number;
  anthropic_calls: number;
  mistral_calls: number;
  tavily_calls: number;
  serper_calls: number;
  metaphor_calls: number;
  firecrawl_calls: number;
  stability_calls: number;
  cost: number;
}

// API Response types
export interface BillingAPIResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface UsageAPIResponse extends BillingAPIResponse<UsageStats> {}
export interface DashboardAPIResponse extends BillingAPIResponse<DashboardData> {}
export interface AlertsAPIResponse extends BillingAPIResponse<{ alerts: UsageAlert[]; total: number; unread_count: number }> {}
