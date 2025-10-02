import React from 'react';
import { Avatar, Box, Button, Menu, MenuItem, Typography, Tooltip } from '@mui/material';
import { useUser, useClerk } from '@clerk/clerk-react';

interface UserBadgeProps {
  colorMode?: 'light' | 'dark';
}

const UserBadge: React.FC<UserBadgeProps> = ({ colorMode = 'light' }) => {
  const { user, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const initials = React.useMemo(() => {
    const first = user?.firstName?.[0] || '';
    const last = user?.lastName?.[0] || '';
    return (first + last || user?.username?.[0] || user?.primaryEmailAddress?.emailAddress?.[0] || '?').toUpperCase();
  }, [user]);

  if (!isSignedIn) return null;

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
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {user?.fullName || user?.username || 'User'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user?.primaryEmailAddress?.emailAddress}
          </Typography>
        </Box>
        <MenuItem onClick={handleClose}>Signed in</MenuItem>
        <MenuItem onClick={handleSignOut}>Sign out</MenuItem>
      </Menu>
    </Box>
  );
};

export default UserBadge;


