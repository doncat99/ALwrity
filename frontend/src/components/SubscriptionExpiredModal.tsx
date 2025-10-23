import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  Paper
} from '@mui/material';
import {
  CreditCard,
  Warning,
  ArrowForward
} from '@mui/icons-material';

interface SubscriptionExpiredModalProps {
  open: boolean;
  onClose: () => void;
  onRenewSubscription: () => void;
  subscriptionData?: {
    plan?: string;
    tier?: string;
    limits?: any;
  } | null;
  errorData?: {
    provider?: string;
    usage_info?: any;
    message?: string;
  } | null;
}

const SubscriptionExpiredModal: React.FC<SubscriptionExpiredModalProps> = ({
  open,
  onClose,
  onRenewSubscription,
  subscriptionData,
  errorData
}) => {
  const handleRenewClick = () => {
    onRenewSubscription();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'linear-gradient(135deg, #fff 0%, #f8fafc 100%)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          <CreditCard sx={{ fontSize: 32, color: 'warning.main' }} />
          <Typography variant="h4" sx={{ fontWeight: 600, color: 'text.primary' }}>
            {errorData?.usage_info ? 'Usage Limit Reached' : 'Subscription Expired'}
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ textAlign: 'center', px: 4, py: 2 }}>
        <Alert 
          severity="warning" 
          sx={{ 
            mb: 3, 
            borderRadius: 2,
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            border: '1px solid #f59e0b'
          }}
          icon={<Warning sx={{ color: '#d97706' }} />}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#92400e' }}>
            {errorData?.usage_info ? 'You\'ve reached your API usage limit' : 'Your subscription has expired'}
          </Typography>
        </Alert>

        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            mb: 3, 
            background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
            border: '1px solid #cbd5e1',
            borderRadius: 2
          }}
        >
          <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
            {errorData?.message || (errorData?.usage_info 
              ? 'You\'ve reached your monthly usage limit for this plan. Upgrade your plan to get higher limits.'
              : 'To continue using Alwrity and access all features, you need to renew your subscription.'
            )}
          </Typography>
          
          {errorData?.usage_info && (
            <Box sx={{ mb: 2, p: 2, background: 'rgba(255,255,255,0.7)', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                Usage Information:
              </Typography>
              {errorData.usage_info.call_usage_percentage && (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  You've used {errorData.usage_info.call_usage_percentage.toFixed(1)}% of your monthly limit
                </Typography>
              )}
              {errorData.provider && (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Provider: {errorData.provider}
                </Typography>
              )}
            </Box>
          )}
          
          {subscriptionData && (
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
              {subscriptionData.plan && (
                <Box sx={{ 
                  px: 2, 
                  py: 1, 
                  background: 'rgba(255,255,255,0.7)', 
                  borderRadius: 1,
                  border: '1px solid #e2e8f0'
                }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                    Current Plan: {subscriptionData.plan}
                  </Typography>
                </Box>
              )}
              {subscriptionData.tier && subscriptionData.tier !== subscriptionData.plan && (
                <Box sx={{ 
                  px: 2, 
                  py: 1, 
                  background: 'rgba(255,255,255,0.7)', 
                  borderRadius: 1,
                  border: '1px solid #e2e8f0'
                }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                    Tier: {subscriptionData.tier}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Paper>

        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
          Renewing your subscription will restore access to:
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, textAlign: 'left', maxWidth: 300, mx: 'auto' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            ✓ AI Content Generation
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            ✓ Website Analysis
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            ✓ Research Tools
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            ✓ All Premium Features
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 4, pb: 4, gap: 2 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            py: 1.5,
            borderColor: 'rgba(0,0,0,0.2)',
            color: 'text.primary',
            '&:hover': {
              borderColor: 'rgba(0,0,0,0.4)',
              background: 'rgba(0,0,0,0.04)',
            }
          }}
        >
          Maybe Later
        </Button>
        
        <Button
          variant="contained"
          onClick={handleRenewClick}
          startIcon={<CreditCard />}
          endIcon={<ArrowForward />}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            px: 4,
            py: 1.5,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              transform: 'translateY(-1px)',
              boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
            }
          }}
        >
          Renew Subscription
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SubscriptionExpiredModal;
