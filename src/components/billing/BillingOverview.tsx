import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  RefreshCw,
} from 'lucide-react';

// Types
import { UsageStats } from '../../types/billing';

// Utils
import { 
  formatCurrency, 
  formatNumber, 
  formatPercentage,
  getUsageStatusColor,
  getUsageStatusIcon,
  calculateUsagePercentage
} from '../../services/billingService';

interface BillingOverviewProps {
  usageStats: UsageStats;
  onRefresh: () => void;
}

const BillingOverview: React.FC<BillingOverviewProps> = ({ 
  usageStats, 
  onRefresh 
}) => {
  const costUsagePercentage = calculateUsagePercentage(
    usageStats.total_cost, 
    usageStats.limits.limits.monthly_cost || 1
  );

  const getStatusChip = () => {
    const status = usageStats.usage_status;
    const color = getUsageStatusColor(status);
    const icon = getUsageStatusIcon(status);
    
    let chipColor: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';
    if (status === 'active') chipColor = 'success';
    else if (status === 'warning') chipColor = 'warning';
    else if (status === 'limit_reached') chipColor = 'error';

    return (
      <Chip
        icon={<span>{icon}</span>}
        label={status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
        color={chipColor}
        size="small"
        sx={{ fontWeight: 'bold' }}
      />
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card 
        sx={{ 
          height: '100%',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 3,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <CardContent sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold' }}>
              <DollarSign size={20} />
              Billing Overview
            </Typography>
            <Tooltip title="Refresh data">
              <IconButton 
                size="small" 
                onClick={onRefresh}
                sx={{ 
                  color: 'text.secondary',
                  '&:hover': { color: 'primary.main' }
                }}
              >
                <RefreshCw size={16} />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Status Chip */}
          <Box sx={{ mb: 3 }}>
            {getStatusChip()}
          </Box>
        </CardContent>

        <CardContent sx={{ pt: 0 }}>
          {/* Current Cost */}
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1
                }}
              >
                {formatCurrency(usageStats.total_cost)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Cost This Month
              </Typography>
            </motion.div>
          </Box>

          {/* Usage Metrics */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                API Calls
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {formatNumber(usageStats.total_calls)}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Tokens Used
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {formatNumber(usageStats.total_tokens)}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Avg Response Time
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {usageStats.avg_response_time.toFixed(0)}ms
              </Typography>
            </Box>
          </Box>

          {/* Cost Usage Progress */}
          {usageStats.limits.limits.monthly_cost > 0 && (
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Monthly Cost Limit
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {formatPercentage(costUsagePercentage)}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(costUsagePercentage, 100)}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: costUsagePercentage > 80 ? '#ef4444' : 
                                   costUsagePercentage > 60 ? '#f59e0b' : '#22c55e',
                    borderRadius: 4,
                  }
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {formatCurrency(usageStats.total_cost)} of {formatCurrency(usageStats.limits.limits.monthly_cost)} limit
              </Typography>
            </Box>
          )}

          {/* Plan Information */}
          <Box 
            sx={{ 
              p: 2, 
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: 2,
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Current Plan
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
              {usageStats.limits.plan_name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {usageStats.limits.tier.charAt(0).toUpperCase() + usageStats.limits.tier.slice(1)} Tier
            </Typography>
          </Box>

          {/* Quick Stats */}
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-around' }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                {usageStats.usage_percentages.gemini_calls.toFixed(0)}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Gemini Usage
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                {usageStats.error_rate.toFixed(1)}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Error Rate
              </Typography>
            </Box>
          </Box>
        </CardContent>

        {/* Decorative Elements */}
        <Box
          sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 100,
            height: 100,
            background: 'radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%)',
            borderRadius: '50%',
            pointerEvents: 'none'
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -30,
            left: -30,
            width: 60,
            height: 60,
            background: 'radial-gradient(circle, rgba(118, 75, 162, 0.1) 0%, transparent 70%)',
            borderRadius: '50%',
            pointerEvents: 'none'
          }}
        />
      </Card>
    </motion.div>
  );
};

export default BillingOverview;
