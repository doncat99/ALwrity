/**
 * Wix API Client
 * Handles Wix connection status and operations
 */

import { apiClient } from './client';

export interface WixStatus {
  connected: boolean;
  sites: Array<{
    id: string;
    blog_url: string;
    blog_id: string;
    created_at: string;
    scope: string;
  }>;
  total_sites: number;
  error?: string;
}

class WixAPI {
  private baseUrl = '/api/wix';
  private getAuthToken: (() => Promise<string | null>) | null = null;

  /**
   * Set the auth token getter function
   */
  setAuthTokenGetter(getToken: () => Promise<string | null>) {
    this.getAuthToken = getToken;
  }

  /**
   * Get authenticated API client with auth token
   */
  private async getAuthenticatedClient() {
    const token = this.getAuthToken ? await this.getAuthToken() : null;
    
    if (!token) {
      throw new Error('No authentication token available');
    }

    return apiClient.create({
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  /**
   * Get Wix connection status
   */
  async getStatus(): Promise<WixStatus> {
    try {
      const client = await this.getAuthenticatedClient();
      const response = await client.get(`${this.baseUrl}/status`);
      return response.data;
    } catch (error: any) {
      console.error('Wix API: Error getting status:', error);
      return {
        connected: false,
        sites: [],
        total_sites: 0,
        error: error.response?.data?.detail || error.message
      };
    }
  }

  /**
   * Health check for Wix service
   */
  async healthCheck(): Promise<boolean> {
    try {
      const client = await this.getAuthenticatedClient();
      await client.get(`${this.baseUrl}/connection/status`);
      return true;
    } catch (error) {
      console.error('Wix API: Health check failed:', error);
      return false;
    }
  }
}

export const wixAPI = new WixAPI();
