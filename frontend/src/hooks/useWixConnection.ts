/**
 * Wix Connection Hook
 * Manages Wix connection state and operations
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { wixAPI, WixStatus } from '../api/wix';

export const useWixConnection = () => {
  const { getToken } = useAuth();
  const [status, setStatus] = useState<WixStatus>({
    connected: false,
    sites: [],
    total_sites: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  // Set up auth token getter for Wix API
  useEffect(() => {
    wixAPI.setAuthTokenGetter(async () => {
      try {
        const template = process.env.REACT_APP_CLERK_JWT_TEMPLATE;
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

  const checkStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      // Check sessionStorage for Wix tokens (like WixTestPage does)
      const connectedFlag = sessionStorage.getItem('wix_connected') === 'true';
      const tokensRaw = sessionStorage.getItem('wix_tokens');
      
      if (connectedFlag && tokensRaw) {
        const tokens = JSON.parse(tokensRaw);
        
        // Set connected status with site information from tokens
        setStatus({
          connected: true,
          sites: [{ 
            id: 'wix-site-1', 
            blog_url: 'Connected Wix Site', 
            blog_id: 'wix-blog', 
            created_at: new Date().toISOString(), 
            scope: 'BLOG.CREATE-DRAFT,BLOG.PUBLISH,MEDIA.MANAGE' 
          }],
          total_sites: 1
        });
        
        console.log('Wix status checked: connected via sessionStorage');
      } else {
        setStatus({
          connected: false,
          sites: [],
          total_sites: 0,
          error: 'No Wix connection found'
        });
        console.log('Wix status checked: not connected');
      }
    } catch (error) {
      console.error('Error checking Wix status:', error);
      setStatus({
        connected: false,
        sites: [],
        total_sites: 0,
        error: 'Error checking connection status'
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check status on mount
  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  return {
    connected: status.connected,
    sites: status.sites,
    totalSites: status.total_sites,
    isLoading,
    checkStatus
  };
};
