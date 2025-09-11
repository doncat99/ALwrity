import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  useTheme,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

// Services
import { billingService } from '../../services/billingService';
import { monitoringService } from '../../services/monitoringService';

// Types
import { DashboardData } from '../../types/billing';
import { SystemHealth } from '../../types/monitoring';

// Components
import BillingOverview from './BillingOverview';
import SystemHealthIndicator from '../monitoring/SystemHealthIndicator';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 }
  }
};

const BillingDashboard: React.FC = () => {
  const theme = useTheme();
  
  // State management
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch billing and monitoring data in parallel
      const [billingData, healthData] = await Promise.all([
        billingService.getDashboardData(),
        monitoringService.getSystemHealth()
      ]);
      
      setDashboardData(billingData);
      setSystemHealth(healthData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Loading state
  if (loading && !dashboardData) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <CircularProgress size={48} />
        <Typography variant="body1" color="text.secondary">
          Loading billing dashboard...
        </Typography>
      </Box>
    );
  }

  // Error state
  if (error && !dashboardData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="error" 
          action={
            <motion.button
              onClick={fetchDashboardData}
              style={{
                background: 'none',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Retry
            </motion.button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  if (!dashboardData) {
    return null;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Section Header */}
        <motion.div variants={cardVariants}>
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography 
              variant="h4" 
              component="h2" 
              sx={{ 
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}
            >
              💰 Billing & Usage Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Monitor your API usage, costs, and system performance in real-time
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </Typography>
          </Box>
        </motion.div>

        {/* Main Dashboard Grid */}
        <Grid container spacing={3}>
          {/* Top Row - Overview Cards */}
          <Grid item xs={12} md={6}>
            <motion.div variants={cardVariants}>
              <BillingOverview 
                usageStats={dashboardData.current_usage}
                onRefresh={fetchDashboardData}
              />
            </motion.div>
          </Grid>

          <Grid item xs={12} md={6}>
            <motion.div variants={cardVariants}>
              <SystemHealthIndicator 
                systemHealth={systemHealth}
                onRefresh={fetchDashboardData}
              />
            </motion.div>
          </Grid>

          {/* Bottom Row - Detailed Metrics */}
          <Grid item xs={12}>
            <motion.div variants={cardVariants}>
              <Card 
                sx={{ 
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 3
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    📊 Detailed Usage Metrics
                  </Typography>
                  
                  <Grid container spacing={3}>
                    {/* Usage Summary */}
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                          {dashboardData.current_usage.total_calls.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total API Calls
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          This month
                        </Typography>
                      </Box>
                    </Grid>

                    {/* Token Usage */}
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" sx={{ color: 'secondary.main', fontWeight: 'bold' }}>
                          {(dashboardData.current_usage.total_tokens / 1000).toFixed(1)}k
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Tokens Used
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          This month
                        </Typography>
                      </Box>
                    </Grid>

                    {/* Average Response Time */}
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" sx={{ color: 'warning.main', fontWeight: 'bold' }}>
                          {dashboardData.current_usage.avg_response_time.toFixed(0)}ms
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Avg Response Time
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Last 24 hours
                        </Typography>
                      </Box>
                    </Grid>

                    {/* Error Rate */}
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography 
                          variant="h4" 
                          sx={{ 
                            color: dashboardData.current_usage.error_rate > 5 ? 'error.main' : 'success.main',
                            fontWeight: 'bold' 
                          }}
                        >
                          {dashboardData.current_usage.error_rate.toFixed(2)}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Error Rate
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Last 24 hours
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </motion.div>
  );
};

export default BillingDashboard;
