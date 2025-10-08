/**
 * Wix Platform Card Component
 * Handles Wix connection using the same pattern as GSC/WordPress
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Web as WixIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useWixConnection } from '../../../hooks/useWixConnection';
import { usePlatformConnections } from './usePlatformConnections';

interface WixPlatformCardProps {
  onConnect?: (platform: string) => void;
  onDisconnect?: (platform: string) => void;
  connectedPlatforms: string[];
  setConnectedPlatforms: (platforms: string[]) => void;
}

const WixPlatformCard: React.FC<WixPlatformCardProps> = ({
  onConnect,
  onDisconnect,
  connectedPlatforms,
  setConnectedPlatforms
}) => {
  const { connected, sites, totalSites, isLoading, checkStatus } = useWixConnection();
  const { handleConnect } = usePlatformConnections();
  const [isConnecting, setIsConnecting] = useState(false);

  // Update connected platforms when Wix connection changes
  useEffect(() => {
    if (connected && totalSites > 0) {
      if (!connectedPlatforms.includes('wix')) {
        setConnectedPlatforms([...connectedPlatforms, 'wix']);
      }
    } else {
      if (connectedPlatforms.includes('wix')) {
        setConnectedPlatforms(connectedPlatforms.filter(p => p !== 'wix'));
      }
    }
  }, [connected, totalSites, connectedPlatforms, setConnectedPlatforms]);

  const handleWixConnect = async () => {
    try {
      setIsConnecting(true);
      await handleConnect('wix');
    } catch (error) {
      console.error('Error connecting to Wix:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const getStatusIcon = () => {
    if (isLoading || isConnecting) return <CircularProgress size={20} />;
    if (connected && totalSites > 0) return <CheckCircleIcon color="success" />;
    return <ErrorIcon color="error" />;
  };

  const getStatusColor = () => {
    if (connected && totalSites > 0) return 'success';
    return 'default';
  };

  const getStatusText = () => {
    if (isLoading || isConnecting) return 'Connecting...';
    if (connected && totalSites > 0) return `Connected (${totalSites} site${totalSites > 1 ? 's' : ''})`;
    return 'Not Connected';
  };

  return (
    <Card 
      sx={{
        height: '100%',
        border: '1px solid #e2e8f0',
        backgroundColor: '#ffffff',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          transform: 'translateY(-2px)'
        }
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" mb={2}>
          <Box sx={{ color: '#ff6b6b', mr: 1 }}>
            <WixIcon />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1e293b' }}>
              Wix
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.875rem' }}>
              Connect your Wix website for automated content publishing and analytics
            </Typography>
          </Box>
          <Chip
            icon={getStatusIcon()}
            label={getStatusText()}
            color={getStatusColor() as any}
            size="small"
          />
        </Box>

        {/* Connected Sites Display */}
        {connected && totalSites > 0 && (
          <Box mb={2}>
            <Typography variant="body2" sx={{ fontWeight: 500, color: '#1e293b', mb: 1 }}>
              Connected Sites:
            </Typography>
            <Box
              sx={{
                p: 1.5,
                border: '1px solid #e2e8f0',
                borderRadius: 1,
                backgroundColor: '#f8fafc',
                fontSize: '0.875rem',
                color: '#475569',
                fontFamily: 'monospace'
              }}
            >
              {sites.length > 0 ? sites[0].blog_url : 'Connected Wix Site'}
            </Box>
          </Box>
        )}

        {/* Features as Chips */}
        <Box mb={2} sx={{ minHeight: '32px' }}>
          <Box display="flex" flexWrap="wrap" gap={0.5}>
            <Chip 
              label="Auto-publish content" 
              size="small" 
              variant="outlined" 
              sx={{ 
                color: '#475569',
                borderColor: '#e2e8f0',
                '&:hover': {
                  backgroundColor: '#f8fafc'
                }
              }} 
            />
            <Chip 
              label="Analytics tracking" 
              size="small" 
              variant="outlined" 
              sx={{ 
                color: '#475569',
                borderColor: '#e2e8f0',
                '&:hover': {
                  backgroundColor: '#f8fafc'
                }
              }} 
            />
            <Chip 
              label="SEO optimization" 
              size="small" 
              variant="outlined" 
              sx={{ 
                color: '#475569',
                borderColor: '#e2e8f0',
                '&:hover': {
                  backgroundColor: '#f8fafc'
                }
              }} 
            />
          </Box>
        </Box>

        {/* Actions */}
        <Box display="flex" gap={1}>
          {connected && totalSites > 0 ? (
            <>
              <Button
                variant="outlined"
                size="small"
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  borderColor: '#e2e8f0',
                  color: '#64748b',
                  flex: 1
                }}
                disabled
              >
                Connected ({totalSites})
              </Button>
              <Tooltip title="Refresh status">
                <IconButton 
                  onClick={checkStatus} 
                  disabled={isLoading}
                  size="small"
                  sx={{ color: '#64748b' }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </>
          ) : (
            <Button
              variant="contained"
              size="small"
              onClick={handleWixConnect}
              disabled={isLoading || isConnecting}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                flex: 1
              }}
            >
              {isConnecting ? 'Connecting...' : 'Connect Wix'}
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default WixPlatformCard;
