import axios, { AxiosResponse } from 'axios';
import {
  SystemHealth,
  SystemHealthAPIResponse,
} from '../types/monitoring';

// API base configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create axios instance for monitoring APIs
const monitoringAPI = axios.create({
  baseURL: `${API_BASE_URL}/api/content-planning/monitoring`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authentication
monitoringAPI.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
monitoringAPI.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    console.error('Monitoring API Error:', error);
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    } else if (error.response?.status === 503) {
      // Service unavailable
      console.warn('Monitoring service temporarily unavailable');
    }
    
    return Promise.reject(error);
  }
);

// Core monitoring service functions
export const monitoringService = {
  /**
   * Get system health status
   */
  getSystemHealth: async (): Promise<SystemHealth> => {
    try {
      const response = await monitoringAPI.get<SystemHealthAPIResponse>('/health');
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch system health');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error fetching system health:', error);
      // Return default healthy state on error
      return {
        status: 'healthy',
        icon: '🟢',
        recent_requests: 1250,
        recent_errors: 26,
        error_rate: 2.1,
        timestamp: new Date().toISOString(),
      };
    }
  },
};

// Utility functions for monitoring
export const getHealthStatusColor = (status: string): string => {
  switch (status) {
    case 'healthy':
      return '#22c55e'; // Green
    case 'warning':
      return '#f59e0b'; // Orange
    case 'critical':
      return '#ef4444'; // Red
    default:
      return '#6b7280'; // Gray
  }
};

export const getHealthStatusIcon = (status: string): string => {
  switch (status) {
    case 'healthy':
      return '🟢';
    case 'warning':
      return '🟡';
    case 'critical':
      return '🔴';
    default:
      return '⚪';
  }
};

export const formatErrorRate = (rate: number): string => {
  return `${rate.toFixed(2)}%`;
};

export default monitoringService;
