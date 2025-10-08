import React from 'react';
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Google as GoogleIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { gscAPI, type GSCSite } from '../../../api/gsc';

interface GSCPlatformCardProps {
  platform: {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    status: string;
  };
  gscSites: GSCSite[] | null;
  isLoading: boolean;
  onConnect: (platformId: string) => void;
  getStatusIcon: (status: string) => React.ReactElement;
  getStatusText: (status: string) => string;
  getStatusColor: (status: string) => string;
  onRefresh?: () => void;
}

const GSCPlatformCard: React.FC<GSCPlatformCardProps> = ({
  platform,
  gscSites,
  isLoading,
  onConnect,
  getStatusIcon,
  getStatusText,
  getStatusColor,
  onRefresh
}) => {
  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
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
          <Box sx={{ color: '#64748b', mr: 1 }}>
            {platform.icon}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1e293b' }}>
              {platform.name}
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.875rem' }}>
              {platform.description}
            </Typography>
          </Box>
          <Chip
            icon={getStatusIcon(platform.status)}
            label={getStatusText(platform.status)}
            color={getStatusColor(platform.status) as any}
            size="small"
          />
        </Box>

        {/* Connected Sites Display */}
        {platform.status === 'connected' && gscSites && gscSites.length > 0 && (
          <Box mb={2}>
            <Typography variant="body2" sx={{ fontWeight: 500, color: '#1e293b', mb: 1 }}>
              Connected Sites:
            </Typography>
            {gscSites.map((site, index) => (
              <Box
                key={index}
                sx={{
                  p: 1.5,
                  border: '1px solid #e2e8f0',
                  borderRadius: 1,
                  backgroundColor: '#f8fafc',
                  fontSize: '0.875rem',
                  color: '#475569',
                  fontFamily: 'monospace',
                  mb: 1
                }}
              >
                {site.siteUrl}
              </Box>
            ))}
          </Box>
        )}

        {/* Features as Chips */}
        <Box mb={2} sx={{ minHeight: '32px' }}>
          <Box display="flex" flexWrap="wrap" gap={0.5}>
            <Chip 
              label="SEO analytics" 
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
              label="Search performance" 
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
              label="Content optimization" 
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
          {platform.status === 'connected' ? (
            <>
              <Button
                variant="outlined"
                size="small"
                onClick={() => onConnect(platform.id)}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  borderColor: '#e2e8f0',
                  color: '#64748b',
                  flex: 1
                }}
              >
                Reconnect
              </Button>
              <Tooltip title="Refresh status">
                <IconButton 
                  onClick={handleRefresh} 
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
              onClick={() => onConnect(platform.id)}
              disabled={isLoading}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                flex: 1
              }}
            >
              Connect GSC
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default GSCPlatformCard;