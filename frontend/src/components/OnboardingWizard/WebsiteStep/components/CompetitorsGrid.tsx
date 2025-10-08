/**
 * CompetitorsGrid Component
 * Displays discovered competitors in a grid layout
 */

import React from 'react';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Avatar,
  Button,
  Box
} from '@mui/material';
import {
  Business as BusinessIcon,
  OpenInNew as OpenInNewIcon
} from '@mui/icons-material';

export interface Competitor {
  url: string;
  domain: string;
  title: string;
  summary: string;
  relevance_score: number;
  highlights?: string[];
  favicon?: string;
  image?: string;
  published_date?: string;
  author?: string;
  competitive_insights: {
    business_model: string;
    target_audience: string;
  };
  content_insights: {
    content_focus: string;
    content_quality: string;
  };
}

interface CompetitorsGridProps {
  competitors: Competitor[];
  onShowHighlights: (competitor: Competitor) => void;
}

// Utility function to get favicon URL
const getFaviconUrl = (url: string): string => {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return '';
  }
};

const CompetitorsGrid: React.FC<CompetitorsGridProps> = ({
  competitors,
  onShowHighlights
}) => {
  return (
    <>
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
                  <Avatar 
                    sx={{ 
                      width: 40, 
                      height: 40,
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0'
                    }}
                    src={competitor.favicon || getFaviconUrl(competitor.url)}
                    onError={(e) => {
                      // Hide the image if it fails to load
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  >
                    <BusinessIcon sx={{ color: '#667eea' }} />
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
                    <Box display="flex" gap={1} flexWrap="wrap">
                      <Chip 
                        label={`${Math.round(competitor.relevance_score * 100)}% Match`}
                        color="primary"
                        size="small"
                      />
                      {competitor.published_date && (
                        <Chip 
                          label={new Date(competitor.published_date).toLocaleDateString()}
                          variant="outlined"
                          size="small"
                          sx={{ 
                            fontSize: '0.7rem',
                            height: 20,
                            '& .MuiChip-label': { px: 1 }
                          }}
                        />
                      )}
                    </Box>
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
                    onClick={() => onShowHighlights(competitor)}
                  >
                    Highlights
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default CompetitorsGrid;
