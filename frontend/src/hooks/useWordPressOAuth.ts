/**
 * WordPress OAuth Connection Hook
 * Manages WordPress.com OAuth2 authentication flow.
 */

import { useState, useEffect, useCallback } from 'react';
import { wordpressOAuthAPI, WordPressOAuthStatus, WordPressOAuthSite } from '../api/wordpressOAuth';
import { useAuth } from '@clerk/clerk-react';

export interface UseWordPressOAuthReturn {
  // Connection state
  connected: boolean;
  sites: WordPressOAuthSite[];
  totalSites: number;
  isLoading: boolean;
  
  // OAuth actions
  startOAuthFlow: () => Promise<void>;
  disconnectSite: (tokenId: number) => Promise<boolean>;
  refreshStatus: () => Promise<void>;
}

export const useWordPressOAuth = (): UseWordPressOAuthReturn => {
  const { getToken } = useAuth();
  const [connected, setConnected] = useState(false);
  const [sites, setSites] = useState<WordPressOAuthSite[]>([]);
  const [totalSites, setTotalSites] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Set up authentication
  useEffect(() => {
    const setupAuth = async () => {
      try {
        wordpressOAuthAPI.setAuthTokenGetter(async () => {
          try {
            return await getToken();
          } catch (e) {
            return null;
          }
        });
      } catch (error) {
        console.error('Error setting up WordPress OAuth API auth:', error);
      }
    };

    setupAuth();
  }, [getToken]);

  // Check connection status on mount
  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      setIsLoading(true);
      const status: WordPressOAuthStatus = await wordpressOAuthAPI.getStatus();
      
      setConnected(status.connected);
      setSites(status.sites || []);
      setTotalSites(status.total_sites);
      
      console.log('WordPress OAuth status checked:', status);
    } catch (error) {
      console.error('Error checking WordPress OAuth status:', error);
      setConnected(false);
      setSites([]);
      setTotalSites(0);
    } finally {
      setIsLoading(false);
    }
  };

  const startOAuthFlow = async () => {
    try {
      setIsLoading(true);
      
      const authData = await wordpressOAuthAPI.getAuthUrl();
      
      if (authData && authData.auth_url) {
        // Open OAuth popup window
        const popup = window.open(
          authData.auth_url,
          'wordpress-oauth',
          'width=600,height=700,scrollbars=yes,resizable=yes'
        );
        
        if (!popup) {
          throw new Error('Popup blocked. Please allow popups for this site.');
        }
        
        // Listen for popup completion and messages
        const messageHandler = (event: MessageEvent) => {
          // Accept messages only from the popup we opened and from trusted origins
          const trustedOrigins = [window.location.origin, 'https://littery-sonny-unscrutinisingly.ngrok-free.dev'];
          if (event.source !== popup) return;
          if (!trustedOrigins.includes(event.origin)) return;

          if (event.data.type === 'WPCOM_OAUTH_SUCCESS') {
            popup.close();
            clearInterval(checkClosed);
            // Refresh status after OAuth completion
            setTimeout(() => {
              checkStatus();
            }, 1000);
          } else if (event.data.type === 'WPCOM_OAUTH_ERROR') {
            popup.close();
            clearInterval(checkClosed);
            console.error('WordPress OAuth error:', event.data.error);
            // Refresh status to show disconnected state
            setTimeout(() => {
              checkStatus();
            }, 1000);
          }
        };

        window.addEventListener('message', messageHandler);
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            window.removeEventListener('message', messageHandler);
            // Refresh status after OAuth completion
            setTimeout(() => {
              checkStatus();
            }, 1000);
          }
        }, 1000);
        
        console.log('WordPress OAuth flow started');
      } else {
        throw new Error('Failed to get WordPress OAuth URL');
      }
    } catch (error) {
      console.error('Error starting WordPress OAuth flow:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectSite = async (tokenId: number): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const result = await wordpressOAuthAPI.disconnectSite(tokenId);
      
      if (result.success) {
        // Refresh status after disconnection
        await checkStatus();
        console.log('WordPress site disconnected successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error disconnecting WordPress site:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshStatus = useCallback(async (): Promise<void> => {
    await checkStatus();
  }, []);

  return {
    // Connection state
    connected,
    sites,
    totalSites,
    isLoading,
    
    // OAuth actions
    startOAuthFlow,
    disconnectSite,
    refreshStatus
  };
};
