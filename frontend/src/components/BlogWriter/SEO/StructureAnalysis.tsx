/**
 * Structure Analysis Component
 * 
 * Displays comprehensive content structure analysis including structure overview,
 * content elements detection, and heading structure analysis.
 */

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Tooltip
} from '@mui/material';
import { 
  BarChart
} from '@mui/icons-material';

interface StructureAnalysisProps {
  detailedAnalysis?: {
    content_structure?: {
      total_sections: number;
      total_paragraphs: number;
      total_sentences: number;
      has_introduction: boolean;
      has_conclusion: boolean;
      has_call_to_action: boolean;
      structure_score: number;
      recommendations: string[];
    };
    content_quality?: {
      word_count: number;
      unique_words: number;
      vocabulary_diversity: number;
      transition_words_used: number;
      content_depth_score: number;
      flow_score: number;
      recommendations: string[];
    };
    heading_structure?: {
      h1_count: number;
      h2_count: number;
      h3_count: number;
      h1_headings: string[];
      h2_headings: string[];
      h3_headings: string[];
      heading_hierarchy_score: number;
      recommendations: string[];
    };
  };
}

export const StructureAnalysis: React.FC<StructureAnalysisProps> = ({ detailedAnalysis }) => {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <BarChart sx={{ color: 'primary.main' }} />
        <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
          Content Structure Analysis
        </Typography>
      </Box>
      <Grid container spacing={3}>
        {/* Content Structure Overview */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.1)' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Structure Overview
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Tooltip
                title={
                  <Box sx={{ p: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      Total Sections
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Number of main content sections (H2 headings) in your blog post.
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                      <strong>Optimal Range:</strong> 3-8 sections for most blog posts
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block' }}>
                      <strong>Why it matters:</strong> Good sectioning improves readability and helps search engines understand your content structure.
                    </Typography>
                  </Box>
                }
                arrow
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'help' }}>
                  <Typography variant="body2">Total Sections</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {detailedAnalysis?.content_structure?.total_sections || 'N/A'}
                  </Typography>
                </Box>
              </Tooltip>
              
              <Tooltip
                title={
                  <Box sx={{ p: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      Total Paragraphs
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Number of paragraphs in your content (excluding headings).
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                      <strong>Optimal Range:</strong> 8-20 paragraphs for most blog posts
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block' }}>
                      <strong>Why it matters:</strong> Appropriate paragraph count indicates good content depth and organization.
                    </Typography>
                  </Box>
                }
                arrow
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'help' }}>
                  <Typography variant="body2">Total Paragraphs</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {detailedAnalysis?.content_structure?.total_paragraphs || 'N/A'}
                  </Typography>
                </Box>
              </Tooltip>
              
              <Tooltip
                title={
                  <Box sx={{ p: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      Total Sentences
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Total number of sentences in your content.
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                      <strong>Optimal Range:</strong> 40-100 sentences for most blog posts
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block' }}>
                      <strong>Why it matters:</strong> Sentence count affects readability and content comprehensiveness.
                    </Typography>
                  </Box>
                }
                arrow
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'help' }}>
                  <Typography variant="body2">Total Sentences</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {detailedAnalysis?.content_structure?.total_sentences || 'N/A'}
                  </Typography>
                </Box>
              </Tooltip>
              
              <Tooltip
                title={
                  <Box sx={{ p: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      Structure Score
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Overall score (0-100) for your content's structural organization.
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                      <strong>Scoring Factors:</strong> Section count, paragraph count, introduction/conclusion presence
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block' }}>
                      <strong>Why it matters:</strong> Well-structured content ranks better and provides better user experience.
                    </Typography>
                  </Box>
                }
                arrow
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'help' }}>
                  <Typography variant="body2">Structure Score</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {detailedAnalysis?.content_structure?.structure_score || 'N/A'}
                  </Typography>
                </Box>
              </Tooltip>
            </Box>
          </Paper>
        </Grid>

        {/* Content Elements */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.1)' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Content Elements
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Tooltip
                title={
                  <Box sx={{ p: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      Introduction Section
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Whether your content has a clear introduction that sets context and expectations.
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                      <strong>Why it matters:</strong> Introductions help readers understand what they'll learn and improve engagement.
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block' }}>
                      <strong>SEO Impact:</strong> Clear introductions help search engines understand your content's purpose.
                    </Typography>
                  </Box>
                }
                arrow
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'help' }}>
                  <Typography variant="body2">Has Introduction</Typography>
                  <Chip 
                    label={detailedAnalysis?.content_structure?.has_introduction ? 'Yes' : 'No'}
                    color={detailedAnalysis?.content_structure?.has_introduction ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
              </Tooltip>
              
              <Tooltip
                title={
                  <Box sx={{ p: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      Conclusion Section
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Whether your content has a clear conclusion that summarizes key points.
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                      <strong>Why it matters:</strong> Conclusions help readers retain information and provide closure.
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block' }}>
                      <strong>SEO Impact:</strong> Good conclusions can improve time on page and reduce bounce rate.
                    </Typography>
                  </Box>
                }
                arrow
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'help' }}>
                  <Typography variant="body2">Has Conclusion</Typography>
                  <Chip 
                    label={detailedAnalysis?.content_structure?.has_conclusion ? 'Yes' : 'No'}
                    color={detailedAnalysis?.content_structure?.has_conclusion ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
              </Tooltip>
              
              <Tooltip
                title={
                  <Box sx={{ p: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      Call to Action
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Whether your content includes a clear call to action for readers.
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                      <strong>Why it matters:</strong> CTAs guide readers to take desired actions and improve conversion rates.
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block' }}>
                      <strong>SEO Impact:</strong> Strong CTAs can improve user engagement metrics.
                    </Typography>
                  </Box>
                }
                arrow
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'help' }}>
                  <Typography variant="body2">Has Call to Action</Typography>
                  <Chip 
                    label={detailedAnalysis?.content_structure?.has_call_to_action ? 'Yes' : 'No'}
                    color={detailedAnalysis?.content_structure?.has_call_to_action ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
              </Tooltip>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Content Quality Metrics */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.1)' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Content Quality Metrics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Tooltip
                  title={
                    <Box sx={{ p: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        Word Count
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Total number of words in your content.
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                        <strong>Optimal Range:</strong> 800-2000 words for most blog posts
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block' }}>
                        <strong>Why it matters:</strong> Longer content typically ranks better and provides more value to readers.
                      </Typography>
                    </Box>
                  }
                  arrow
                >
                  <Box sx={{ p: 2, background: 'rgba(76, 175, 80, 0.1)', borderRadius: 2, border: '1px solid rgba(76, 175, 80, 0.3)', cursor: 'help' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'success.main', mb: 1 }}>
                      Word Count
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {detailedAnalysis?.content_quality?.word_count || 'N/A'}
                    </Typography>
                  </Box>
                </Tooltip>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Tooltip
                  title={
                    <Box sx={{ p: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        Vocabulary Diversity
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Ratio of unique words to total words, indicating content variety.
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                        <strong>Optimal Range:</strong> 0.4-0.7 (40-70% unique words)
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block' }}>
                        <strong>Why it matters:</strong> Higher diversity indicates richer, more engaging content.
                      </Typography>
                    </Box>
                  }
                  arrow
                >
                  <Box sx={{ p: 2, background: 'rgba(33, 150, 243, 0.1)', borderRadius: 2, border: '1px solid rgba(33, 150, 243, 0.3)', cursor: 'help' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main', mb: 1 }}>
                      Vocabulary Diversity
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {detailedAnalysis?.content_quality?.vocabulary_diversity ? 
                        (detailedAnalysis.content_quality.vocabulary_diversity * 100).toFixed(1) + '%' : 'N/A'}
                    </Typography>
                  </Box>
                </Tooltip>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Tooltip
                  title={
                    <Box sx={{ p: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        Content Depth Score
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Score (0-100) indicating how comprehensive and detailed your content is.
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                        <strong>Scoring Factors:</strong> Word count, section depth, information density
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block' }}>
                        <strong>Why it matters:</strong> Deeper content provides more value and ranks better in search results.
                      </Typography>
                    </Box>
                  }
                  arrow
                >
                  <Box sx={{ p: 2, background: 'rgba(156, 39, 176, 0.1)', borderRadius: 2, border: '1px solid rgba(156, 39, 176, 0.3)', cursor: 'help' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'secondary.main', mb: 1 }}>
                      Content Depth Score
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {detailedAnalysis?.content_quality?.content_depth_score || 'N/A'}
                    </Typography>
                  </Box>
                </Tooltip>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Tooltip
                  title={
                    <Box sx={{ p: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        Flow Score
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Score (0-100) indicating how well your content flows from one idea to the next.
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                        <strong>Scoring Factors:</strong> Transition words, sentence variety, logical progression
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block' }}>
                        <strong>Why it matters:</strong> Good flow improves readability and keeps readers engaged.
                      </Typography>
                    </Box>
                  }
                  arrow
                >
                  <Box sx={{ p: 2, background: 'rgba(255, 152, 0, 0.1)', borderRadius: 2, border: '1px solid rgba(255, 152, 0, 0.3)', cursor: 'help' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'warning.main', mb: 1 }}>
                      Flow Score
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {detailedAnalysis?.content_quality?.flow_score || 'N/A'}
                    </Typography>
                  </Box>
                </Tooltip>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Tooltip
                  title={
                    <Box sx={{ p: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        Transition Words
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Number of transition words used to connect ideas and improve flow.
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                        <strong>Optimal Range:</strong> 5-15 transition words for most blog posts
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block' }}>
                        <strong>Why it matters:</strong> Transition words improve readability and help readers follow your logic.
                      </Typography>
                    </Box>
                  }
                  arrow
                >
                  <Box sx={{ p: 2, background: 'rgba(244, 67, 54, 0.1)', borderRadius: 2, border: '1px solid rgba(244, 67, 54, 0.3)', cursor: 'help' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'error.main', mb: 1 }}>
                      Transition Words
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {detailedAnalysis?.content_quality?.transition_words_used || 'N/A'}
                    </Typography>
                  </Box>
                </Tooltip>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Tooltip
                  title={
                    <Box sx={{ p: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        Unique Words
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Number of unique words used in your content.
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                        <strong>Why it matters:</strong> More unique words indicate richer vocabulary and better content variety.
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block' }}>
                        <strong>SEO Impact:</strong> Diverse vocabulary can help with semantic SEO and topic coverage.
                      </Typography>
                    </Box>
                  }
                  arrow
                >
                  <Box sx={{ p: 2, background: 'rgba(0, 150, 136, 0.1)', borderRadius: 2, border: '1px solid rgba(0, 150, 136, 0.3)', cursor: 'help' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'info.main', mb: 1 }}>
                      Unique Words
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {detailedAnalysis?.content_quality?.unique_words || 'N/A'}
                    </Typography>
                  </Box>
                </Tooltip>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Heading Structure */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.1)' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Heading Structure Analysis
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, background: 'rgba(76, 175, 80, 0.1)', borderRadius: 2, border: '1px solid rgba(76, 175, 80, 0.3)' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'success.main', mb: 1 }}>
                    H1 Headings ({detailedAnalysis?.heading_structure?.h1_count || 0})
                  </Typography>
                  {detailedAnalysis?.heading_structure?.h1_headings?.map((heading: string, index: number) => (
                    <Typography key={index} variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                      • {heading}
                    </Typography>
                  ))}
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, background: 'rgba(33, 150, 243, 0.1)', borderRadius: 2, border: '1px solid rgba(33, 150, 243, 0.3)' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main', mb: 1 }}>
                    H2 Headings ({detailedAnalysis?.heading_structure?.h2_count || 0})
                  </Typography>
                  {detailedAnalysis?.heading_structure?.h2_headings?.slice(0, 3).map((heading: string, index: number) => (
                    <Typography key={index} variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                      • {heading}
                    </Typography>
                  ))}
                  {detailedAnalysis?.heading_structure?.h2_headings && detailedAnalysis.heading_structure.h2_headings.length > 3 && (
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      ... and {detailedAnalysis.heading_structure.h2_headings.length - 3} more
                    </Typography>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, background: 'rgba(156, 39, 176, 0.1)', borderRadius: 2, border: '1px solid rgba(156, 39, 176, 0.3)' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'secondary.main', mb: 1 }}>
                    H3 Headings ({detailedAnalysis?.heading_structure?.h3_count || 0})
                  </Typography>
                  {detailedAnalysis?.heading_structure?.h3_headings?.slice(0, 3).map((heading: string, index: number) => (
                    <Typography key={index} variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                      • {heading}
                    </Typography>
                  ))}
                  {detailedAnalysis?.heading_structure?.h3_headings && detailedAnalysis.heading_structure.h3_headings.length > 3 && (
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      ... and {detailedAnalysis.heading_structure.h3_headings.length - 3} more
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
            <Box sx={{ mt: 2, p: 2, background: 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
              <Tooltip
                title={
                  <Box sx={{ p: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      Heading Hierarchy Score
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Score (0-100) indicating how well your heading structure follows SEO best practices.
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                      <strong>Scoring Factors:</strong> H1 presence, logical hierarchy, keyword usage in headings
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block' }}>
                      <strong>Why it matters:</strong> Good heading structure helps search engines understand your content and improves readability.
                    </Typography>
                  </Box>
                }
                arrow
              >
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, cursor: 'help' }}>
                  Heading Hierarchy Score: {detailedAnalysis?.heading_structure?.heading_hierarchy_score || 'N/A'}
                </Typography>
              </Tooltip>
            </Box>
            
            {/* Structure Recommendations */}
            {detailedAnalysis?.content_structure?.recommendations && detailedAnalysis.content_structure.recommendations.length > 0 && (
              <Box sx={{ mt: 2, p: 2, background: 'rgba(255, 193, 7, 0.1)', borderRadius: 2, border: '1px solid rgba(255, 193, 7, 0.3)' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'warning.main' }}>
                  Structure Recommendations
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {detailedAnalysis.content_structure.recommendations.map((recommendation: string, index: number) => (
                    <Typography key={index} variant="caption" sx={{ display: 'block' }}>
                      • {recommendation}
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}
            
            {/* Heading Recommendations */}
            {detailedAnalysis?.heading_structure?.recommendations && detailedAnalysis.heading_structure.recommendations.length > 0 && (
              <Box sx={{ mt: 2, p: 2, background: 'rgba(33, 150, 243, 0.1)', borderRadius: 2, border: '1px solid rgba(33, 150, 243, 0.3)' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'primary.main' }}>
                  Heading Recommendations
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {detailedAnalysis.heading_structure.recommendations.map((recommendation: string, index: number) => (
                    <Typography key={index} variant="caption" sx={{ display: 'block' }}>
                      • {recommendation}
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}
            
            {/* Content Quality Recommendations */}
            {detailedAnalysis?.content_quality?.recommendations && detailedAnalysis.content_quality.recommendations.length > 0 && (
              <Box sx={{ mt: 2, p: 2, background: 'rgba(76, 175, 80, 0.1)', borderRadius: 2, border: '1px solid rgba(76, 175, 80, 0.3)' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'success.main' }}>
                  Content Quality Recommendations
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {detailedAnalysis.content_quality.recommendations.map((recommendation: string, index: number) => (
                    <Typography key={index} variant="caption" sx={{ display: 'block' }}>
                      • {recommendation}
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
