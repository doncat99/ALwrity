import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Fade,
  Stack,
  Chip,
  Tooltip,
  Alert
} from '@mui/material';
import {
  Email as EmailIcon,
  Business as BusinessIcon,
  TrendingUp as TrendingUpIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Verified as VerifiedIcon
} from '@mui/icons-material';

interface EmailSectionProps {
  email: string;
  onEmailChange: (email: string) => void;
}

const EmailSection: React.FC<EmailSectionProps> = ({ email, onEmailChange }) => {
  const [showBenefits, setShowBenefits] = useState<boolean>(false);

  return (
    <Fade in timeout={400} mountOnEnter unmountOnExit>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 2 }}>
          📧 Your Business Email Address
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
          Help us send you personalized business insights, daily tasks, and growth opportunities
        </Typography>
        
        <Card sx={{ 
          border: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
          borderRadius: 2,
          mb: 3
        }}>
          <CardContent sx={{ p: 3 }}>
            <TextField
              fullWidth
              label="Email Address"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder="your@business.com"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: '#64748b' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#3b82f6',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#3b82f6',
                  },
                },
                '& .MuiInputBase-input': {
                  color: '#1e293b',
                  fontWeight: 500,
                  fontSize: '1rem',
                },
                '& .MuiInputLabel-root': {
                  color: '#64748b',
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#3b82f6',
                },
              }}
            />
            
            {/* Progressive Disclosure - Benefits Section */}
            <Box 
              sx={{ 
                mt: 3,
                cursor: 'pointer',
                '&:hover': {
                  '& .benefits-trigger': {
                    color: '#3b82f6',
                  }
                }
              }}
              onMouseEnter={() => setShowBenefits(true)}
              onMouseLeave={() => setShowBenefits(false)}
            >
              <Typography 
                variant="subtitle2" 
                className="benefits-trigger"
                sx={{ 
                  fontWeight: 600, 
                  color: '#64748b',
                  transition: 'color 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                Why we need your email:
                <Box sx={{ 
                  width: 16, 
                  height: 16, 
                  borderRadius: '50%', 
                  backgroundColor: '#e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  color: '#64748b'
                }}>
                  ?
                </Box>
              </Typography>
              
              {/* Benefits Content - Shows on Hover */}
              <Fade in={showBenefits} timeout={300} mountOnEnter unmountOnExit>
                <Box sx={{ mt: 2 }}>
                  <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
                    <Tooltip title="Get daily AI-generated tasks to review and approve for your business growth" placement="top">
                      <Chip
                        icon={<BusinessIcon />}
                        label="Daily Business Tasks"
                        size="small"
                        sx={{
                          backgroundColor: '#f0f9ff',
                          color: '#0c4a6e',
                          border: '1px solid #0ea5e9',
                          '&:hover': {
                            backgroundColor: '#e0f2fe',
                          }
                        }}
                      />
                    </Tooltip>
                    
                    <Tooltip title="Receive personalized content strategies and performance insights" placement="top">
                      <Chip 
                        icon={<TrendingUpIcon />}
                        label="Growth Insights"
                        size="small"
                        sx={{
                          backgroundColor: '#f0fdf4',
                          color: '#0c4a6e',
                          border: '1px solid #10b981',
                          '&:hover': {
                            backgroundColor: '#dcfce7',
                          }
                        }}
                      />
                    </Tooltip>
                    
                    <Tooltip title="Get notified about new features, resources, and business opportunities" placement="top">
                      <Chip
                        icon={<NotificationsIcon />}
                        label="Feature Updates"
                        size="small"
                        sx={{
                          backgroundColor: '#fef3c7',
                          color: '#92400e',
                          border: '1px solid #f59e0b',
                          '&:hover': {
                            backgroundColor: '#fef3c7',
                          }
                        }}
                      />
                    </Tooltip>
                    
                    <Tooltip title="Your email is secure and we never spam - only business-focused content" placement="top">
                      <Chip
                        icon={<SecurityIcon />}
                        label="No Spam Promise"
                        size="small"
                        sx={{
                          backgroundColor: '#f3f4f6',
                          color: '#374151',
                          border: '1px solid #9ca3af',
                          '&:hover': {
                            backgroundColor: '#e5e7eb',
                          }
                        }}
                      />
                    </Tooltip>
                  </Stack>
                  
                  {/* AI-First Platform Message */}
                  <Alert 
                    severity="info" 
                    sx={{ 
                      mb: 2,
                      backgroundColor: '#f0f9ff',
                      border: '1px solid #0ea5e9',
                      borderRadius: 2,
                      '& .MuiAlert-icon': {
                        color: '#0ea5e9'
                      }
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <VerifiedIcon sx={{ color: '#0ea5e9' }} />
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0c4a6e' }}>
                          AI-First, Human-Approved Platform
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#0c4a6e', mt: 0.5 }}>
                          We generate tasks and insights, but you stay in control. Your email helps us send you 
                          the right opportunities to review and approve for maximum business growth.
                        </Typography>
                      </Box>
                    </Stack>
                  </Alert>
                  
                  {/* Security & Privacy Message */}
                  <Alert 
                    severity="info" 
                    sx={{ 
                      backgroundColor: '#f0f9ff',
                      border: '1px solid #0ea5e9',
                      borderRadius: 2,
                      '& .MuiAlert-icon': {
                        color: '#0ea5e9'
                      }
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <SecurityIcon sx={{ color: '#0ea5e9' }} />
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0c4a6e' }}>
                          Your Data is Secure & Private
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#0c4a6e', mt: 0.5 }}>
                          We use OAuth 2.0 for secure connections. Your credentials are never stored. 
                          You can revoke access anytime from your account settings.
                        </Typography>
                      </Box>
                    </Stack>
                  </Alert>
                </Box>
              </Fade>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Fade>
  );
};

export default EmailSection;
