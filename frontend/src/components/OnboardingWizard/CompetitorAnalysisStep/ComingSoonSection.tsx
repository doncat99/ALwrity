import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Analytics as AnalyticsIcon,
  CheckCircle as CheckIcon,
  Insights as InsightsIcon
} from '@mui/icons-material';

export const ComingSoonSection: React.FC = () => {
  const [openModal, setOpenModal] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

  const features = [
    {
      id: 'deep-competitor-analysis',
      title: 'Deep Competitor Analysis',
      description: 'Comprehensive analysis of competitor websites and content strategies',
      icon: <SearchIcon />,
      status: 'Coming Soon',
      color: '#3b82f6',
      details: [
        'Analyze 15-25 relevant competitors automatically discovered',
        'Crawl competitor homepages for content strategy analysis',
        'Extract competitive advantages and market positioning',
        'Identify content gaps and opportunities',
        'Generate strategic recommendations based on competitive intelligence'
      ]
    },
    {
      id: 'sitemap-benchmarking',
      title: 'Competitive Sitemap Benchmarking',
      description: 'Compare your site structure against competitors',
      icon: <AnalyticsIcon />,
      status: 'In Development',
      color: '#10b981',
      details: [
        'Analyze competitor sitemaps for structure insights',
        'Benchmark content volume against market leaders',
        'Compare publishing frequency and patterns',
        'Identify missing content categories',
        'Get SEO structure optimization recommendations'
      ]
    },
    {
      id: 'ai-competitive-insights',
      title: 'AI-Powered Competitive Insights',
      description: 'Advanced AI analysis of competitive landscape',
      icon: <InsightsIcon />,
      status: 'Planned',
      color: '#8b5cf6',
      details: [
        'AI-generated competitive intelligence reports',
        'Market positioning analysis with business impact',
        'Content strategy recommendations based on competitor data',
        'Competitive advantage identification',
        'Strategic roadmap for competitive differentiation'
      ]
    }
  ];

  const handleFeatureClick = (featureId: string) => {
    setSelectedFeature(featureId);
    setOpenModal(true);
  };

  const selectedFeatureData = features.find(f => f.id === selectedFeature);

  return (
    <>
      <Box sx={{ mt: 4, mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b', mb: 1.5 }}>
          🔍 Coming Soon
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748b', mb: 4, fontSize: '1.1rem' }}>
          Advanced competitor analysis features to give you the competitive edge
        </Typography>

        <Grid container spacing={2}>
          {features.map((feature) => (
            <Grid item xs={12} md={4} key={feature.id}>
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: '2px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.15)',
                    borderColor: feature.color,
                    '& .feature-icon': {
                      transform: 'scale(1.1)',
                      backgroundColor: `${feature.color}20`
                    }
                  }
                }}
                onClick={() => handleFeatureClick(feature.id)}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                      className="feature-icon"
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        backgroundColor: `${feature.color}15`,
                        color: feature.color,
                        mr: 2,
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}>
                        {feature.title}
                      </Typography>
                      <Chip
                        label={feature.status}
                        size="small"
                        sx={{
                          backgroundColor: `${feature.color}20`,
                          color: feature.color,
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          height: 24,
                          '& .MuiChip-label': {
                            px: 1.5
                          }
                        }}
                      />
                    </Box>
                  </Box>
                  
                  <Typography variant="body1" sx={{ color: '#64748b', mb: 3, lineHeight: 1.6 }}>
                    {feature.description}
                  </Typography>

                  <Button
                    variant="outlined"
                    size="medium"
                    sx={{
                      borderColor: feature.color,
                      color: feature.color,
                      fontWeight: 600,
                      px: 3,
                      py: 1,
                      borderRadius: 2,
                      textTransform: 'none',
                      '&:hover': {
                        backgroundColor: `${feature.color}15`,
                        borderColor: feature.color,
                        transform: 'translateY(-1px)'
                      }
                    }}
                  >
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Alert 
          severity="info" 
          sx={{ 
            mt: 4, 
            backgroundColor: '#f0f9ff',
            border: '2px solid #0ea5e9',
            borderRadius: 3,
            '& .MuiAlert-icon': {
              color: '#0ea5e9',
              fontSize: '1.5rem'
            }
          }}
        >
          <Typography variant="body1" sx={{ color: '#0c4a6e', fontWeight: 500 }}>
            <strong>What's Next:</strong> These advanced competitor analysis features will be available in upcoming releases. 
            Your current competitor research provides valuable insights to get started!
          </Typography>
        </Alert>
      </Box>

      {/* Feature Details Modal */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#ffffff',
            borderRadius: 3,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }
        }}
      >
        <DialogTitle sx={{ pb: 2, backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            {selectedFeatureData && (
              <>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    backgroundColor: `${selectedFeatureData.color}15`,
                    color: selectedFeatureData.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {selectedFeatureData.icon}
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}>
                    {selectedFeatureData.title}
                  </Typography>
                  <Chip
                    label={selectedFeatureData.status}
                    size="medium"
                    sx={{
                      backgroundColor: `${selectedFeatureData.color}15`,
                      color: selectedFeatureData.color,
                      fontWeight: 600,
                      fontSize: '0.875rem'
                    }}
                  />
                </Box>
              </>
            )}
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ backgroundColor: '#ffffff', p: 3 }}>
          {selectedFeatureData && (
            <>
              <Typography variant="body1" sx={{ color: '#64748b', mb: 4, fontSize: '1.2rem', lineHeight: 1.7, fontWeight: 500 }}>
                {selectedFeatureData.description}
              </Typography>

              <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, color: '#1e293b', fontSize: '1.3rem' }}>
                Key Features:
              </Typography>

              <List sx={{ pl: 0 }}>
                {selectedFeatureData.details.map((detail, index) => (
                  <ListItem key={index} sx={{ pl: 0, py: 1 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <CheckIcon sx={{ color: selectedFeatureData.color, fontSize: 20 }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={detail}
                      primaryTypographyProps={{
                        variant: 'body1',
                        color: '#374151',
                        fontWeight: 600,
                        fontSize: '1.05rem',
                        lineHeight: 1.6
                      }}
                    />
                  </ListItem>
                ))}
              </List>

              {selectedFeatureData.id === 'deep-competitor-analysis' && (
                <Box sx={{ mt: 3, p: 3, backgroundColor: '#f8fafc', borderRadius: 3, border: '1px solid #e2e8f0' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: '#1e293b', fontSize: '1.1rem' }}>
                    How It Works:
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#64748b', fontSize: '1.05rem', lineHeight: 1.7 }}>
                    Our AI automatically discovers 15-25 relevant competitors using advanced search algorithms. 
                    Then we crawl each competitor's homepage to analyze their content strategy, identify their 
                    competitive advantages, and find content gaps that present opportunities for your business.
                  </Typography>
                </Box>
              )}

              {selectedFeatureData.id === 'sitemap-benchmarking' && (
                <Box sx={{ mt: 3, p: 3, backgroundColor: '#f0f9ff', borderRadius: 3, border: '1px solid #e2e8f0' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: '#1e293b', fontSize: '1.1rem' }}>
                    Competitive Intelligence:
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#64748b', fontSize: '1.05rem', lineHeight: 1.7 }}>
                    We analyze competitor sitemaps to understand their content structure, publishing patterns, 
                    and SEO optimization. This gives you data-driven insights into how your site compares to 
                    market leaders and what improvements will have the biggest competitive impact.
                  </Typography>
                </Box>
              )}

              {selectedFeatureData.id === 'ai-competitive-insights' && (
                <Box sx={{ mt: 3, p: 3, backgroundColor: '#f0f9ff', borderRadius: 3, border: '1px solid #e2e8f0' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: '#1e293b', fontSize: '1.1rem' }}>
                    Strategic Value:
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#64748b', fontSize: '1.05rem', lineHeight: 1.7 }}>
                    Our AI analyzes the competitive landscape to provide strategic recommendations with 
                    business impact estimates. You'll get specific content priorities, competitive positioning 
                    advice, and a roadmap for differentiating your brand in the market.
                  </Typography>
                </Box>
              )}
            </>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 1, backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
          <Button 
            onClick={() => setOpenModal(false)}
            variant="outlined"
            sx={{
              borderColor: '#d1d5db',
              color: '#6b7280',
              '&:hover': {
                borderColor: '#9ca3af',
                backgroundColor: '#f9fafb'
              }
            }}
          >
            Close
          </Button>
          <Button 
            onClick={() => setOpenModal(false)}
            variant="contained"
            sx={{
              backgroundColor: selectedFeatureData?.color || '#3b82f6',
              '&:hover': {
                backgroundColor: selectedFeatureData?.color || '#3b82f6',
                opacity: 0.9
              }
            }}
          >
            Notify Me When Ready
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ComingSoonSection;
