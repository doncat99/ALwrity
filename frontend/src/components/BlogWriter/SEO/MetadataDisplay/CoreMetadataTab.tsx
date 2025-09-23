/**
 * Core Metadata Tab Component
 * 
 * Displays and allows editing of core SEO metadata including:
 * - SEO Title
 * - Meta Description
 * - URL Slug
 * - Blog Tags
 * - Blog Categories
 * - Social Hashtags
 * - Reading Time
 * - Focus Keyword
 */

import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Chip,
  Paper,
  Grid,
  IconButton,
  Tooltip,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Alert
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  Check as CheckIcon,
  Search as SearchIcon,
  Link as LinkIcon,
  Tag as TagIcon,
  Category as CategoryIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';

interface CoreMetadataTabProps {
  metadata: any;
  onMetadataEdit: (field: string, value: any) => void;
  onCopyToClipboard: (text: string, itemId: string) => void;
  copiedItems: Set<string>;
}

export const CoreMetadataTab: React.FC<CoreMetadataTabProps> = ({
  metadata,
  onMetadataEdit,
  onCopyToClipboard,
  copiedItems
}) => {
  const handleTextFieldChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    onMetadataEdit(field, event.target.value);
  };

  const handleTagsChange = (field: string) => (event: any) => {
    const value = typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value;
    onMetadataEdit(field, value);
  };

  const getCharacterCountColor = (current: number, max: number) => {
    if (current > max) return 'error';
    if (current > max * 0.9) return 'warning';
    return 'success';
  };

  const getCharacterCountText = (current: number, max: number) => {
    if (current > max) return `${current}/${max} (Too long)`;
    if (current > max * 0.9) return `${current}/${max} (Near limit)`;
    return `${current}/${max}`;
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <SearchIcon sx={{ color: 'primary.main' }} />
        Core SEO Metadata
      </Typography>

      <Grid container spacing={3}>
        {/* SEO Title */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.1)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <SearchIcon sx={{ fontSize: 20 }} />
                SEO Title
              </Typography>
              <Tooltip title="Copy to clipboard">
                <IconButton
                  size="small"
                  onClick={() => onCopyToClipboard(metadata.seo_title || '', 'seo_title')}
                >
                  {copiedItems.has('seo_title') ? <CheckIcon color="success" /> : <CopyIcon />}
                </IconButton>
              </Tooltip>
            </Box>
            <TextField
              fullWidth
              multiline
              rows={2}
              value={metadata.seo_title || ''}
              onChange={handleTextFieldChange('seo_title')}
              placeholder="Enter SEO-optimized title (50-60 characters)"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Typography
                      variant="caption"
                      color={getCharacterCountColor((metadata.seo_title || '').length, 60)}
                    >
                      {getCharacterCountText((metadata.seo_title || '').length, 60)}
                    </Typography>
                  </InputAdornment>
                )
              }}
            />
            <Alert severity="info" sx={{ mt: 1 }}>
              Include your primary keyword and make it compelling for clicks
            </Alert>
          </Paper>
        </Grid>

        {/* Meta Description */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.1)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <SearchIcon sx={{ fontSize: 20 }} />
                Meta Description
              </Typography>
              <Tooltip title="Copy to clipboard">
                <IconButton
                  size="small"
                  onClick={() => onCopyToClipboard(metadata.meta_description || '', 'meta_description')}
                >
                  {copiedItems.has('meta_description') ? <CheckIcon color="success" /> : <CopyIcon />}
                </IconButton>
              </Tooltip>
            </Box>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={metadata.meta_description || ''}
              onChange={handleTextFieldChange('meta_description')}
              placeholder="Enter compelling meta description (150-160 characters)"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Typography
                      variant="caption"
                      color={getCharacterCountColor((metadata.meta_description || '').length, 160)}
                    >
                      {getCharacterCountText((metadata.meta_description || '').length, 160)}
                    </Typography>
                  </InputAdornment>
                )
              }}
            />
            <Alert severity="info" sx={{ mt: 1 }}>
              Include a call-to-action and your primary keyword
            </Alert>
          </Paper>
        </Grid>

        {/* URL Slug */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.1)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <LinkIcon sx={{ fontSize: 20 }} />
                URL Slug
              </Typography>
              <Tooltip title="Copy to clipboard">
                <IconButton
                  size="small"
                  onClick={() => onCopyToClipboard(metadata.url_slug || '', 'url_slug')}
                >
                  {copiedItems.has('url_slug') ? <CheckIcon color="success" /> : <CopyIcon />}
                </IconButton>
              </Tooltip>
            </Box>
            <TextField
              fullWidth
              value={metadata.url_slug || ''}
              onChange={handleTextFieldChange('url_slug')}
              placeholder="seo-friendly-url-slug"
              helperText="Use lowercase letters, numbers, and hyphens only"
            />
          </Paper>
        </Grid>

        {/* Focus Keyword */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.1)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUpIcon sx={{ fontSize: 20 }} />
                Focus Keyword
              </Typography>
              <Tooltip title="Copy to clipboard">
                <IconButton
                  size="small"
                  onClick={() => onCopyToClipboard(metadata.focus_keyword || '', 'focus_keyword')}
                >
                  {copiedItems.has('focus_keyword') ? <CheckIcon color="success" /> : <CopyIcon />}
                </IconButton>
              </Tooltip>
            </Box>
            <TextField
              fullWidth
              value={metadata.focus_keyword || ''}
              onChange={handleTextFieldChange('focus_keyword')}
              placeholder="primary-keyword"
              helperText="Your main SEO keyword for this post"
            />
          </Paper>
        </Grid>

        {/* Blog Tags */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.1)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <TagIcon sx={{ fontSize: 20 }} />
                Blog Tags
              </Typography>
              <Tooltip title="Copy to clipboard">
                <IconButton
                  size="small"
                  onClick={() => onCopyToClipboard((metadata.blog_tags || []).join(', '), 'blog_tags')}
                >
                  {copiedItems.has('blog_tags') ? <CheckIcon color="success" /> : <CopyIcon />}
                </IconButton>
              </Tooltip>
            </Box>
            <FormControl fullWidth>
              <InputLabel>Tags</InputLabel>
              <Select
                multiple
                value={metadata.blog_tags || []}
                onChange={handleTagsChange('blog_tags')}
                input={<OutlinedInput label="Tags" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value: string) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                {(metadata.blog_tags || []).map((tag: string) => (
                  <MenuItem key={tag} value={tag}>
                    {tag}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Alert severity="info" sx={{ mt: 1 }}>
              Add relevant tags for better categorization and discoverability
            </Alert>
          </Paper>
        </Grid>

        {/* Blog Categories */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.1)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CategoryIcon sx={{ fontSize: 20 }} />
                Blog Categories
              </Typography>
              <Tooltip title="Copy to clipboard">
                <IconButton
                  size="small"
                  onClick={() => onCopyToClipboard((metadata.blog_categories || []).join(', '), 'blog_categories')}
                >
                  {copiedItems.has('blog_categories') ? <CheckIcon color="success" /> : <CopyIcon />}
                </IconButton>
              </Tooltip>
            </Box>
            <FormControl fullWidth>
              <InputLabel>Categories</InputLabel>
              <Select
                multiple
                value={metadata.blog_categories || []}
                onChange={handleTagsChange('blog_categories')}
                input={<OutlinedInput label="Categories" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value: string) => (
                      <Chip key={value} label={value} size="small" color="primary" />
                    ))}
                  </Box>
                )}
              >
                {(metadata.blog_categories || []).map((category: string) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Alert severity="info" sx={{ mt: 1 }}>
              Select 2-3 primary categories for your content
            </Alert>
          </Paper>
        </Grid>

        {/* Social Hashtags */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.1)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <TagIcon sx={{ fontSize: 20 }} />
                Social Hashtags
              </Typography>
              <Tooltip title="Copy to clipboard">
                <IconButton
                  size="small"
                  onClick={() => onCopyToClipboard((metadata.social_hashtags || []).join(' '), 'social_hashtags')}
                >
                  {copiedItems.has('social_hashtags') ? <CheckIcon color="success" /> : <CopyIcon />}
                </IconButton>
              </Tooltip>
            </Box>
            <FormControl fullWidth>
              <InputLabel>Hashtags</InputLabel>
              <Select
                multiple
                value={metadata.social_hashtags || []}
                onChange={handleTagsChange('social_hashtags')}
                input={<OutlinedInput label="Hashtags" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value: string) => (
                      <Chip key={value} label={value} size="small" color="secondary" />
                    ))}
                  </Box>
                )}
              >
                {(metadata.social_hashtags || []).map((hashtag: string) => (
                  <MenuItem key={hashtag} value={hashtag}>
                    {hashtag}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Alert severity="info" sx={{ mt: 1 }}>
              Include # symbol for social media platforms
            </Alert>
          </Paper>
        </Grid>

        {/* Reading Time */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.1)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <ScheduleIcon sx={{ fontSize: 20 }} />
                Reading Time
              </Typography>
              <Tooltip title="Copy to clipboard">
                <IconButton
                  size="small"
                  onClick={() => onCopyToClipboard(`${metadata.reading_time || 0} minutes`, 'reading_time')}
                >
                  {copiedItems.has('reading_time') ? <CheckIcon color="success" /> : <CopyIcon />}
                </IconButton>
              </Tooltip>
            </Box>
            <TextField
              fullWidth
              type="number"
              value={metadata.reading_time || 0}
              onChange={handleTextFieldChange('reading_time')}
              placeholder="5"
              InputProps={{
                endAdornment: <InputAdornment position="end">minutes</InputAdornment>
              }}
              helperText="Estimated reading time for your content"
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
