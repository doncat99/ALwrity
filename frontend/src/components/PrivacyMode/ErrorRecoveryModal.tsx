import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  CircularProgress,
  Divider,
  Fade,
} from '@mui/material';
import {
  ExpandMore,
  Refresh,
  Settings,
  Help,
  CheckCircle,
  Error as ErrorIcon,
  Warning,
  Info,
  Security,
  Download,
  PlayArrow,
} from '@mui/icons-material';
import { OllamaError, ErrorRecoveryAction, getSeverityColor, getSeverityIcon, getTroubleshootingSteps } from '../../utils/ollama/errorHandling';

export interface ErrorRecoveryModalProps {
  open: boolean;
  onClose: () => void;
  error: OllamaError;
  onRetry: () => void;
  onRecoveryAction: (actionId: string) => Promise<boolean>;
}

const ErrorRecoveryModal: React.FC<ErrorRecoveryModalProps> = ({
  open,
  onClose,
  error,
  onRetry,
  onRecoveryAction,
}) => {
  const [executingAction, setExecutingAction] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    troubleshooting: false,
    recovery: false,
  });

  const handleSectionToggle = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleRecoveryAction = async (action: ErrorRecoveryAction) => {
    setExecutingAction(action.id);
    try {
      const success = await onRecoveryAction(action.id);
      if (success) {
        // Action completed successfully
        console.log(`Recovery action ${action.id} completed successfully`);
      }
    } catch (error) {
      console.error(`Recovery action ${action.id} failed:`, error);
    } finally {
      setExecutingAction(null);
    }
  };

  const getErrorIcon = () => {
    switch (error.severity) {
      case 'critical': return <ErrorIcon sx={{ color: '#DC2626', fontSize: 32 }} />;
      case 'high': return <ErrorIcon sx={{ color: '#EF4444', fontSize: 32 }} />;
      case 'medium': return <Warning sx={{ color: '#F59E0B', fontSize: 32 }} />;
      case 'low': return <Info sx={{ color: '#6B7280', fontSize: 32 }} />;
      default: return <ErrorIcon sx={{ color: '#6B7280', fontSize: 32 }} />;
    }
  };

  const getSeverityChip = () => {
    const color = getSeverityColor(error.severity);
    const icon = getSeverityIcon(error.severity);
    
    return (
      <Chip
        label={`${icon} ${error.severity.toUpperCase()}`}
        sx={{
          backgroundColor: `${color}15`,
          color: color,
          fontWeight: 600,
          fontSize: '0.75rem',
          border: `1px solid ${color}30`,
        }}
      />
    );
  };

  const troubleshootingSteps = getTroubleshootingSteps(error);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {getErrorIcon()}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1E293B' }}>
              Privacy Mode Setup Error
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              {error.message}
            </Typography>
          </Box>
          {getSeverityChip()}
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pb: 2 }}>
        {/* Error Details */}
        <Alert 
          severity={error.severity === 'critical' ? 'error' : error.severity === 'high' ? 'error' : 'warning'}
          sx={{ mb: 3, borderRadius: 2 }}
        >
          <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
            {error.message}
          </Typography>
          {error.details && (
            <Typography variant="caption" sx={{ color: '#6B7280', fontFamily: 'monospace' }}>
              {error.details}
            </Typography>
          )}
        </Alert>

        {/* Quick Actions */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: '#374151' }}>
            Quick Actions
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={onRetry}
              sx={{
                backgroundColor: '#6366F1',
                '&:hover': { backgroundColor: '#4F46E5' },
                textTransform: 'none',
                fontWeight: 500,
              }}
            >
              Try Again
            </Button>
            <Button
              variant="outlined"
              startIcon={<Help />}
              onClick={() => handleSectionToggle('troubleshooting')}
              sx={{
                borderColor: '#6B7280',
                color: '#6B7280',
                '&:hover': { borderColor: '#4B5563', backgroundColor: '#F9FAFB' },
                textTransform: 'none',
                fontWeight: 500,
              }}
            >
              Show Help
            </Button>
          </Box>
        </Box>

        {/* Troubleshooting Steps */}
        <Accordion 
          expanded={expandedSections.troubleshooting}
          onChange={() => handleSectionToggle('troubleshooting')}
          sx={{ mb: 2, boxShadow: 'none', border: '1px solid #E5E7EB' }}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#374151' }}>
              Troubleshooting Steps
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List dense>
              {troubleshootingSteps.map((step, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <Typography variant="body2" sx={{ color: '#6B7280' }}>
                      {index + 1}.
                    </Typography>
                  </ListItemIcon>
                  <ListItemText
                    primary={step}
                    primaryTypographyProps={{
                      variant: 'body2',
                      color: '#374151',
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>

        {/* Recovery Actions */}
        <Accordion 
          expanded={expandedSections.recovery}
          onChange={() => handleSectionToggle('recovery')}
          sx={{ mb: 2, boxShadow: 'none', border: '1px solid #E5E7EB' }}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#374151' }}>
              Advanced Recovery Options
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {error.suggestions.map((suggestion, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid #E5E7EB',
                    backgroundColor: '#F9FAFB',
                  }}
                >
                  <Typography variant="body2" sx={{ color: '#374151', mb: 1 }}>
                    {suggestion}
                  </Typography>
                </Box>
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Error Code and Timestamp */}
        <Box sx={{ mt: 3, p: 2, backgroundColor: '#F3F4F6', borderRadius: 2 }}>
          <Typography variant="caption" sx={{ color: '#6B7280', fontFamily: 'monospace' }}>
            Error Code: {error.code} | Time: {error.timestamp.toLocaleTimeString()}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderColor: '#6B7280',
            color: '#6B7280',
            '&:hover': { borderColor: '#4B5563', backgroundColor: '#F9FAFB' },
            textTransform: 'none',
            fontWeight: 500,
          }}
        >
          Close
        </Button>
        <Button
          onClick={onRetry}
          variant="contained"
          startIcon={<Refresh />}
          sx={{
            backgroundColor: '#10B981',
            '&:hover': { backgroundColor: '#059669' },
            textTransform: 'none',
            fontWeight: 500,
          }}
        >
          Retry Installation
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ErrorRecoveryModal;
