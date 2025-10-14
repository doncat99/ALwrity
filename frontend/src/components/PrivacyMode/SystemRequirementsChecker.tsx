import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Collapse,
  Fade,
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Warning,
  Info,
  Computer,
  Memory,
  Storage,
  Speed,
  Security,
  NetworkCheck,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import { ollamaApi, SystemRequirements } from '../../api/ollama';

export interface SystemRequirementsCheckerProps {
  onRequirementsMet: (met: boolean) => void;
  onRequirementsCheck: (requirements: SystemRequirements) => void;
}

const SystemRequirementsChecker: React.FC<SystemRequirementsCheckerProps> = ({
  onRequirementsMet,
  onRequirementsCheck,
}) => {
  const [requirements, setRequirements] = useState<SystemRequirements | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    checkSystemRequirements();
  }, []);

  const checkSystemRequirements = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await ollamaApi.checkSystemRequirements();
      setRequirements(result);
      onRequirementsCheck(result);
      onRequirementsMet(result.meets_requirements);
    } catch (err) {
      const errorMessage = (err as Error).message || 'Failed to check system requirements';
      setError(errorMessage);
      onRequirementsMet(false);
    } finally {
      setLoading(false);
    }
  };

  const getRequirementIcon = (sufficient: boolean) => {
    return sufficient ? (
      <CheckCircle sx={{ color: '#10B981', fontSize: 20 }} />
    ) : (
      <Error sx={{ color: '#EF4444', fontSize: 20 }} />
    );
  };

  const getRequirementColor = (sufficient: boolean) => {
    return sufficient ? '#10B981' : '#EF4444';
  };

  const getRequirementChip = (sufficient: boolean) => {
    return (
      <Chip
        label={sufficient ? 'PASS' : 'FAIL'}
        size="small"
        sx={{
          backgroundColor: sufficient ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          color: sufficient ? '#10B981' : '#EF4444',
          fontWeight: 600,
          fontSize: '0.75rem',
        }}
      />
    );
  };

  if (loading) {
    return (
      <Fade in={true}>
        <Card sx={{ mb: 3, borderRadius: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Computer sx={{ color: '#6366F1', fontSize: 24 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1E293B' }}>
                Checking System Requirements
              </Typography>
            </Box>
            <LinearProgress sx={{ borderRadius: 2 }} />
            <Typography variant="body2" sx={{ color: '#6B7280', mt: 1 }}>
              Verifying your system meets the requirements for Privacy Mode...
            </Typography>
          </CardContent>
        </Card>
      </Fade>
    );
  }

  if (error) {
    return (
      <Fade in={true}>
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
            Failed to check system requirements
          </Typography>
          <Typography variant="caption" sx={{ color: '#6B7280' }}>
            {error}
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={checkSystemRequirements}
              sx={{ textTransform: 'none' }}
            >
              Retry Check
            </Button>
          </Box>
        </Alert>
      </Fade>
    );
  }

  if (!requirements) return null;

  const overallStatus = requirements.meets_requirements ? 'success' : 'warning';
  const overallIcon = requirements.meets_requirements ? (
    <CheckCircle sx={{ color: '#10B981', fontSize: 24 }} />
  ) : (
    <Warning sx={{ color: '#F59E0B', fontSize: 24 }} />
  );

  return (
    <Fade in={true}>
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            {overallIcon}
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1E293B' }}>
              System Requirements Check
            </Typography>
            <Chip
              label={requirements.meets_requirements ? 'READY' : 'ISSUES FOUND'}
              size="small"
              sx={{
                backgroundColor: requirements.meets_requirements 
                  ? 'rgba(16, 185, 129, 0.1)' 
                  : 'rgba(245, 158, 11, 0.1)',
                color: requirements.meets_requirements ? '#10B981' : '#F59E0B',
                fontWeight: 600,
                fontSize: '0.75rem',
              }}
            />
          </Box>

          {/* Summary */}
          <Typography variant="body2" sx={{ color: '#6B7280', mb: 3 }}>
            {requirements.meets_requirements 
              ? 'Your system meets all requirements for Privacy Mode installation.'
              : 'Some system requirements are not met. Please review the details below.'
            }
          </Typography>

          {/* Quick Stats */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
            <Box sx={{ p: 2, borderRadius: 2, backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Memory sx={{ fontSize: 16, color: '#6B7280' }} />
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151' }}>
                  Memory
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: getRequirementColor(requirements.checks.ram.sufficient) }}>
                {requirements.checks.ram.available}
              </Typography>
              {getRequirementChip(requirements.checks.ram.sufficient)}
            </Box>

            <Box sx={{ p: 2, borderRadius: 2, backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Speed sx={{ fontSize: 16, color: '#6B7280' }} />
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151' }}>
                  CPU
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: getRequirementColor(requirements.checks.cpu.sufficient) }}>
                {requirements.checks.cpu.available}
              </Typography>
              {getRequirementChip(requirements.checks.cpu.sufficient)}
            </Box>

            <Box sx={{ p: 2, borderRadius: 2, backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Storage sx={{ fontSize: 16, color: '#6B7280' }} />
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151' }}>
                  Storage
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: getRequirementColor(requirements.checks.storage.sufficient) }}>
                {requirements.checks.storage.available}
              </Typography>
              {getRequirementChip(requirements.checks.storage.sufficient)}
            </Box>

            <Box sx={{ p: 2, borderRadius: 2, backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Computer sx={{ fontSize: 16, color: '#6B7280' }} />
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151' }}>
                  Platform
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: getRequirementColor(requirements.checks.platform.supported) }}>
                {requirements.checks.platform.detected}
              </Typography>
              {getRequirementChip(requirements.checks.platform.supported)}
            </Box>
          </Box>

          {/* Detailed Requirements */}
          <Button
            onClick={() => setExpanded(!expanded)}
            endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
            sx={{
              textTransform: 'none',
              color: '#6366F1',
              fontWeight: 500,
              mb: expanded ? 2 : 0,
            }}
          >
            {expanded ? 'Hide Details' : 'Show Detailed Requirements'}
          </Button>

          <Collapse in={expanded}>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  {getRequirementIcon(requirements.checks.ram.sufficient)}
                </ListItemIcon>
                <ListItemText
                  primary="RAM (Memory)"
                  secondary={
                    <Box>
                      <Typography variant="body2" sx={{ color: '#374151' }}>
                        Required: {requirements.checks.ram.required}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6B7280' }}>
                        Available: {requirements.checks.ram.available}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  {getRequirementIcon(requirements.checks.cpu.sufficient)}
                </ListItemIcon>
                <ListItemText
                  primary="CPU (Processor)"
                  secondary={
                    <Box>
                      <Typography variant="body2" sx={{ color: '#374151' }}>
                        Required: {requirements.checks.cpu.required}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6B7280' }}>
                        Available: {requirements.checks.cpu.available}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  {getRequirementIcon(requirements.checks.storage.sufficient)}
                </ListItemIcon>
                <ListItemText
                  primary="Storage Space"
                  secondary={
                    <Box>
                      <Typography variant="body2" sx={{ color: '#374151' }}>
                        Required: {requirements.checks.storage.required}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6B7280' }}>
                        Available: {requirements.checks.storage.available}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  {getRequirementIcon(requirements.checks.platform.supported)}
                </ListItemIcon>
                <ListItemText
                  primary="Operating System"
                  secondary={
                    <Box>
                      <Typography variant="body2" sx={{ color: '#374151' }}>
                        Detected: {requirements.checks.platform.detected}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6B7280' }}>
                        Supported: {requirements.checks.platform.supported ? 'Yes' : 'No'}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            </List>
          </Collapse>

          {/* Recommendations */}
          {requirements.recommendations.length > 0 && (
            <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                Recommendations
              </Typography>
              <List dense>
                {requirements.recommendations.map((recommendation, index) => (
                  <ListItem key={index} sx={{ py: 0 }}>
                    <ListItemIcon sx={{ minWidth: 24 }}>
                      <Info sx={{ fontSize: 16, color: '#3B82F6' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={recommendation}
                      primaryTypographyProps={{
                        variant: 'body2',
                        color: '#374151',
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Alert>
          )}
        </CardContent>
      </Card>
    </Fade>
  );
};

export default SystemRequirementsChecker;
