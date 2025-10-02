/**
 * AnalysisResultsDisplay Component
 * Displays the comprehensive website analysis results
 */

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Divider,
  Checkbox,
  FormControlLabel,
  Alert,
  Paper,
  Tooltip
} from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  Verified as VerifiedIcon,
  Psychology as PsychologyIcon,
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  Language as LanguageIcon,
  Palette as PaletteIcon,
  Speed as SpeedIcon,
  Group as GroupIcon,
  Business as BusinessIcon,
  Lightbulb as LightbulbIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

// Import rendering utilities
import {
  renderKeyInsight,
  renderProUpgradeAlert,
  renderBrandAnalysisSection,
  renderContentStrategyInsightsSection,
  renderAIGenerationTipsSection,
  renderBestPracticesSection,
  renderAvoidElementsSection,
  renderStylePatternsSection
} from '../utils/renderUtils';

// Import extracted components
import { EnhancedGuidelinesSection, KeyInsightsGrid } from './index';
import { useOnboardingStyles } from '../../common/useOnboardingStyles';

interface StyleAnalysis {
  writing_style?: {
    tone: string;
    voice: string;
    complexity: string;
    engagement_level: string;
    brand_personality?: string;
    formality_level?: string;
    emotional_appeal?: string;
  };
  content_characteristics?: {
    sentence_structure: string;
    vocabulary_level: string;
    paragraph_organization: string;
    content_flow: string;
    readability_score?: string;
    content_density?: string;
    visual_elements_usage?: string;
  };
  target_audience?: {
    demographics: string[];
    expertise_level: string;
    industry_focus: string;
    geographic_focus: string;
    psychographic_profile?: string;
    pain_points?: string[];
    motivations?: string[];
  };
  content_type?: {
    primary_type: string;
    secondary_types: string[];
    purpose: string;
    call_to_action: string;
    conversion_focus?: string;
    educational_value?: string;
  };
  brand_analysis?: {
    brand_voice: string;
    brand_values: string[];
    brand_positioning: string;
    competitive_differentiation: string;
    trust_signals: string[];
    authority_indicators: string[];
  };
  content_strategy_insights?: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
    recommended_improvements: string[];
    content_gaps: string[];
  };
  recommended_settings?: {
    writing_tone: string;
    target_audience: string;
    content_type: string;
    creativity_level: string;
    geographic_location: string;
    industry_context?: string;
    brand_alignment?: string;
  };
  guidelines?: {
    tone_recommendations: string[];
    structure_guidelines: string[];
    vocabulary_suggestions: string[];
    engagement_tips: string[];
    audience_considerations: string[];
    brand_alignment?: string[];
    seo_optimization?: string[];
    conversion_optimization?: string[];
  };
  best_practices?: string[];
  avoid_elements?: string[];
  content_strategy?: string;
  ai_generation_tips?: string[];
  competitive_advantages?: string[];
  content_calendar_suggestions?: string[];
  style_patterns?: {
    sentence_length: string;
    vocabulary_patterns: string[];
    rhetorical_devices: string[];
    paragraph_structure: string;
    transition_phrases: string[];
  };
  patterns?: {
    sentence_length: string;
    vocabulary_patterns: string[];
    rhetorical_devices: string[];
    paragraph_structure: string;
    transition_phrases: string[];
  };
  style_consistency?: string;
  unique_elements?: string[];
}

interface AnalysisResultsDisplayProps {
  analysis: StyleAnalysis;
  domainName: string;
  useAnalysisForGenAI: boolean;
  onUseAnalysisChange: (use: boolean) => void;
}

const AnalysisResultsDisplay: React.FC<AnalysisResultsDisplayProps> = ({
  analysis,
  domainName,
  useAnalysisForGenAI,
  onUseAnalysisChange
}) => {
  const styles = useOnboardingStyles();

  return (
    <Box sx={styles.analysisContainer}>
      {/* Pro Upgrade Alert */}
      {renderProUpgradeAlert()}
      
      {/* Main Analysis Results */}
      <Card sx={styles.analysisHeaderCard}>
        <CardContent sx={styles.analysisCardContent}>
          <Box sx={styles.analysisHeader}>
            <VerifiedIcon sx={styles.analysisHeaderIcon} />
            <Box>
              <Typography variant="h4" sx={styles.analysisHeaderTitle} gutterBottom>
                {domainName} Style Analysis
              </Typography>
              <Typography variant="body1" sx={styles.analysisHeaderSubtitle}>
                Comprehensive content analysis and personalized recommendations
              </Typography>
            </Box>
          </Box>

          {/* Key Insights Grid */}
          <KeyInsightsGrid 
            writing_style={analysis.writing_style}
            target_audience={analysis.target_audience}
            content_type={analysis.content_type}
          />

          {/* Content Characteristics Section */}
          {analysis.content_characteristics && (
            <Box sx={styles.analysisSection}>
              <Typography variant="h5" sx={styles.analysisSectionHeader} gutterBottom>
                <AnalyticsIcon color="info" />
                Content Characteristics
              </Typography>
               <Grid container spacing={2}>
                 {analysis.content_characteristics.vocabulary_level && (
                   <Grid item xs={12} md={6}>
                     <Tooltip title="The complexity and sophistication of words used in the content. Higher levels use more advanced vocabulary while accessible levels use simpler, everyday words." arrow>
                       <Box>
                         {renderKeyInsight(
                           'Vocabulary Level',
                           analysis.content_characteristics.vocabulary_level,
                           <LanguageIcon />,
                           'info'
                         )}
                       </Box>
                     </Tooltip>
                   </Grid>
                 )}
                
                 {analysis.content_characteristics.readability_score && (
                   <Grid item xs={12} md={6}>
                     <Tooltip title="How easy it is for readers to understand the content. Higher scores mean the content is easier to read and comprehend." arrow>
                       <Box>
                         {renderKeyInsight(
                           'Readability Score',
                           analysis.content_characteristics.readability_score,
                           <SpeedIcon />,
                           'success'
                         )}
                       </Box>
                     </Tooltip>
                   </Grid>
                 )}
                 
                 {analysis.content_characteristics.content_density && (
                   <Grid item xs={12} md={6}>
                     <Tooltip title="How much information is packed into each section. Moderate density balances information with readability." arrow>
                       <Box>
                         {renderKeyInsight(
                           'Content Density',
                           analysis.content_characteristics.content_density,
                           <PaletteIcon />,
                           'warning'
                         )}
                       </Box>
                     </Tooltip>
                   </Grid>
                 )}
                 
                 {analysis.content_characteristics.sentence_structure && (
                   <Grid item xs={12} md={6}>
                     <Tooltip title="The variety and complexity of sentence patterns used. Varied structures keep readers engaged." arrow>
                       <Box>
                         {renderKeyInsight(
                           'Sentence Structure',
                           analysis.content_characteristics.sentence_structure,
                           <AnalyticsIcon />,
                           'secondary'
                         )}
                       </Box>
                     </Tooltip>
                   </Grid>
                 )}
                
                 {analysis.content_characteristics.paragraph_organization && (
                   <Grid item xs={12} md={6}>
                     <Tooltip title="How paragraphs are structured and organized. Clear organization helps readers follow the content easily." arrow>
                       <Box>
                         {renderKeyInsight(
                           'Paragraph Organization',
                           analysis.content_characteristics.paragraph_organization,
                           <AnalyticsIcon />,
                           'primary'
                         )}
                       </Box>
                     </Tooltip>
                   </Grid>
                 )}
                 
                 {analysis.content_characteristics.content_flow && (
                   <Grid item xs={12} md={6}>
                     <Tooltip title="How smoothly the content moves from one idea to the next. Good flow keeps readers engaged throughout." arrow>
                       <Box>
                         {renderKeyInsight(
                           'Content Flow',
                           analysis.content_characteristics.content_flow,
                           <TrendingUpIcon />,
                           'success'
                         )}
                       </Box>
                     </Tooltip>
                   </Grid>
                 )}
                 
                 {analysis.content_characteristics.visual_elements_usage && (
                   <Grid item xs={12} md={6}>
                     <Tooltip title="How often images, charts, and other visual elements are used to support the text content." arrow>
                       <Box>
                         {renderKeyInsight(
                           'Visual Elements Usage',
                           analysis.content_characteristics.visual_elements_usage,
                           <PaletteIcon />,
                           'warning'
                         )}
                       </Box>
                     </Tooltip>
                   </Grid>
                 )}
              </Grid>
            </Box>
          )}

          {/* Detailed Target Audience Section */}
          {analysis.target_audience && (
            <Box sx={styles.analysisSection}>
              <Typography variant="h5" sx={styles.analysisSectionHeader} gutterBottom>
                <GroupIcon color="info" />
                Target Audience Analysis
               </Typography>
               <Grid container spacing={2}>
                 {analysis.target_audience.demographics && analysis.target_audience.demographics.length > 0 && (
                  <Grid item xs={12} md={6}>
                    {renderKeyInsight(
                      'Demographics',
                      analysis.target_audience.demographics,
                      <GroupIcon />,
                      'info'
                    )}
                  </Grid>
                )}
                
                {analysis.target_audience.industry_focus && (
                  <Grid item xs={12} md={6}>
                    {renderKeyInsight(
                      'Industry Focus',
                      analysis.target_audience.industry_focus,
                      <BusinessIcon />,
                      'primary'
                    )}
                  </Grid>
                )}
                
                {analysis.target_audience.geographic_focus && (
                  <Grid item xs={12} md={6}>
                    {renderKeyInsight(
                      'Geographic Focus',
                      analysis.target_audience.geographic_focus,
                      <AnalyticsIcon />,
                      'secondary'
                    )}
                  </Grid>
                )}
                
                  {analysis.target_audience.psychographic_profile && (
                    <Grid item xs={12} md={6}>
                      <Paper elevation={2} sx={styles.analysisAccentPaperSuccess}>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Box sx={styles.analysisAccentIconSuccess}>
                            <PsychologyIcon />
                          </Box>
                          <Box flex={1}>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                              Psychographic Profile
                            </Typography>
                            <Box component="ul" sx={styles.analysisList}>
                              {Array.isArray(analysis.target_audience.psychographic_profile)
                                ? analysis.target_audience.psychographic_profile.map((item: string, index: number) => (
                                    <Typography component="li" variant="body2" key={index} sx={styles.analysisListItem}>
                                      {item}
                                    </Typography>
                                  ))
                                : (
                                    <Typography component="li" variant="body2" sx={styles.analysisListItem}>
                                      {analysis.target_audience.psychographic_profile}
                                    </Typography>
                                  )}
                            </Box>
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>
                  )}
                
                {analysis.target_audience.pain_points && analysis.target_audience.pain_points.length > 0 && (
                  <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={styles.analysisAccentPaperError}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Box sx={styles.analysisAccentIconError}>
                          <WarningIcon />
                        </Box>
                        <Box flex={1}>
                          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                            Pain Points
                          </Typography>
                          <Box component="ul" sx={styles.analysisList}>
                            {analysis.target_audience.pain_points.map((painPoint: string, index: number) => (
                              <Typography component="li" variant="body2" key={index} sx={styles.analysisListItem}>
                                {painPoint}
                              </Typography>
                            ))}
                          </Box>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                )}
                
                {analysis.target_audience.motivations && analysis.target_audience.motivations.length > 0 && (
                  <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={styles.analysisAccentPaperSuccess}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Box sx={styles.analysisAccentIconSuccess}>
                          <TrendingUpIcon />
                        </Box>
                        <Box flex={1}>
                          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                            Motivations
                          </Typography>
                          <Box component="ul" sx={styles.analysisList}>
                            {analysis.target_audience.motivations.map((motivation: string, index: number) => (
                              <Typography component="li" variant="body2" key={index} sx={styles.analysisListItem}>
                                {motivation}
                              </Typography>
                            ))}
                          </Box>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}

          {/* Content Type Details Section */}
          {analysis.content_type && (
            <Box sx={styles.analysisSection}>
              <Typography variant="h5" sx={styles.analysisSectionHeader} gutterBottom>
                <BusinessIcon color="primary" />
                Content Type Analysis
               </Typography>
               <Grid container spacing={2}>
                 {analysis.content_type.purpose && (
                  <Grid item xs={12} md={6}>
                    {renderKeyInsight(
                      'Content Purpose',
                      analysis.content_type.purpose,
                      <AutoAwesomeIcon />,
                      'primary'
                    )}
                  </Grid>
                )}
                
                {analysis.content_type.call_to_action && (
                  <Grid item xs={12} md={6}>
                    {renderKeyInsight(
                      'Call to Action Style',
                      analysis.content_type.call_to_action,
                      <TrendingUpIcon />,
                      'success'
                    )}
                  </Grid>
                )}
                
                {analysis.content_type.conversion_focus && (
                  <Grid item xs={12} md={6}>
                    {renderKeyInsight(
                      'Conversion Focus',
                      analysis.content_type.conversion_focus,
                      <AnalyticsIcon />,
                      'info'
                    )}
                  </Grid>
                )}
                
                {analysis.content_type.educational_value && (
                  <Grid item xs={12} md={6}>
                    {renderKeyInsight(
                      'Educational Value',
                      analysis.content_type.educational_value,
                      <LightbulbIcon />,
                      'warning'
                    )}
                  </Grid>
                )}
                
                {analysis.content_type.secondary_types && analysis.content_type.secondary_types.length > 0 && (
                  <Grid item xs={12}>
                    <Paper elevation={2} sx={styles.analysisAccentPaperSuccess}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Box sx={styles.analysisAccentIconSuccess}>
                          <BusinessIcon />
                        </Box>
                        <Box flex={1}>
                          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                            Secondary Content Types
                          </Typography>
                          <Box component="ul" sx={styles.analysisList}>
                            {analysis.content_type.secondary_types.map((type: string, index: number) => (
                              <Typography component="li" variant="body2" key={index} sx={styles.analysisListItem}>
                                {type}
                              </Typography>
                            ))}
                          </Box>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}

          <Divider sx={styles.analysisDivider} />

          {/* Content Strategy */}
          {analysis.content_strategy && (
            <Box sx={styles.analysisSection}>
              <Typography variant="h5" sx={styles.analysisSectionHeader} gutterBottom>
                <AutoAwesomeIcon color="primary" />
                Content Strategy
              </Typography>
              <Paper elevation={3} sx={styles.analysisGradientPaperPrimary}>
                <Typography variant="body1" sx={styles.analysisParagraph}>
                  {analysis.content_strategy}
                </Typography>
              </Paper>
            </Box>
          )}

          {/* Recommended Settings for AI Generation */}
          {analysis.recommended_settings && (
            <Box sx={styles.analysisSection}>
              <Typography variant="h5" sx={styles.analysisSectionHeader} gutterBottom>
                <AutoAwesomeIcon color="primary" />
                Recommended AI Generation Settings
              </Typography>
              <Paper elevation={3} sx={styles.analysisGradientPaperPrimary}>
                <Grid container spacing={2}>
                  {analysis.recommended_settings.writing_tone && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" sx={styles.analysisSubheader}>
                        Writing Tone:
                      </Typography>
                      <Typography variant="body1" sx={styles.analysisValue}>
                        {analysis.recommended_settings.writing_tone}
                      </Typography>
                    </Grid>
                  )}
                  
                  {analysis.recommended_settings.target_audience && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" sx={styles.analysisSubheader}>
                        Target Audience:
                      </Typography>
                      <Typography variant="body1" sx={styles.analysisValue}>
                        {analysis.recommended_settings.target_audience}
                      </Typography>
                    </Grid>
                  )}
                  
                  {analysis.recommended_settings.content_type && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" sx={styles.analysisSubheader}>
                        Content Type:
                      </Typography>
                      <Typography variant="body1" sx={styles.analysisValue}>
                        {analysis.recommended_settings.content_type}
                      </Typography>
                    </Grid>
                  )}
                  
                  {analysis.recommended_settings.creativity_level && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" sx={styles.analysisSubheader}>
                        Creativity Level:
                      </Typography>
                      <Typography variant="body1" sx={styles.analysisValue}>
                        {analysis.recommended_settings.creativity_level}
                      </Typography>
                    </Grid>
                  )}
                  
                  {analysis.recommended_settings.industry_context && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" sx={styles.analysisSubheader}>
                        Industry Context:
                      </Typography>
                      <Typography variant="body1" sx={styles.analysisValue}>
                        {analysis.recommended_settings.industry_context}
                      </Typography>
                    </Grid>
                  )}
                  
                  {analysis.recommended_settings.geographic_location && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" sx={styles.analysisSubheader}>
                        Geographic Focus:
                      </Typography>
                      <Typography variant="body1" sx={styles.analysisValue}>
                        {analysis.recommended_settings.geographic_location}
                      </Typography>
                    </Grid>
                  )}

                  {analysis.recommended_settings.brand_alignment && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" sx={styles.analysisSubheader}>
                        Brand Alignment:
                      </Typography>
                      <Typography variant="body1" sx={styles.analysisValue}>
                        {analysis.recommended_settings.brand_alignment}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Box>
          )}

          {/* Brand Analysis */}
          {analysis.brand_analysis && renderBrandAnalysisSection(analysis.brand_analysis)}

          {/* Content Strategy Insights */}
          {analysis.content_strategy_insights && renderContentStrategyInsightsSection(analysis.content_strategy_insights)}

          {/* AI Generation Tips */}
          {analysis.ai_generation_tips && renderAIGenerationTipsSection(analysis.ai_generation_tips)}

          {/* Style Patterns Section */}
          {(analysis.style_patterns || analysis.patterns) && (
            <Box sx={styles.analysisSection}>
              {renderStylePatternsSection(analysis.style_patterns || analysis.patterns)}
            </Box>
          )}

          {/* Style Consistency Section */}
          {analysis.style_consistency && (
            <Box sx={styles.analysisSection}>
              <Typography variant="h5" sx={styles.analysisSectionHeader} gutterBottom>
                <AnalyticsIcon color="info" />
                Style Consistency
              </Typography>
              <Paper elevation={3} sx={styles.analysisGradientPaperWarning}>
                <Typography variant="body1" sx={styles.analysisParagraph}>
                  {analysis.style_consistency}
                </Typography>
              </Paper>
            </Box>
          )}

          {/* Unique Elements Section */}
          {analysis.unique_elements && analysis.unique_elements.length > 0 && (
            <Box sx={styles.analysisSection}>
              <Typography variant="h5" sx={styles.analysisSectionHeader} gutterBottom>
                <AutoAwesomeIcon color="primary" />
                Unique Style Elements
              </Typography>
              <Paper elevation={3} sx={styles.analysisGradientPaperAccent}>
                <Box component="ul" sx={styles.analysisList}>
                  {analysis.unique_elements.map((element: string, index: number) => (
                    <Typography component="li" variant="body1" key={index} sx={styles.analysisListItem}>
                      {element}
                    </Typography>
                  ))}
                </Box>
              </Paper>
            </Box>
          )}

          {/* Enhanced Guidelines Section */}
          {analysis.guidelines && (
            <EnhancedGuidelinesSection 
              guidelines={analysis.guidelines}
              domainName={domainName}
            />
          )}

          {/* Best Practices & Avoid Elements */}
           <Grid container spacing={2} sx={styles.analysisSection}>
            {analysis.best_practices && (
              <Grid item xs={12} md={6}>
                {renderBestPracticesSection(analysis.best_practices)}
              </Grid>
            )}
            
            {analysis.avoid_elements && (
              <Grid item xs={12} md={6}>
                {renderAvoidElementsSection(analysis.avoid_elements)}
              </Grid>
            )}
          </Grid>

          {/* Competitive Advantages */}
          {analysis.competitive_advantages && analysis.competitive_advantages.length > 0 && (
            <Box sx={styles.analysisSection}>
              <Typography variant="h5" sx={styles.analysisSectionHeader} gutterBottom>
                <TrendingUpIcon color="success" />
                Competitive Advantages
              </Typography>
              <Paper elevation={3} sx={styles.analysisGradientPaperSuccess}>
                <Box component="ul" sx={styles.analysisList}>
                  {analysis.competitive_advantages.map((advantage: string, index: number) => (
                    <Typography component="li" variant="body1" key={index} sx={styles.analysisListItem}>
                      {advantage}
                    </Typography>
                  ))}
                </Box>
              </Paper>
            </Box>
          )}

          {/* Content Calendar Suggestions */}
          {analysis.content_calendar_suggestions && analysis.content_calendar_suggestions.length > 0 && (
            <Box sx={styles.analysisSection}>
              <Typography variant="h5" sx={styles.analysisSectionHeader} gutterBottom>
                <AnalyticsIcon color="primary" />
                Content Calendar Suggestions
              </Typography>
              <Paper elevation={3} sx={styles.analysisGradientPaperInfo}>
                <Box component="ul" sx={styles.analysisList}>
                  {analysis.content_calendar_suggestions.map((suggestion: string, index: number) => (
                    <Typography component="li" variant="body1" key={index} sx={styles.analysisListItem}>
                      {suggestion}
                    </Typography>
                  ))}
                </Box>
              </Paper>
            </Box>
          )}

          {/* GenAI Integration Checkbox */}
          <Box sx={styles.analysisCheckboxContainer}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={useAnalysisForGenAI}
                  onChange={(e) => onUseAnalysisChange(e.target.checked)}
                  color="primary"
                  size="large"
                />
              }
              label={
                <Box>
                  <Typography variant="h6" sx={styles.analysisSubheader} gutterBottom>
                    Use Analysis for AI Content Generation
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Apply this style analysis to personalize AI-generated content, ensuring it matches {domainName}'s voice and tone.
                  </Typography>
                </Box>
              }
            />
          </Box>

          {/* Success Message */}
          <Alert severity="success" sx={styles.analysisSuccessAlert}>
            <Typography variant="body1" sx={styles.analysisAlertText}>
              ✅ Analysis complete! Your content style has been analyzed and personalized recommendations are ready.
            </Typography>
          </Alert>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AnalysisResultsDisplay;
