/**
 * WordPress OAuth Platform Card Component
 * Simplified WordPress connection using OAuth2 flow.
 */

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider
} from '@mui/material';
import {
  Web as WordPressIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useWordPressOAuth } from '../../../hooks/useWordPressOAuth';

interface WordPressOAuthPlatformCardProps {
  onConnect?: (platform: string) => void;
  onDisconnect?: (platform: string) => void;
  connectedPlatforms: string[];
  setConnectedPlatforms: (platforms: string[]) => void;
}

const WordPressOAuthPlatformCard: React.FC<WordPressOAuthPlatformCardProps> = ({
  onConnect,
  onDisconnect,
  connectedPlatforms,
  setConnectedPlatforms
}) => {
  const {
    connected,
    sites,
    totalSites,
    isLoading,
    startOAuthFlow,
    disconnectSite,
    refreshStatus
  } = useWordPressOAuth();

  const [showSitesDialog, setShowSitesDialog] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const isConnected = connected && totalSites > 0;

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      await startOAuthFlow();
      // OAuth flow will handle the connection
    } catch (error: any) {
      console.error('Error connecting to WordPress:', error);

      // Show user-friendly error message for configuration issues
      if (error.response?.status === 500 && error.response?.data?.detail?.includes('not configured')) {
        alert('WordPress OAuth is not properly configured. Please contact support or check that WordPress.com application credentials are set up correctly.');
      } else {
        alert('Failed to connect to WordPress. Please try again or contact support if the problem persists.');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectSite = async (tokenId: number) => {
    try {
      const success = await disconnectSite(tokenId);
      if (success) {
        // Check if we still have connected sites
        const remainingSites = sites.filter(site => site.id !== tokenId);
        if (remainingSites.length === 0) {
          setConnectedPlatforms(connectedPlatforms.filter(p => p !== 'wordpress'));
          onDisconnect?.('wordpress');
        }
        setShowSitesDialog(false);
      }
    } catch (error) {
      console.error('Error disconnecting WordPress site:', error);
    }
  };

  const getStatusIcon = () => {
    if (isLoading || isConnecting) return <CircularProgress size={20} />;
    if (isConnected) return <CheckCircleIcon color="success" />;
    return <ErrorIcon color="error" />;
  };

  const getStatusColor = () => {
    if (isConnected) return 'success';
    return 'default';
  };

  const getStatusText = () => {
    if (isLoading || isConnecting) return 'Connecting...';
    if (isConnected) return `Connected (${totalSites} site${totalSites > 1 ? 's' : ''})`;
    return 'Not Connected';
  };

  return (
    <>
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
            <Box sx={{ color: '#21759b', mr: 1 }}>
              <WordPressIcon />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                WordPress
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.875rem' }}>
                Connect your WordPress.com sites with secure OAuth authentication
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
          {isConnected && totalSites > 0 && (
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
                {sites.length > 0 ? sites[0].blog_url : 'Connected WordPress Site'}
              </Box>
            </Box>
          )}

          {/* Features as Chips */}
          <Box mb={2} sx={{ minHeight: '32px' }}>
            <Box display="flex" flexWrap="wrap" gap={0.5}>
              <Chip 
                label="OAuth connection" 
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
                label="Direct publishing" 
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
                label="Media integration" 
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
                label="Category & tags" 
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
            {isConnected ? (
              <>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setShowSitesDialog(true)}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    borderColor: '#e2e8f0',
                    color: '#64748b',
                    flex: 1
                  }}
                >
                  Manage Sites ({totalSites})
                </Button>
                <Tooltip title="Refresh status">
                  <IconButton 
                    onClick={refreshStatus} 
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
                onClick={handleConnect}
                disabled={isLoading || isConnecting}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  flex: 1
                }}
              >
                {isConnecting ? 'Connecting...' : 'Connect WordPress'}
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Manage Sites Dialog */}
      <Dialog open={showSitesDialog} onClose={() => setShowSitesDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Manage WordPress Sites</DialogTitle>
        <DialogContent>
          <List>
            {sites.map((site, index) => (
              <React.Fragment key={site.id}>
                <ListItem>
                  <ListItemText
                    primary={site.blog_url}
                    secondary={
                      <Box>
                        <Typography variant="body2" component="span" color="text.secondary" display="block">
                          Blog ID: {site.blog_id}
                        </Typography>
                        <Typography variant="caption" component="span" color="text.secondary" display="block">
                          Connected: {new Date(site.created_at).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" component="span" color="text.secondary" display="block">
                          Scope: {site.scope}
                        </Typography>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Tooltip title="Disconnect site">
                      <IconButton 
                        edge="end" 
                        onClick={() => handleDisconnectSite(site.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < sites.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSitesDialog(false)}>Close</Button>
          <Button onClick={() => { setShowSitesDialog(false); handleConnect(); }} variant="contained">
            Add New Site
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default WordPressOAuthPlatformCard;
