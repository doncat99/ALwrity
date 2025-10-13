import React from 'react';
import { Avatar, Box, Menu, MenuItem, Typography, Tooltip, Chip } from '@mui/material';
import { useUser, useClerk } from '@clerk/clerk-react';
import { useSubscription } from '../../contexts/SubscriptionContext';

interface UserBadgeProps {
  colorMode?: 'light' | 'dark';
}

const UserBadge: React.FC<UserBadgeProps> = ({ colorMode = 'light' }) => {
  const { user, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const { subscription } = useSubscription();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const initials = React.useMemo(() => {
    const first = user?.firstName?.[0] || '';
    const last = user?.lastName?.[0] || '';
    return (first + last || user?.username?.[0] || user?.primaryEmailAddress?.emailAddress?.[0] || '?').toUpperCase();
  }, [user]);

  if (!isSignedIn) return null;

  // Get plan display info
  const getPlanColor = () => {
    switch (subscription?.plan) {
      case 'free': return '#4caf50';
      case 'basic': return '#2196f3';
      case 'pro': return '#9c27b0';
      case 'enterprise': return '#ff9800';
      default: return '#757575';
    }
  };

  const getPlanLabel = () => {
    if (!subscription?.active) return 'No Plan';
    return subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1);
  };

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleSignOut = async () => {
    try {
      await signOut();
    } finally {
      window.location.assign('/');
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {/* Subscription Plan Chip */}
      <Chip
        label={getPlanLabel()}
        size="small"
        sx={{
          bgcolor: `${getPlanColor()}20`,
          border: `1px solid ${getPlanColor()}`,
          color: getPlanColor(),
          fontWeight: 700,
          fontSize: '0.75rem',
          height: 24,
        }}
      />
      
      <Tooltip title={`${user?.fullName || user?.username || user?.primaryEmailAddress?.emailAddress || 'User'}`}> 
        <Avatar
          onClick={handleOpen}
          sx={{
            width: 36,
            height: 36,
            cursor: 'pointer',
            bgcolor: colorMode === 'dark' ? 'rgba(255,255,255,0.2)' : 'primary.main',
            color: colorMode === 'dark' ? 'white' : 'white',
            fontWeight: 700,
          }}
          src={user?.imageUrl || undefined}
        >
          {initials}
        </Avatar>
      </Tooltip>
      
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Box sx={{ px: 2, py: 1, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {user?.fullName || user?.username || 'User'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user?.primaryEmailAddress?.emailAddress}
          </Typography>
        </Box>
        
        {/* Subscription Info in Menu */}
        <Box sx={{ px: 2, py: 1.5, bgcolor: 'rgba(0,0,0,0.02)' }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            Current Plan
          </Typography>
          <Chip
            label={getPlanLabel()}
            size="small"
            sx={{
              bgcolor: `${getPlanColor()}20`,
              border: `1px solid ${getPlanColor()}`,
              color: getPlanColor(),
              fontWeight: 700,
              fontSize: '0.75rem',
            }}
          />
        </Box>
        
        <MenuItem onClick={() => { handleClose(); window.location.href = '/pricing'; }}>
          Manage Subscription
        </MenuItem>
        <MenuItem onClick={handleSignOut}>Sign out</MenuItem>
      </Menu>
    </Box>
  );
};

export default UserBadge;


