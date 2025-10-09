/**
 * SEO Metadata Modal Component
 * 
 * Comprehensive SEO metadata generation and editing interface with:
 * - Tabbed interface for different metadata types
 * - Live preview of social media cards
 * - Character counters and validation
 * - Copy-to-clipboard functionality
 * - Integration with backend metadata generation
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Chip,
  Grid,
  Card,
  CardContent,
  Divider,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Close as CloseIcon,
  ContentCopy as CopyIcon,
  Check as CheckIcon,
  Preview as PreviewIcon,
  Search as SearchIcon,
  Share as ShareIcon,
  Code as CodeIcon,
  Tag as TagIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { apiClient } from '../../api/client';

// Import metadata display components
import { CoreMetadataTab } from './SEO/MetadataDisplay/CoreMetadataTab';
import { SocialMediaTab } from './SEO/MetadataDisplay/SocialMediaTab';
import { StructuredDataTab } from './SEO/MetadataDisplay/StructuredDataTab';
import { PreviewCard } from './SEO/MetadataDisplay/PreviewCard';

interface SEOMetadataModalProps {
  isOpen: boolean;
  onClose: () => void;
  blogContent: string;
  blogTitle: string;
  researchData: any;
  onMetadataGenerated: (metadata: any) => void;
}

interface SEOMetadataResult {
  success: boolean;
  seo_title?: string;
  meta_description?: string;
  url_slug?: string;
  blog_tags?: string[];
  blog_categories?: string[];
  social_hashtags?: string[];
  open_graph?: any;
  twitter_card?: any;
  json_ld_schema?: any;
  canonical_url?: string;
  reading_time?: number;
  focus_keyword?: string;
  generated_at?: string;
  optimization_score?: number;
  error?: string;
}

export const SEOMetadataModal: React.FC<SEOMetadataModalProps> = ({
  isOpen,
  onClose,
  blogContent,
  blogTitle,
  researchData,
  onMetadataGenerated
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [metadataResult, setMetadataResult] = useState<SEOMetadataResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState('core');
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());
  const [editableMetadata, setEditableMetadata] = useState<SEOMetadataResult | null>(null);

  // Debug logging
  useEffect(() => {
    console.log('🔍 SEOMetadataModal render:', {
      isOpen,
      blogContent: blogContent?.length,
      blogTitle,
      researchData: !!researchData
    });
  }, [isOpen, blogContent, blogTitle, researchData]);

  const generateMetadata = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      setMetadataResult(null);

      console.log('🚀 Starting SEO metadata generation...');

      // Make API call to generate metadata
      const response = await apiClient.post('/api/blog/seo/metadata', {
        content: blogContent,
        title: blogTitle,
        research_data: researchData
      });

      const result = response.data;
      console.log('✅ SEO metadata generation response:', result);

      if (!result.success) {
        throw new Error(result.error || 'Metadata generation failed');
      }

      setMetadataResult(result);
      setEditableMetadata(result);
      console.log('📊 Metadata result set:', result);

    } catch (err) {
      console.error('❌ SEO metadata generation failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate SEO metadata');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };

  const handleCopyToClipboard = async (text: string, itemId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItems(prev => new Set([...prev, itemId]));
      setTimeout(() => {
        setCopiedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
      }, 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleMetadataEdit = (field: string, value: any) => {
    if (editableMetadata) {
      setEditableMetadata(prev => ({
        ...prev!,
        [field]: value
      }));
    }
  };

  const handleApplyMetadata = () => {
    if (editableMetadata) {
      onMetadataGenerated(editableMetadata);
      onClose();
    }
  };

  const getTabIcon = (tabValue: string) => {
    switch (tabValue) {
      case 'core': return <SearchIcon />;
      case 'social': return <ShareIcon />;
      case 'structured': return <CodeIcon />;
      case 'preview': return <PreviewIcon />;
      default: return <TagIcon />;
    }
  };

  const getTabLabel = (tabValue: string) => {
    switch (tabValue) {
      case 'core': return 'Core SEO';
      case 'social': return 'Social Media';
      case 'structured': return 'Structured Data';
      case 'preview': return 'Preview';
      default: return 'Metadata';
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(10px)',
          borderRadius: 3,
          minHeight: '80vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        pb: 1,
        borderBottom: '1px solid rgba(0,0,0,0.1)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TagIcon sx={{ color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            SEO Metadata Generator
          </Typography>
          {metadataResult && (
            <Chip 
              label={`${metadataResult.optimization_score || 0}% Optimized`}
              color={metadataResult.optimization_score && metadataResult.optimization_score >= 80 ? 'success' : 
                     metadataResult.optimization_score && metadataResult.optimization_score >= 60 ? 'warning' : 'error'}
              size="small"
            />
          )}
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {!metadataResult && !isGenerating && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Generate Comprehensive SEO Metadata
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
              Create optimized titles, descriptions, Open Graph tags, Twitter cards, and structured data for your blog post.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={generateMetadata}
              startIcon={<RefreshIcon />}
              sx={{ px: 4 }}
            >
              Generate SEO Metadata
            </Button>
          </Box>
        )}

        {isGenerating && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress size={60} sx={{ mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              Generating SEO Metadata...
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Creating optimized titles, descriptions, and social media tags
            </Typography>
          </Box>
        )}

        {error && (
          <Box sx={{ p: 3 }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
            <Button
              variant="outlined"
              onClick={generateMetadata}
              startIcon={<RefreshIcon />}
            >
              Try Again
            </Button>
          </Box>
        )}

        {metadataResult && (
          <Box>
            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ minHeight: 48 }}
              >
                {['core', 'social', 'structured', 'preview'].map((tab) => (
                  <Tab
                    key={tab}
                    value={tab}
                    label={getTabLabel(tab)}
                    icon={getTabIcon(tab)}
                    iconPosition="start"
                    sx={{ minHeight: 48, textTransform: 'none' }}
                  />
                ))}
              </Tabs>
            </Box>

            {/* Tab Content */}
            <Box sx={{ p: 3 }}>
              {tabValue === 'core' && (
                <CoreMetadataTab
                  metadata={editableMetadata || metadataResult}
                  onMetadataEdit={handleMetadataEdit}
                  onCopyToClipboard={handleCopyToClipboard}
                  copiedItems={copiedItems}
                />
              )}

              {tabValue === 'social' && (
                <SocialMediaTab
                  metadata={editableMetadata || metadataResult}
                  onMetadataEdit={handleMetadataEdit}
                  onCopyToClipboard={handleCopyToClipboard}
                  copiedItems={copiedItems}
                />
              )}

              {tabValue === 'structured' && (
                <StructuredDataTab
                  metadata={editableMetadata || metadataResult}
                  onMetadataEdit={handleMetadataEdit}
                  onCopyToClipboard={handleCopyToClipboard}
                  copiedItems={copiedItems}
                />
              )}

              {tabValue === 'preview' && (
                <PreviewCard
                  metadata={editableMetadata || metadataResult}
                  blogTitle={blogTitle}
                />
              )}
            </Box>
          </Box>
        )}
      </DialogContent>

      {metadataResult && (
        <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleApplyMetadata}
            startIcon={<CheckIcon />}
            sx={{ px: 3 }}
          >
            Apply Metadata
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};
