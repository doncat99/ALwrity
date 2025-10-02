import React, { useState, useEffect } from 'react';
import { useCopilotAction } from '@copilotkit/react-core';
import { blogWriterApi, BlogSEOMetadataResponse } from '../../services/blogWriterApi';
import { apiClient } from '../../api/client';

interface PublisherProps {
  buildFullMarkdown: () => string;
  convertMarkdownToHTML: (md: string) => string;
  seoMetadata: BlogSEOMetadataResponse | null;
}

const useCopilotActionTyped = useCopilotAction as any;

interface WixConnectionStatus {
  connected: boolean;
  has_permissions: boolean;
  site_info?: any;
  permissions?: any;
  error?: string;
}

export const Publisher: React.FC<PublisherProps> = ({
  buildFullMarkdown,
  convertMarkdownToHTML,
  seoMetadata
}) => {
  const [wixConnectionStatus, setWixConnectionStatus] = useState<WixConnectionStatus | null>(null);
  const [checkingWixStatus, setCheckingWixStatus] = useState(false);

  // Check Wix connection status on component mount
  useEffect(() => {
    checkWixConnectionStatus();
  }, []);

  const checkWixConnectionStatus = async () => {
    setCheckingWixStatus(true);
    try {
      const response = await apiClient.get('/api/wix/connection/status');
      setWixConnectionStatus(response.data);
    } catch (error) {
      console.error('Failed to check Wix connection status:', error);
      setWixConnectionStatus({
        connected: false,
        has_permissions: false,
        error: 'Failed to check connection status'
      });
    } finally {
      setCheckingWixStatus(false);
    }
  };
  // Enhanced publish action with Wix support
  useCopilotActionTyped({
    name: 'publishToPlatform',
    description: 'Publish the blog to Wix or WordPress',
    parameters: [
      { name: 'platform', type: 'string', description: 'wix|wordpress', required: true },
      { name: 'schedule_time', type: 'string', description: 'Optional ISO datetime', required: false }
    ],
    handler: async ({ platform, schedule_time }: { platform: 'wix' | 'wordpress'; schedule_time?: string }) => {
      const md = buildFullMarkdown();
      const html = convertMarkdownToHTML(md);
      
      if (platform === 'wix') {
        // Check Wix connection status first
        if (!wixConnectionStatus?.connected) {
          return { 
            success: false, 
            message: 'Wix account not connected. Please connect your Wix account first using the Wix Test Page.',
            action_required: 'connect_wix'
          };
        }
        
        if (!wixConnectionStatus?.has_permissions) {
          return { 
            success: false, 
            message: 'Insufficient Wix permissions. Please reconnect your Wix account.',
            action_required: 'reconnect_wix'
          };
        }
        
        // Extract title from markdown (first heading or use default)
        const titleMatch = md.match(/^#\s+(.+)$/m);
        const title = titleMatch ? titleMatch[1] : 'Blog Post from ALwrity';
        
        try {
          const response = await apiClient.post('/api/wix/publish', {
            title: title,
            content: md,
            publish: true
          });
          
          if (response.data.success) {
            return { 
              success: true, 
              url: response.data.url,
              post_id: response.data.post_id,
              message: 'Blog post published successfully to Wix!'
            };
          } else {
            return { 
              success: false, 
              message: response.data.error || 'Failed to publish to Wix'
            };
          }
        } catch (error: any) {
          return { 
            success: false, 
            message: `Failed to publish to Wix: ${error.response?.data?.detail || error.message}`
          };
        }
      } else {
        // WordPress or other platforms
        if (!seoMetadata) return { success: false, message: 'Generate SEO metadata first' };
        const res = await blogWriterApi.publish({ platform, html, metadata: seoMetadata, schedule_time });
        return { success: true, url: res.url };
      }
    },
    render: ({ status, result }: any) => {
      if (status === 'complete') {
        if (result?.success) {
          return (
            <div style={{ padding: 12 }}>
              <div style={{ color: 'green', fontWeight: 'bold' }}>
                ✅ Published Successfully!
              </div>
              {result.url && (
                <div style={{ marginTop: 8 }}>
                  <a href={result.url} target="_blank" rel="noopener noreferrer">
                    View Published Post
                  </a>
                </div>
              )}
              {result.post_id && (
                <div style={{ fontSize: '0.9em', color: '#666', marginTop: 4 }}>
                  Post ID: {result.post_id}
                </div>
              )}
            </div>
          );
        } else {
          return (
            <div style={{ padding: 12 }}>
              <div style={{ color: 'red', fontWeight: 'bold' }}>
                ❌ Publishing Failed
              </div>
              <div style={{ marginTop: 8, color: '#666' }}>
                {result?.message}
              </div>
              {result?.action_required === 'connect_wix' && (
                <div style={{ marginTop: 8 }}>
                  <a href="/wix-test" target="_blank" rel="noopener noreferrer">
                    Connect Wix Account
                  </a>
                </div>
              )}
            </div>
          );
        }
      }
      return null;
    }
  });

  return null; // This component only provides the copilot action
};

export default Publisher;
