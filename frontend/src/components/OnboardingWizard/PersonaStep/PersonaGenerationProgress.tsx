import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  CircularProgress,
  Grid
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  AutoAwesome as AutoAwesomeIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { Fade } from '@mui/material';

export interface GenerationStep {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  progress: number;
}

export interface ProgressMessage {
  timestamp: string;
  message: string;
  progress?: number;
}

export interface PersonaGenerationProgressProps {
  isGenerating: boolean;
  progress: number;
  currentStep: string;
  generationSteps: GenerationStep[];
  progressMessages: ProgressMessage[];
}

export const PersonaGenerationProgress: React.FC<PersonaGenerationProgressProps> = ({
  isGenerating,
  progress,
  currentStep,
  generationSteps,
  progressMessages
}) => {
  const activeStep = generationSteps.find(step => step.id === currentStep);

  return (
    <>
      {/* Generation Progress Card */}
      {isGenerating && (
        <Fade in={true}>
          <Card
            sx={{
              mb: 4,
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.05)',
              borderRadius: 3,
              overflow: 'hidden'
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <AutoAwesomeIcon sx={{ fontSize: 20 }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 0.5 }}>
                    {activeStep?.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    {activeStep?.description}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mb: 3 }}>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#e2e8f0',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      background: 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)'
                    }
                  }}
                />
                <Typography variant="body2" sx={{ mt: 1, fontWeight: 500, color: '#475569' }}>
                  {progress}% Complete
                </Typography>
              </Box>

              {/* Real-time progress messages */}
              {progressMessages.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#334155', mb: 2 }}>
                    Recent Updates:
                  </Typography>
                  <Box sx={{ maxHeight: 120, overflow: 'auto', pl: 1 }}>
                    {progressMessages.slice(-3).map((msg, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            flexShrink: 0
                          }}
                        />
                        <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.875rem' }}>
                          {msg.message}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Fade>
      )}

      {/* Generation Steps Grid */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {generationSteps.map((step, index) => (
                <Grid item xs={12} sm={6} md={3} key={step.id}>
                  <Card
                    sx={{
                      height: '100%',
                      background: step.completed
                        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                        : step.id === currentStep
                        ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                        : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                      color: step.completed || step.id === currentStep ? 'white' : '#1e293b',
                      transition: 'all 0.3s ease',
                      border: '1px solid',
                      borderColor: step.completed || step.id === currentStep ? 'transparent' : '#e2e8f0',
                      boxShadow: step.completed || step.id === currentStep
                        ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                        : '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.05)',
                      borderRadius: 3,
                      cursor: 'default',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: step.completed || step.id === currentStep
                          ? '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.05)'
                          : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                      }
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                      <Box sx={{ mb: 2 }}>
                        {step.completed ? (
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: '50%',
                              background: 'rgba(255, 255, 255, 0.2)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mx: 'auto',
                              backdropFilter: 'blur(10px)'
                            }}
                          >
                            <CheckCircleIcon sx={{ fontSize: 24, color: 'white' }} />
                          </Box>
                        ) : step.id === currentStep ? (
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: '50%',
                              background: 'rgba(255, 255, 255, 0.2)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mx: 'auto',
                              backdropFilter: 'blur(10px)',
                              position: 'relative'
                            }}
                          >
                            <CircularProgress
                              size={24}
                              sx={{
                                color: 'white',
                                '& .MuiCircularProgress-circle': {
                                  strokeLinecap: 'round',
                                }
                              }}
                            />
                          </Box>
                        ) : (
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mx: 'auto'
                            }}
                          >
                            <Box sx={{ color: '#64748b' }}>
                              {step.icon}
                            </Box>
                          </Box>
                        )}
                      </Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        {step.name}
                      </Typography>
                      <Typography variant="caption" sx={{
                        opacity: step.completed || step.id === currentStep ? 0.9 : 0.7,
                        lineHeight: 1.4,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {step.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PersonaGenerationProgress;

