/**
 * SocialMediaPresenceSection Component
 * Displays social media accounts and their links
 */

import React from 'react';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
  Box
} from '@mui/material';
import {
  Share as ShareIcon,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  LinkedIn as LinkedInIcon,
  YouTube as YouTubeIcon,
  Twitter as TwitterIcon
} from '@mui/icons-material';

interface SocialMediaPresenceSectionProps {
  socialMediaAccounts: { [key: string]: string };
}

const SocialMediaPresenceSection: React.FC<SocialMediaPresenceSectionProps> = ({
  socialMediaAccounts
}) => {
  // Don't render if no social media accounts
  if (Object.keys(socialMediaAccounts).length === 0) {
    return null;
  }

  const platformIcons: { [key: string]: React.ReactNode } = {
    facebook: <FacebookIcon />,
    instagram: <InstagramIcon />,
    linkedin: <LinkedInIcon />,
    youtube: <YouTubeIcon />,
    twitter: <TwitterIcon />,
    tiktok: <ShareIcon /> // Fallback icon for TikTok
  };

  return (
    <>
      <Typography 
        variant="h6" 
        gutterBottom 
        fontWeight={600} 
        mb={3}
        sx={{ color: '#1a202c !important' }} // Force dark text
      >
        <ShareIcon sx={{ mr: 1, verticalAlign: 'middle', color: '#667eea !important' }} />
        Social Media Presence
      </Typography>
      
      <Grid container spacing={2} mb={4}>
        {Object.entries(socialMediaAccounts).map(([platform, url]) => {
          if (!url) return null;
          
          return (
            <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={platform}>
              <Card sx={{ 
                height: '100%',
                background: 'linear-gradient(135deg, #e0f2fe 0%, #b3e5fc 100%)',
                border: '1px solid #81d4fa',
                boxShadow: '0 4px 12px rgba(3, 169, 244, 0.15)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 20px rgba(3, 169, 244, 0.25)'
                }
              }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
                      {platformIcons[platform] || <ShareIcon />}
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="h6" fontWeight={600} textTransform="capitalize">
                        {platform}
                      </Typography>
                      <Button
                        variant="text"
                        size="small"
                        href={url as string}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ p: 0, minWidth: 'auto', textTransform: 'none' }}
                      >
                        View Profile
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </>
  );
};

export default SocialMediaPresenceSection;
