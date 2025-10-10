/**
 * Preview Card Component
 * 
 * Displays live previews of how the metadata will appear in:
 * - Search engine results
 * - Social media platforms
 * - Rich snippets
 */

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Code as CodeIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Google as GoogleIcon
} from '@mui/icons-material';

interface PreviewCardProps {
  metadata: any;
  blogTitle: string;
}

export const PreviewCard: React.FC<PreviewCardProps> = ({
  metadata,
  blogTitle
}) => {
  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <SearchIcon sx={{ color: 'primary.main' }} />
        Live Preview
      </Typography>

      <Grid container spacing={3}>
        {/* Google Search Results Preview */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.1)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <GoogleIcon sx={{ color: '#4285F4' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Google Search Results
              </Typography>
              <Chip label="SERP Preview" size="small" color="primary" />
            </Box>

            <Card sx={{ border: '1px solid #e0e0e0', boxShadow: 'none' }}>
              <CardContent sx={{ p: 2 }}>
                {/* URL */}
                <Typography variant="caption" sx={{ color: '#1a0dab', mb: 1, display: 'block' }}>
                  {metadata.canonical_url || 'https://yourwebsite.com/blog-post'}
                </Typography>
                
                {/* Title */}
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: '#1a0dab', 
                    fontWeight: 400, 
                    fontSize: '1.1rem',
                    lineHeight: 1.3,
                    mb: 1,
                    cursor: 'pointer',
                    '&:hover': { textDecoration: 'underline' }
                  }}
                >
                  {metadata.seo_title || blogTitle}
                </Typography>
                
                {/* Description */}
                <Typography variant="body2" sx={{ color: '#4d5156', lineHeight: 1.4, mb: 1 }}>
                  {metadata.meta_description || 'Your meta description will appear here in Google search results...'}
                </Typography>
                
                {/* Additional Info */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <Typography variant="caption" sx={{ color: '#4d5156' }}>
                    {getCurrentDate()}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#4d5156' }}>
                    •
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#4d5156' }}>
                    {metadata.reading_time || 5} min read
                  </Typography>
                  {metadata.blog_tags && metadata.blog_tags.length > 0 && (
                    <>
                      <Typography variant="caption" sx={{ color: '#4d5156' }}>
                        •
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#4d5156' }}>
                        {metadata.blog_tags.slice(0, 2).join(', ')}
                      </Typography>
                    </>
                  )}
                </Box>
              </CardContent>
            </Card>

            <Alert severity="info" sx={{ mt: 2 }}>
              This is how your blog post will appear in Google search results
            </Alert>
          </Paper>
        </Grid>

        {/* Social Media Previews */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.1)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <FacebookIcon sx={{ color: '#1877F2' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Facebook Preview
              </Typography>
              <Chip label="Open Graph" size="small" color="primary" />
            </Box>

            <Card sx={{ border: '1px solid #e0e0e0', boxShadow: 'none', maxWidth: 400 }}>
              <CardContent sx={{ p: 0 }}>
                {/* Image placeholder */}
                <Box sx={{ 
                  height: 200, 
                  bgcolor: '#f5f5f5', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  borderBottom: '1px solid #e0e0e0'
                }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {metadata.open_graph?.image ? 'Image loaded' : 'No image set'}
                  </Typography>
                </Box>
                
                <Box sx={{ p: 2 }}>
                  {/* URL */}
                  <Typography variant="caption" sx={{ color: '#65676b', mb: 1, display: 'block' }}>
                    {metadata.canonical_url || 'yourwebsite.com'}
                  </Typography>
                  
                  {/* Title */}
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, lineHeight: 1.3 }}>
                    {metadata.open_graph?.title || metadata.seo_title || blogTitle}
                  </Typography>
                  
                  {/* Description */}
                  <Typography variant="body2" sx={{ color: '#65676b', lineHeight: 1.4 }}>
                    {metadata.open_graph?.description || metadata.meta_description || 'Your description will appear here...'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.1)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <TwitterIcon sx={{ color: '#1DA1F2' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Twitter Preview
              </Typography>
              <Chip label="Twitter Card" size="small" color="info" />
            </Box>

            <Card sx={{ border: '1px solid #e0e0e0', boxShadow: 'none', maxWidth: 400 }}>
              <CardContent sx={{ p: 0 }}>
                {/* Image placeholder */}
                <Box sx={{ 
                  height: 200, 
                  bgcolor: '#f5f5f5', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  borderBottom: '1px solid #e0e0e0'
                }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {metadata.twitter_card?.image ? 'Image loaded' : 'No image set'}
                  </Typography>
                </Box>
                
                <Box sx={{ p: 2 }}>
                  {/* URL */}
                  <Typography variant="caption" sx={{ color: '#536471', mb: 1, display: 'block' }}>
                    {metadata.canonical_url || 'yourwebsite.com'}
                  </Typography>
                  
                  {/* Title */}
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, lineHeight: 1.3 }}>
                    {metadata.twitter_card?.title || metadata.seo_title || blogTitle}
                  </Typography>
                  
                  {/* Description */}
                  <Typography variant="body2" sx={{ color: '#536471', lineHeight: 1.4 }}>
                    {metadata.twitter_card?.description || metadata.meta_description || 'Your description will appear here...'}
                  </Typography>
                  
                  {/* Twitter handle */}
                  {metadata.twitter_card?.site && (
                    <Typography variant="caption" sx={{ color: '#536471', mt: 1, display: 'block' }}>
                      {metadata.twitter_card.site}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Paper>
        </Grid>

        {/* Rich Snippets Preview */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.1)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <CodeIcon sx={{ color: '#34A853' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Rich Snippets Preview
              </Typography>
              <Chip label="JSON-LD Schema" size="small" color="success" />
            </Box>

            <Card sx={{ border: '1px solid #e0e0e0', boxShadow: 'none' }}>
              <CardContent sx={{ p: 2 }}>
                {/* Article Schema Preview */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {metadata.json_ld_schema?.headline || metadata.seo_title || blogTitle}
                  </Typography>
                  <Chip label="Article" size="small" color="success" />
                </Box>
                
                <Typography variant="body2" sx={{ color: '#4d5156', mb: 2 }}>
                  {metadata.json_ld_schema?.description || metadata.meta_description || 'Article description...'}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  {metadata.json_ld_schema?.author?.name && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant="caption" sx={{ color: '#4d5156' }}>
                        By {metadata.json_ld_schema.author.name}
                      </Typography>
                    </Box>
                  )}
                  
                  {metadata.json_ld_schema?.datePublished && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant="caption" sx={{ color: '#4d5156' }}>
                        {new Date(metadata.json_ld_schema.datePublished).toLocaleDateString()}
                      </Typography>
                    </Box>
                  )}
                  
                  {metadata.reading_time && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant="caption" sx={{ color: '#4d5156' }}>
                        {metadata.reading_time} min read
                      </Typography>
                    </Box>
                  )}
                  
                  {metadata.json_ld_schema?.wordCount && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant="caption" sx={{ color: '#4d5156' }}>
                        {metadata.json_ld_schema.wordCount} words
                      </Typography>
                    </Box>
                  )}
                </Box>
                
                {metadata.json_ld_schema?.keywords && metadata.json_ld_schema.keywords.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" sx={{ color: '#4d5156', display: 'block', mb: 1 }}>
                      Keywords:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {metadata.json_ld_schema.keywords.slice(0, 5).map((keyword: string, index: number) => (
                        <Chip key={index} label={keyword} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>

            <Alert severity="success" sx={{ mt: 2 }}>
              Rich snippets help search engines understand your content and may display additional information in search results
            </Alert>
          </Paper>
        </Grid>

        {/* Metadata Summary */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <SearchIcon />
              Metadata Summary
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(76, 175, 80, 0.1)', borderRadius: 2 }}>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: 'success.main' }}>
                    {metadata.optimization_score || 0}%
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Optimization Score
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(33, 150, 243, 0.1)', borderRadius: 2 }}>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    {metadata.reading_time || 0}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Reading Time (min)
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(156, 39, 176, 0.1)', borderRadius: 2 }}>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: 'secondary.main' }}>
                    {metadata.blog_tags?.length || 0}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Tags
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(255, 152, 0, 0.1)', borderRadius: 2 }}>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: 'warning.main' }}>
                    {metadata.blog_categories?.length || 0}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Categories
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
