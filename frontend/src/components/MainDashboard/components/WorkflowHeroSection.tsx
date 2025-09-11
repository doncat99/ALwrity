import React from 'react';
import {
  Box,
  Typography,
  Button,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlayArrow, 
  TrendingUp, 
  Rocket,
  ArrowRight,
  Star
} from '@mui/icons-material';

interface WorkflowHeroSectionProps {
  onStartWorkflow: () => void;
  isWorkflowActive: boolean;
  isLoading: boolean;
}

const WorkflowHeroSection: React.FC<WorkflowHeroSectionProps> = ({
  onStartWorkflow,
  isWorkflowActive,
  isLoading
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Show hero section only when workflow is not started, not in progress, and not completed
  const shouldShowHero = !isWorkflowActive;

  return (
    <AnimatePresence>
      {shouldShowHero && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Backdrop Overlay - Only over pillars section */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(6px)',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 2, // Match the parent container's border radius
            }}
          >
            {/* Hero Content */}
            <Box
              sx={{
                textAlign: 'center',
                maxWidth: isMobile ? '90%' : '500px',
                px: 3,
                py: 4,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                backdropFilter: 'blur(20px)',
                borderRadius: 3,
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 15px 30px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(45deg, rgba(255,107,53,0.1) 0%, rgba(255,140,66,0.1) 50%, rgba(255,107,53,0.1) 100%)',
                  backgroundSize: '200% 200%',
                  animation: 'gradientShift 6s ease-in-out infinite',
                  zIndex: -1,
                },
                '@keyframes gradientShift': {
                  '0%, 100%': { backgroundPosition: '0% 50%' },
                  '50%': { backgroundPosition: '100% 50%' },
                },
              }}
            >
              {/* Floating Sparkles */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 20,
                  right: 20,
                  animation: 'float 3s ease-in-out infinite',
                  '@keyframes float': {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                  },
                }}
              >
                <Star sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 24 }} />
              </Box>
              
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 20,
                  left: 20,
                  animation: 'float 3s ease-in-out infinite 1.5s',
                  '@keyframes float': {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                  },
                }}
              >
                <TrendingUp sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 24 }} />
              </Box>

              {/* Main Content */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                {/* Icon */}
                <Box sx={{ mb: 2 }}>
                  <motion.div
                    animate={{ 
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    <Rocket 
                      sx={{ 
                        fontSize: isMobile ? 40 : 48,
                        color: '#FF6B35',
                        filter: 'drop-shadow(0 4px 8px rgba(255,107,53,0.3))'
                      }} 
                    />
                  </motion.div>
                </Box>

                {/* Main Heading */}
                <Typography
                  variant={isMobile ? "h5" : "h4"}
                  sx={{
                    fontWeight: 800,
                    color: '#ffffff',
                    mb: 1.5,
                    textShadow: '0 4px 8px rgba(0,0,0,0.3)',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Grow Your Business Now
                </Typography>

                {/* Supporting Text */}
                <Typography
                  variant={isMobile ? "body2" : "body1"}
                  sx={{
                    color: 'rgba(255,255,255,0.9)',
                    mb: 3,
                    lineHeight: 1.5,
                    maxWidth: '400px',
                    mx: 'auto',
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  }}
                >
                  Start your personalized content workflow and watch your digital marketing transform. 
                  Our AI-powered system will guide you through every step of your content journey.
                </Typography>

                {/* CTA Button */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<PlayArrow />}
                    endIcon={<ArrowRight />}
                    onClick={onStartWorkflow}
                    disabled={isLoading}
                    sx={{
                      background: 'linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%)',
                      border: '2px solid transparent',
                      borderRadius: 2,
                      px: 4,
                      py: 1.5,
                      fontSize: isMobile ? '0.9rem' : '1rem',
                      fontWeight: 700,
                      textTransform: 'none',
                      boxShadow: '0 6px 24px rgba(255,107,53,0.4), 0 0 0 1px rgba(255,255,255,0.2)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #E55A2B 0%, #D1491F 100%)',
                        boxShadow: '0 12px 40px rgba(255,107,53,0.6), 0 0 0 1px rgba(255,255,255,0.3)',
                        transform: 'translateY(-2px)',
                      },
                      '&:disabled': {
                        background: 'rgba(255,255,255,0.1)',
                        color: 'rgba(255,255,255,0.5)',
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent)',
                        animation: 'shimmer 2.5s infinite',
                        zIndex: 1,
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: -4,
                        left: -4,
                        right: -4,
                        bottom: -4,
                        background: 'linear-gradient(45deg, #FF6B35, #FF8C42, #FF6B35, #FF8C42)',
                        backgroundSize: '400% 400%',
                        borderRadius: 'inherit',
                        zIndex: -1,
                        animation: 'borderGlow 3s ease-in-out infinite',
                      },
                      '@keyframes shimmer': {
                        '0%': { left: '-100%' },
                        '100%': { left: '100%' },
                      },
                      '@keyframes borderGlow': {
                        '0%, 100%': { backgroundPosition: '0% 50%' },
                        '50%': { backgroundPosition: '100% 50%' },
                      },
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    {isLoading ? 'Starting...' : '🚀 Start Your Journey'}
                  </Button>
                </motion.div>

                {/* Additional Info */}
                <Typography
                  variant="caption"
                  sx={{
                    color: 'rgba(255,255,255,0.7)',
                    mt: 2,
                    display: 'block',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                  }}
                >
                  ✨ Personalized workflow • 🎯 AI-powered guidance • 📈 Business growth
                </Typography>
              </motion.div>
            </Box>
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WorkflowHeroSection;
