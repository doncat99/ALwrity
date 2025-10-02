import React from 'react';
import { 
  Box, 
  Button, 
  Container, 
  Typography, 
  Stack, 
  Grid,
  useTheme,
  alpha
} from '@mui/material';
import OptimizedImage from './OptimizedImage';
import { SignInButton } from '@clerk/clerk-react';
import { RocketLaunch } from '@mui/icons-material';
import { motion } from 'framer-motion';

const EnterpriseCTA: React.FC = () => {
  const theme = useTheme();

  // Framer Motion variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
  };

  const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12 } },
  };

  // Glassmorphism styles
  const glassPanelSx = {
    background: `linear-gradient(135deg, ${alpha(theme.palette.common.white, 0.06)} 0%, ${alpha(theme.palette.common.white, 0.02)} 100%)`,
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 4,
    boxShadow: '0 10px 30px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)'
  } as const;

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
        <Box
          sx={{
            ...glassPanelSx,
            p: { xs: 4, md: 8 },
            textAlign: 'center'
          }}
        >
          <Grid container spacing={6} alignItems="center">
            {/* Left side - Image (40%) */}
            <Grid item xs={12} md={5}>
              <motion.div variants={fadeInUp}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                    minHeight: { xs: '350px', md: '500px' },
                    width: '100%'
                  }}
                >
                  <OptimizedImage
                    src="/alwrity_landing_copilot.png"
                    alt="ALwrity Co-Pilot Interface"
                    priority={true}
                    sx={{
                      borderRadius: 3,
                      boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.02)'
                      }
                    }}
                  />
                </Box>
              </motion.div>
            </Grid>

            {/* Right side - Content (60%) */}
            <Grid item xs={12} md={7}>
              <motion.div variants={fadeInUp}>
                <Stack spacing={4} alignItems={{ xs: 'center', md: 'flex-start' }} textAlign={{ xs: 'center', md: 'left' }}>
                  <Typography variant="h3" fontWeight={700}>
                    Ready to Transform Your Content Creation?
                  </Typography>
                  <Typography variant="h6" color="text.secondary" maxWidth="700px">
                    Join thousands of creators, marketers, and businesses already using ALwrity's open-source AI platform. 
                    Start creating professional content in minutes, not hours.
                  </Typography>
                  
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
                    <SignInButton mode="redirect" forceRedirectUrl="/">
                      <Button 
                        variant="contained" 
                        size="large"
                        startIcon={<RocketLaunch />}
                        sx={{
                          py: 2,
                          px: 6,
                          fontSize: '1.2rem',
                          fontWeight: 600,
                          borderRadius: 2,
                          background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                          '&:hover': {
                            boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)',
                            transform: 'translateY(-2px)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Start Creating Now
                      </Button>
                    </SignInButton>
                    
                    <Stack alignItems={{ xs: 'center', sm: 'flex-start' }} spacing={1}>
                      <Typography variant="body2" color="text.secondary">
                        ✓ Free to get started
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ✓ Open-source & transparent
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ✓ No credit card required
                      </Typography>
                    </Stack>
                  </Stack>
                </Stack>
              </motion.div>
            </Grid>
          </Grid>
        </Box>
      </motion.div>
    </Container>
  );
};

export default EnterpriseCTA;
