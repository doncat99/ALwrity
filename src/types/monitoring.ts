import { z } from 'zod';

// System health and monitoring types
export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  icon: string;
  recent_requests: number;
  recent_errors: number;
  error_rate: number;
  timestamp: string;
}

// API Response types
export interface MonitoringAPIResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface SystemHealthAPIResponse extends MonitoringAPIResponse<SystemHealth> {}
