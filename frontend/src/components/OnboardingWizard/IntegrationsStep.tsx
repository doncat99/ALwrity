import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import {
  Box,
  Fade,
  Snackbar
} from '@mui/material';
import {
  // Social Media Icons
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  LinkedIn as LinkedInIcon,
  YouTube as YouTubeIcon,
  VideoLibrary as TikTokIcon,
  Pinterest as PinterestIcon,
  // Platform Icons
  Web as WordPressIcon,
  Web as WixIcon,
  Google as GoogleIcon,
  // Status Icons
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Launch as LaunchIcon,
  Security as SecurityIcon,
  Verified as VerifiedIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';

// Import refactored components
import EmailSection from './common/EmailSection';
import PlatformSection from './common/PlatformSection';
import BenefitsSummary from './common/BenefitsSummary';
import ComingSoonSection from './common/ComingSoonSection';
import { useGSCConnection } from './common/useGSCConnection';
import { usePlatformConnections } from './common/usePlatformConnections';

interface IntegrationsStepProps {
  onContinue: () => void;
  updateHeaderContent: (content: { title: string; description: string }) => void;
}

interface IntegrationPlatform {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'website' | 'social' | 'analytics';
  status: 'available' | 'connected' | 'coming_soon' | 'disabled';
  features: string[];
  benefits: string[];
  oauthUrl?: string;
  isEnabled: boolean;
}

const IntegrationsStep: React.FC<IntegrationsStepProps> = ({ onContinue, updateHeaderContent }) => {
  const { getToken } = useAuth();
  const [email, setEmail] = useState<string>('');
  
  // Use custom hooks
  const { gscSites, connectedPlatforms, setConnectedPlatforms, setGscSites, handleGSCConnect } = useGSCConnection();
  const { isLoading, showToast, setShowToast, toastMessage, setToastMessage, handleConnect } = usePlatformConnections();

  // Initialize integrations data
  const [integrations] = useState<IntegrationPlatform[]>([
    // Website Platforms
    {
      id: 'wix',
      name: 'Wix',
      description: 'Connect your Wix website for automated content publishing and analytics',
      icon: <WixIcon />,
      category: 'website',
      status: 'available',
      features: ['Auto-publish content', 'Analytics tracking', 'SEO optimization'],
      benefits: ['Direct publishing to your Wix site', 'Content performance insights', 'Automated SEO optimization'],
      oauthUrl: '/api/oauth/wix/connect',
      isEnabled: true
    },
    {
      id: 'wordpress',
      name: 'WordPress',
      description: 'Connect your WordPress.com sites with secure OAuth authentication',
      icon: <WordPressIcon />,
      category: 'website',
      status: 'available',
      features: ['OAuth authentication', 'Auto-publish content', 'Media management', 'SEO optimization'],
      benefits: ['Secure OAuth connection', 'Direct publishing to WordPress', 'Media library integration', 'Advanced SEO features'],
      isEnabled: true
    },
    // Analytics Platforms
    {
      id: 'gsc',
      name: 'Google Search Console',
      description: 'Connect GSC for comprehensive SEO analytics and content optimization',
      icon: <GoogleIcon />,
      category: 'analytics',
      status: 'available',
      features: ['Search performance data', 'Keyword insights', 'Content optimization'],
      benefits: ['Real-time SEO metrics', 'Keyword performance tracking', 'Content gap analysis'],
      oauthUrl: '/gsc/auth/url',
      isEnabled: true
    },
    // Social Media Platforms
    {
      id: 'facebook',
      name: 'Facebook',
      description: 'Connect your Facebook page for AI-powered content creation and posting',
      icon: <FacebookIcon />,
      category: 'social',
      status: 'coming_soon',
      features: ['Auto-posting', 'Engagement tracking', 'Content optimization'],
      benefits: ['Automated Facebook posts', 'Engagement analytics', 'Content performance insights'],
      isEnabled: false
    },
    {
      id: 'twitter',
      name: 'Twitter',
      description: 'Connect your Twitter account for automated tweeting and analytics',
      icon: <TwitterIcon />,
      category: 'social',
      status: 'coming_soon',
      features: ['Auto-tweeting', 'Trend analysis', 'Engagement tracking'],
      benefits: ['Automated Twitter posts', 'Trend monitoring', 'Audience insights'],
      isEnabled: false
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      description: 'Connect your LinkedIn profile for professional content publishing',
      icon: <LinkedInIcon />,
      category: 'social',
      status: 'coming_soon',
      features: ['Professional posting', 'Network insights', 'Content optimization'],
      benefits: ['LinkedIn article publishing', 'Professional network analytics', 'B2B content insights'],
      isEnabled: false
    },
    {
      id: 'instagram',
      name: 'Instagram',
      description: 'Connect your Instagram account for visual content management',
      icon: <InstagramIcon />,
      category: 'social',
      status: 'coming_soon',
      features: ['Visual content posting', 'Story management', 'Engagement tracking'],
      benefits: ['Instagram post automation', 'Visual content optimization', 'Story insights'],
      isEnabled: false
    },
    {
      id: 'youtube',
      name: 'YouTube',
      description: 'Connect your YouTube channel for video content optimization',
      icon: <YouTubeIcon />,
      category: 'social',
      status: 'coming_soon',
      features: ['Video optimization', 'Thumbnail generation', 'Analytics tracking'],
      benefits: ['Video SEO optimization', 'Thumbnail automation', 'YouTube analytics'],
      isEnabled: false
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      description: 'Connect your TikTok account for short-form content optimization',
      icon: <TikTokIcon />,
      category: 'social',
      status: 'coming_soon',
      features: ['Trend analysis', 'Content optimization', 'Performance tracking'],
      benefits: ['TikTok trend insights', 'Content performance analytics', 'Viral content optimization'],
      isEnabled: false
    },
    {
      id: 'pinterest',
      name: 'Pinterest',
      description: 'Connect your Pinterest account for visual content strategy',
      icon: <PinterestIcon />,
      category: 'social',
      status: 'coming_soon',
      features: ['Pin optimization', 'Board management', 'Visual analytics'],
      benefits: ['Pinterest pin automation', 'Visual content strategy', 'Pin performance insights'],
      isEnabled: false
    }
  ]);

  useEffect(() => {
    updateHeaderContent({
      title: 'Connect Your Platforms',
      description: 'Connect your websites and social media accounts to enable AI-powered content publishing and analytics'
    });
  }, [updateHeaderContent]);

  // Handle OAuth callback parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const wordpressConnected = urlParams.get('wordpress_connected');
    const blogUrl = urlParams.get('blog_url');
    const error = urlParams.get('error');

    if (wordpressConnected === 'true' && blogUrl) {
      // WordPress OAuth successful
      setConnectedPlatforms([...connectedPlatforms, 'wordpress']);
      // Remove query parameters from URL
      window.history.replaceState({}, document.title, window.location.pathname);
      console.log('WordPress OAuth connection successful:', blogUrl);
    } else if (error) {
      // WordPress OAuth failed
      console.error('WordPress OAuth error:', error);
      // Remove query parameters from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Get user email from Clerk
  useEffect(() => {
    const getUserEmail = () => {
      if (typeof window !== 'undefined') {
        const clerkUser = (window as any).__clerk_user;
        if (clerkUser?.emailAddresses?.[0]?.emailAddress) {
          return clerkUser.emailAddresses[0].emailAddress;
        }
        
        const clerkSession = localStorage.getItem('__clerk_session');
        if (clerkSession) {
          try {
            const sessionData = JSON.parse(clerkSession);
            if (sessionData?.user?.emailAddresses?.[0]?.emailAddress) {
              return sessionData.user.emailAddresses[0].emailAddress;
            }
          } catch (e) {
            // Ignore parsing errors
          }
        }
        
        const userData = localStorage.getItem('user_data');
        if (userData) {
          try {
            const data = JSON.parse(userData);
            if (data.email) return data.email;
          } catch (e) {
            // Ignore parsing errors
          }
        }
        
        const currentUserEmail = 'ajay.calsoft@gmail.com';
        if (currentUserEmail && currentUserEmail.includes('@')) {
          return currentUserEmail;
        }
      }
      
      return 'user@example.com';
    };
    
    const userEmail = getUserEmail();
    setEmail(userEmail);
  }, []);

  const handlePlatformConnect = async (platformId: string) => {
    if (platformId === 'gsc') {
      await handleGSCConnect();
    } else {
      await handleConnect(platformId);
    }
  };

  // Filter platforms by category
  const websitePlatforms = integrations.filter(p => p.category === 'website');
  const analyticsPlatforms = integrations.filter(p => p.category === 'analytics');
  const socialPlatforms = integrations.filter(p => p.category === 'social');


  return (
    <Box sx={{ width: '100%', maxWidth: '100%', p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Email Address Section */}
      <EmailSection email={email} onEmailChange={setEmail} />

      {/* Website Platforms */}
      <Fade in timeout={800}>
        <div>
          <PlatformSection
            title="Website Platforms"
            description="Connect your website for automated content publishing and SEO optimization"
            platforms={websitePlatforms}
            connectedPlatforms={connectedPlatforms}
            gscSites={null}
                  isLoading={isLoading}
            onConnect={handlePlatformConnect}
            onDisconnect={(platformId) => {
              setConnectedPlatforms(connectedPlatforms.filter(p => p !== platformId));
            }}
            setConnectedPlatforms={setConnectedPlatforms}
          />
        </div>
      </Fade>

      {/* Analytics Platforms */}
      <Fade in timeout={1000}>
        <div>
          <PlatformSection
            title="Analytics & SEO"
            description="Connect analytics platforms for data-driven content optimization"
            platforms={analyticsPlatforms}
            connectedPlatforms={connectedPlatforms}
            gscSites={gscSites}
                  isLoading={isLoading}
            onConnect={handlePlatformConnect}
                />
        </div>
      </Fade>

      {/* Social Media Platforms */}
      <Fade in timeout={1200}>
        <div>
          <PlatformSection
            title="Social Media Platforms"
            description="Connect your social media accounts for automated posting and engagement analytics"
            platforms={socialPlatforms}
            connectedPlatforms={connectedPlatforms}
            gscSites={null}
            isLoading={isLoading}
            onConnect={handlePlatformConnect}
          />
        </div>
      </Fade>

      {/* Benefits Summary */}
      <Fade in timeout={1400}>
        <div>
        <BenefitsSummary />
        </div>
      </Fade>

      {/* Coming Soon Section */}
      <ComingSoonSection />

      {/* Success Toast */}
      <Snackbar
        open={showToast}
        autoHideDuration={4000}
        onClose={() => setShowToast(false)}
        message={toastMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{
          '& .MuiSnackbarContent-root': {
            backgroundColor: '#10b981',
            color: 'white',
            fontWeight: 600
          }
        }}
      />
    </Box>
  );
};

export default IntegrationsStep; 