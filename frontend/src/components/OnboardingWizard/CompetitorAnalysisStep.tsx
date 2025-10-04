import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Avatar,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent
} from '@mui/material';
import {
  Business as BusinessIcon,
  Assessment as AssessmentIcon,
  OpenInNew as OpenInNewIcon,
  Refresh as RefreshIcon,
  Share as ShareIcon,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  LinkedIn as LinkedInIcon,
  YouTube as YouTubeIcon,
  Twitter as TwitterIcon
} from '@mui/icons-material';
import { aiApiClient } from '../../api/client';  // Use aiApiClient for long-running operations
import { useOnboardingStyles } from './common/useOnboardingStyles';

interface Competitor {
  url: string;
  domain: string;
  title: string;
  summary: string;
  relevance_score: number;
  highlights?: string[];
  competitive_insights: {
    business_model: string;
    target_audience: string;
  };
  content_insights: {
    content_focus: string;
    content_quality: string;
  };
}

interface ResearchSummary {
  total_competitors: number;
  market_insights: string;
  key_findings: string[];
}

interface CompetitorAnalysisStepProps {
  onContinue: (researchData?: any) => void;
  onBack: () => void;
  // sessionId removed - backend uses authenticated user from Clerk token
  userUrl: string;
  industryContext?: string;
}

const CompetitorAnalysisStep: React.FC<CompetitorAnalysisStepProps> = ({
  onContinue,
  onBack,
  userUrl,
  industryContext
}) => {
  const classes = useOnboardingStyles();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStep, setAnalysisStep] = useState('');
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [socialMediaAccounts, setSocialMediaAccounts] = useState<any>({});
  const [socialMediaCitations, setSocialMediaCitations] = useState<any[]>([]);
  const [researchSummary, setResearchSummary] = useState<ResearchSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showHighlightsModal, setShowHighlightsModal] = useState(false);
  const [selectedCompetitorHighlights, setSelectedCompetitorHighlights] = useState<string[]>([]);
  const [selectedCompetitorTitle, setSelectedCompetitorTitle] = useState<string>('');
  const [usingCachedData, setUsingCachedData] = useState(false);

  // Check for cached competitor analysis data
  const loadCachedAnalysis = useCallback(() => {
    try {
      const cachedData = localStorage.getItem('competitor_analysis_data');
      const cachedUrl = localStorage.getItem('competitor_analysis_url');
      const cacheTimestamp = localStorage.getItem('competitor_analysis_timestamp');
      
      // Get current URL for comparison
      const finalUserUrl = userUrl || localStorage.getItem('website_url') || '';
      
      if (cachedData && cachedUrl === finalUserUrl && cacheTimestamp) {
        const cacheAge = Date.now() - parseInt(cacheTimestamp);
        const cacheValidDuration = 24 * 60 * 60 * 1000; // 24 hours
        
        // Check if cache is still valid (less than 24 hours old)
        if (cacheAge < cacheValidDuration) {
          const parsedData = JSON.parse(cachedData);
          
          console.log('CompetitorAnalysisStep: Loading cached competitor analysis:', {
            url: cachedUrl,
            cacheAge: Math.round(cacheAge / (60 * 1000)),
            competitors: parsedData.competitors?.length || 0
          });
          
          setCompetitors(parsedData.competitors || []);
          setSocialMediaAccounts(parsedData.social_media_accounts || {});
          setSocialMediaCitations(parsedData.social_media_citations || []);
          setResearchSummary(parsedData.research_summary || null);
          setUsingCachedData(true);
          
          return true; // Successfully loaded from cache
        } else {
          console.log('CompetitorAnalysisStep: Cache expired, will run fresh analysis');
        }
      }
      
      return false; // No valid cache found
    } catch (err) {
      console.error('Error loading cached analysis:', err);
      return false;
    }
  }, [userUrl]);

  const startCompetitorDiscovery = useCallback(async (force = false) => {
    // Check cache first unless forced
    if (!force && loadCachedAnalysis()) {
      console.log('CompetitorAnalysisStep: Using cached competitor analysis');
      return;
    }

    setIsAnalyzing(true);
    setShowProgressModal(true);
    setError(null);
    setAnalysisProgress(0);
    setAnalysisStep('Initializing competitor discovery...');
    setUsingCachedData(false);

    try {
      setAnalysisStep('Validating session...');
      setAnalysisProgress(20);
      await new Promise(resolve => setTimeout(resolve, 500));

      setAnalysisStep('Discovering competitors using AI...');
      setAnalysisProgress(40);
      await new Promise(resolve => setTimeout(resolve, 1000));

      setAnalysisStep('Analyzing competitor content and strategy...');
      setAnalysisProgress(60);
      await new Promise(resolve => setTimeout(resolve, 1500));

      setAnalysisStep('Generating competitive insights...');
      setAnalysisProgress(80);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get website URL from props or localStorage
      const finalUserUrl = userUrl || localStorage.getItem('website_url') || '';
      
      // Get website analysis data from localStorage or step data
      const websiteAnalysisData = localStorage.getItem('website_analysis_data') 
        ? JSON.parse(localStorage.getItem('website_analysis_data')!) 
        : null;
      
      console.log('CompetitorAnalysisStep: Final URL to use:', finalUserUrl);

      console.log('CompetitorAnalysisStep: Making request with data:', {
        user_url: finalUserUrl,
        industry_context: industryContext,
        num_results: 25,
        website_analysis_data: websiteAnalysisData
      });

      const response = await aiApiClient.post('/api/onboarding/step3/discover-competitors', {
        // session_id removed - backend gets user from auth token
        user_url: finalUserUrl,
        industry_context: industryContext,
        num_results: 25,
        website_analysis_data: websiteAnalysisData
      });

      const result = response.data;

      if (result.success) {
        setAnalysisStep('Finalizing analysis...');
        setAnalysisProgress(100);
        await new Promise(resolve => setTimeout(resolve, 500));

        const analysisData = {
          competitors: result.competitors || [],
          social_media_accounts: result.social_media_accounts || {},
          social_media_citations: result.social_media_citations || [],
          research_summary: result.research_summary || null
        };

        setCompetitors(analysisData.competitors);
        setSocialMediaAccounts(analysisData.social_media_accounts);
        setSocialMediaCitations(analysisData.social_media_citations);
        setResearchSummary(analysisData.research_summary);
        
        // Cache the analysis results
        try {
          localStorage.setItem('competitor_analysis_data', JSON.stringify(analysisData));
          localStorage.setItem('competitor_analysis_url', finalUserUrl);
          localStorage.setItem('competitor_analysis_timestamp', Date.now().toString());
          console.log('CompetitorAnalysisStep: Cached competitor analysis for future use');
        } catch (cacheErr) {
          console.warn('Failed to cache competitor analysis:', cacheErr);
        }
        
        setShowProgressModal(false);
        setIsAnalyzing(false);
      } else {
        throw new Error(result.error || 'Competitor discovery failed');
      }
    } catch (err) {
      console.error('Competitor discovery error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setIsAnalyzing(false);
      setShowProgressModal(false);
    }
  }, [userUrl, industryContext, loadCachedAnalysis]);  // sessionId removed from dependencies

  // Initialize: Check cache first, then run analysis if needed
  useEffect(() => {
    const initialize = async () => {
      // Try to load from cache first
      const cacheLoaded = loadCachedAnalysis();
      
      // If no cache found, run fresh analysis
      if (!cacheLoaded) {
        await startCompetitorDiscovery(false);
      }
    };
    
    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  const handleContinue = () => {
    const researchData = {
      competitors,
      researchSummary,
      userUrl,
      industryContext,
      analysisTimestamp: new Date().toISOString()
    };
    onContinue(researchData);
  };

  const handleShowHighlights = (competitor: Competitor) => {
    setSelectedCompetitorHighlights(competitor.highlights || []);
    setSelectedCompetitorTitle(competitor.title);
    setShowHighlightsModal(true);
  };

  return (
    <Box sx={classes.container}>
      <Box sx={classes.header}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 600, 
            mb: 2,
            color: '#1a202c !important' // Force dark text for readability
          }}
        >
          Research Your Competition
        </Typography>
        <Typography 
          variant="h6" 
          sx={{ 
            color: '#4a5568 !important', // Force dark secondary text
            fontWeight: 400 
          }}
        >
          Discover your competitors and analyze their strategies to gain competitive advantage
        </Typography>
      </Box>

      {usingCachedData && !error && (
        <Alert 
          severity="info" 
          sx={{ 
            mb: 3,
            background: 'linear-gradient(135deg, #e0f2fe 0%, #b3e5fc 100%)',
            border: '1px solid #81d4fa',
            color: '#01579b',
            '& .MuiAlert-icon': {
              color: '#0277bd'
            }
          }}
        >
          Loaded previously analyzed competitor data. 
          <Button 
            startIcon={<RefreshIcon />} 
            onClick={() => startCompetitorDiscovery(true)}
            sx={{ ml: 2 }}
            size="small"
          >
            Run Fresh Analysis
          </Button>
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
          <Button 
            startIcon={<RefreshIcon />} 
            onClick={() => startCompetitorDiscovery(true)}
            sx={{ ml: 2 }}
          >
            Retry
          </Button>
        </Alert>
      )}

      {!isAnalyzing && !error && (competitors.length > 0 || researchSummary) && (
        <Box>
          {researchSummary && (
            <Paper sx={{ 
              p: 3, 
              mb: 4, 
              background: 'linear-gradient(135deg, #e0f2fe 0%, #b3e5fc 100%)', // Warm sky-blue gradient
              border: '1px solid #81d4fa',
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(3, 169, 244, 0.15)'
            }}>
              <Typography variant="h6" gutterBottom fontWeight={600} color="primary">
                <AssessmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Research Summary
              </Typography>
              
              <Grid container spacing={3} mt={1}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="h4" color="primary" fontWeight={700}>
                    {researchSummary.total_competitors}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ color: '#4a5568 !important' }} // Force dark text for readability
                  >
                    Competitors Found
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={9}>
                  <Typography 
                    variant="body1" 
                    sx={{ color: '#2d3748 !important' }} // Force dark text for readability
                  >
                    {researchSummary.market_insights}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          )}

          {/* Social Media Accounts Section */}
          {Object.keys(socialMediaAccounts).length > 0 && (
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
                  
                  const platformIcons: { [key: string]: React.ReactNode } = {
                    facebook: <FacebookIcon />,
                    instagram: <InstagramIcon />,
                    linkedin: <LinkedInIcon />,
                    youtube: <YouTubeIcon />,
                    twitter: <TwitterIcon />,
                    tiktok: <ShareIcon /> // Fallback icon for TikTok
                  };
                  
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
          )}

          <Typography 
            variant="h6" 
            gutterBottom 
            fontWeight={600} 
            mb={3}
            sx={{ color: '#1a202c !important' }} // Force dark text
          >
            <BusinessIcon sx={{ mr: 1, verticalAlign: 'middle', color: '#667eea !important' }} />
            Discovered Competitors ({competitors.length})
          </Typography>

          <Grid container spacing={3}>
            {competitors.map((competitor, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={index}>
                <Card sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  background: 'linear-gradient(135deg, #e0f2fe 0%, #b3e5fc 100%)',
                  border: '1px solid #81d4fa',
                  boxShadow: '0 4px 12px rgba(3, 169, 244, 0.15)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 20px rgba(3, 169, 244, 0.25)'
                  }
                }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box display="flex" alignItems="flex-start" gap={2} mb={2}>
                      <Avatar sx={{ width: 40, height: 40 }}>
                        <BusinessIcon />
                      </Avatar>
                      <Box flex={1}>
                        <Typography 
                          variant="h6" 
                          fontWeight={600} 
                          gutterBottom
                          sx={{ color: '#1a202c !important' }} // Force dark text for readability
                        >
                          {competitor.title}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          gutterBottom
                          sx={{ color: '#4a5568 !important' }} // Force dark text for readability
                        >
                          {competitor.domain}
                        </Typography>
                        <Chip 
                          label={`${Math.round(competitor.relevance_score * 100)}% Match`}
                          color="primary"
                          size="small"
                        />
                      </Box>
                    </Box>

                    <Typography 
                      variant="body2" 
                      mb={2}
                      sx={{ color: '#2d3748 !important' }} // Force dark text for readability
                    >
                      {competitor.summary.length > 150 
                        ? `${competitor.summary.substring(0, 150)}...` 
                        : competitor.summary
                      }
                    </Typography>
                  </CardContent>

                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      size="small"
                      startIcon={<OpenInNewIcon />}
                      onClick={() => window.open(competitor.url, '_blank')}
                    >
                      Visit Website
                    </Button>
                    {competitor.highlights && competitor.highlights.length > 0 && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleShowHighlights(competitor)}
                      >
                        Highlights
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box display="flex" justifyContent="center" mt={4}>
            <Button
              variant="contained"
              size="large"
              onClick={handleContinue}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: 2
              }}
            >
              Continue to Next Step
            </Button>
          </Box>
        </Box>
      )}

      <Dialog
        open={showProgressModal}
        onClose={() => {}}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 3
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 2 }}>
          <Box display="flex" alignItems="center" justifyContent="center" gap={2}>
            <CircularProgress size={32} color="primary" />
            <Typography variant="h6" fontWeight={600}>
              Analyzing Your Competition
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ textAlign: 'center', pt: 2 }}>
          <Typography variant="body1" color="text.secondary" mb={3}>
            We're discovering your competitors and analyzing their strategies using AI...
          </Typography>
          
          <Box mb={3}>
            <LinearProgress 
              variant="determinate" 
              value={analysisProgress} 
              sx={{ 
                height: 8, 
                borderRadius: 4,
                mb: 2
              }} 
            />
            <Typography variant="body2" color="text.secondary">
              {analysisProgress}% Complete
            </Typography>
          </Box>
          
          <Typography variant="body2" color="primary" fontWeight={500}>
            {analysisStep}
          </Typography>
        </DialogContent>
      </Dialog>

      {/* Highlights Modal */}
      <Dialog 
        open={showHighlightsModal} 
        onClose={() => setShowHighlightsModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight={600}>
            Key Highlights - {selectedCompetitorTitle}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedCompetitorHighlights.length > 0 ? (
            <Box>
              {selectedCompetitorHighlights.map((highlight, index) => (
                <Box 
                  key={index} 
                  sx={{ 
                    p: 2, 
                    mb: 2, 
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    backgroundColor: 'background.paper'
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {highlight}
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No highlights available for this competitor.
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default CompetitorAnalysisStep;
