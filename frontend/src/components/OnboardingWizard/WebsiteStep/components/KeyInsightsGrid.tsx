/**
 * Key Insights Grid Component
 * Displays the main key insights in a grid layout
 */

import React from 'react';
import {
  Grid,
  Tooltip,
  Box
} from '@mui/material';
import {
  Palette as PaletteIcon,
  Speed as SpeedIcon,
  Language as LanguageIcon,
  TrendingUp as TrendingUpIcon,
  Business as BusinessIcon,
  Psychology as PsychologyIcon,
  Group as GroupIcon,
  Explore as ExploreIcon
} from '@mui/icons-material';

// Import rendering utilities
import { renderKeyInsight } from '../utils/renderUtils';

interface WritingStyle {
  tone?: string;
  voice?: string;
  complexity?: string;
  engagement_level?: string;
  brand_personality?: string;
  formality_level?: string;
  emotional_appeal?: string;
}

interface TargetAudience {
  expertise_level?: string;
  geographic_focus?: string;
}

interface ContentType {
  primary_type?: string;
}

interface KeyInsightsGridProps {
  writing_style?: WritingStyle;
  target_audience?: TargetAudience;
  content_type?: ContentType;
}

const KeyInsightsGrid: React.FC<KeyInsightsGridProps> = ({
  writing_style,
  target_audience,
  content_type
}) => {
  return (
    <Grid container spacing={2} sx={{ mb: 2.5 }}>
       {writing_style?.tone && (
         <Grid item xs={12} md={6}>
           <Tooltip title="The emotional quality and attitude of the writing - how it makes readers feel and the mood it creates." arrow>
             <Box>
               {renderKeyInsight(
                 'Writing Tone',
                 writing_style.tone,
                 <PaletteIcon />,
                 'primary'
               )}
             </Box>
           </Tooltip>
         </Grid>
       )}
      
       {writing_style?.complexity && (
         <Grid item xs={12} md={6}>
           <Tooltip title="How sophisticated or simple the content is. Moderate complexity balances depth with accessibility." arrow>
             <Box>
               {renderKeyInsight(
                 'Content Complexity',
                 writing_style.complexity,
                 <SpeedIcon />,
                 'secondary'
               )}
             </Box>
           </Tooltip>
         </Grid>
       )}
       
       {writing_style?.voice && (
         <Grid item xs={12} md={6}>
           <Tooltip title="The unique personality and style of the writing - what makes it distinctive and recognizable." arrow>
             <Box>
               {renderKeyInsight(
                 'Writing Voice',
                 writing_style.voice,
                 <LanguageIcon />,
                 'info'
               )}
             </Box>
           </Tooltip>
         </Grid>
       )}
       
       {writing_style?.engagement_level && (
         <Grid item xs={12} md={6}>
           <Tooltip title="How well the content captures and maintains reader attention throughout the piece." arrow>
             <Box>
               {renderKeyInsight(
                 'Engagement Level',
                 writing_style.engagement_level,
                 <TrendingUpIcon />,
                 'success'
               )}
             </Box>
           </Tooltip>
         </Grid>
       )}
      
       {writing_style?.brand_personality && (
         <Grid item xs={12} md={6}>
           <Tooltip title="The human characteristics and traits associated with the brand, like friendly, professional, or innovative." arrow>
             <Box>
               {renderKeyInsight(
                 'Brand Personality',
                 writing_style.brand_personality,
                 <BusinessIcon />,
                 'warning'
               )}
             </Box>
           </Tooltip>
         </Grid>
       )}
       
       {writing_style?.formality_level && (
         <Grid item xs={12} md={6}>
           <Tooltip title="How formal or casual the writing style is. Semi-formal strikes a balance between professional and approachable." arrow>
             <Box>
               {renderKeyInsight(
                 'Formality Level',
                 writing_style.formality_level,
                 <PsychologyIcon />,
                 'primary'
               )}
             </Box>
           </Tooltip>
         </Grid>
       )}
       
       {writing_style?.emotional_appeal && (
         <Grid item xs={12} md={6}>
           <Tooltip title="How the content connects with readers' emotions - what feelings it aims to evoke." arrow>
             <Box>
               {renderKeyInsight(
                 'Emotional Appeal',
                 writing_style.emotional_appeal,
                 <PaletteIcon />,
                 'secondary'
               )}
             </Box>
           </Tooltip>
         </Grid>
       )}
      
       {target_audience?.expertise_level && (
         <Grid item xs={12} md={6}>
           <Tooltip title="The skill level and experience of the intended readers - from beginners to experts in the subject matter." arrow>
             <Box>
               {renderKeyInsight(
                 'Target Audience',
                 target_audience.expertise_level,
                 <GroupIcon />,
                 'info'
               )}
             </Box>
           </Tooltip>
         </Grid>
       )}

       {target_audience?.geographic_focus && target_audience.geographic_focus.trim() !== '' && (
         <Grid item xs={12} md={6}>
           <Tooltip title="The geographical regions or areas the content is primarily intended for - local, national, or global reach." arrow>
             <Box>
               {renderKeyInsight(
                 'Geographic Focus',
                 target_audience.geographic_focus,
                 <ExploreIcon />,
                 'secondary'
               )}
             </Box>
           </Tooltip>
         </Grid>
       )}
       
       {content_type?.primary_type && (
         <Grid item xs={12} md={6}>
           <Tooltip title="The main category or format of content being created - blog posts, tutorials, product descriptions, etc." arrow>
             <Box>
               {renderKeyInsight(
                 'Content Type',
                 content_type.primary_type,
                 <BusinessIcon />,
                 'warning'
               )}
             </Box>
           </Tooltip>
         </Grid>
       )}
    </Grid>
  );
};

export default KeyInsightsGrid;
