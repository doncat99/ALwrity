export interface OllamaError {
  code: string;
  message: string;
  details?: string;
  suggestions: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'network' | 'permission' | 'installation' | 'service' | 'validation' | 'unknown';
  retryable: boolean;
  timestamp: Date;
}

export interface ErrorRecoveryAction {
  id: string;
  label: string;
  description: string;
  action: () => Promise<boolean>;
  requiresUserAction: boolean;
}

export class OllamaErrorHandler {
  private static instance: OllamaErrorHandler;

  private constructor() {}

  public static getInstance(): OllamaErrorHandler {
    if (!OllamaErrorHandler.instance) {
      OllamaErrorHandler.instance = new OllamaErrorHandler();
    }
    return OllamaErrorHandler.instance;
  }

  /**
   * Parse and categorize errors from various sources
   */
  public parseError(error: any, context?: string): OllamaError {
    const timestamp = new Date();
    
    // Network errors
    if (error.message?.includes('fetch') || error.message?.includes('network')) {
      return {
        code: 'NETWORK_ERROR',
        message: 'Network connection failed',
        details: error.message,
        suggestions: [
          'Check your internet connection',
          'Verify firewall settings allow local connections',
          'Try again in a few moments'
        ],
        severity: 'medium',
        category: 'network',
        retryable: true,
        timestamp
      };
    }

    // Permission errors
    if (error.message?.includes('permission') || error.message?.includes('access denied')) {
      return {
        code: 'PERMISSION_ERROR',
        message: 'Insufficient permissions',
        details: error.message,
        suggestions: [
          'Run as Administrator (Windows) or with sudo (macOS/Linux)',
          'Check file system permissions',
          'Ensure antivirus software allows the installation'
        ],
        severity: 'high',
        category: 'permission',
        retryable: true,
        timestamp
      };
    }

    // Installation errors
    if (error.message?.includes('install') || error.message?.includes('download')) {
      return {
        code: 'INSTALLATION_ERROR',
        message: 'Installation failed',
        details: error.message,
        suggestions: [
          'Check available disk space (minimum 10GB)',
          'Close other applications that might interfere',
          'Try downloading the installer manually from ollama.com'
        ],
        severity: 'high',
        category: 'installation',
        retryable: true,
        timestamp
      };
    }

    // Service errors
    if (error.message?.includes('service') || error.message?.includes('port')) {
      return {
        code: 'SERVICE_ERROR',
        message: 'OLLAMA service error',
        details: error.message,
        suggestions: [
          'Restart OLLAMA service',
          'Check if port 11434 is available',
          'Verify OLLAMA is properly installed'
        ],
        severity: 'medium',
        category: 'service',
        retryable: true,
        timestamp
      };
    }

    // Validation errors
    if (error.message?.includes('validation') || error.message?.includes('verify')) {
      return {
        code: 'VALIDATION_ERROR',
        message: 'Installation validation failed',
        details: error.message,
        suggestions: [
          'Reinstall OLLAMA',
          'Check system requirements',
          'Verify installation integrity'
        ],
        severity: 'medium',
        category: 'validation',
        retryable: true,
        timestamp
      };
    }

    // Timeout errors
    if (error.message?.includes('timeout')) {
      return {
        code: 'TIMEOUT_ERROR',
        message: 'Operation timed out',
        details: error.message,
        suggestions: [
          'Check your internet connection speed',
          'Try again with a faster connection',
          'Installation may still be in progress'
        ],
        severity: 'medium',
        category: 'network',
        retryable: true,
        timestamp
      };
    }

    // Default/unknown error
    return {
      code: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred',
      details: error.message || 'No details available',
      suggestions: [
        'Try restarting the application',
        'Check system logs for more information',
        'Contact support if the problem persists'
      ],
      severity: 'high',
      category: 'unknown',
      retryable: true,
      timestamp
    };
  }

  /**
   * Get recovery actions for an error
   */
  public getRecoveryActions(error: OllamaError): ErrorRecoveryAction[] {
    const actions: ErrorRecoveryAction[] = [];

    switch (error.code) {
      case 'NETWORK_ERROR':
        actions.push(
          {
            id: 'retry_connection',
            label: 'Retry Connection',
            description: 'Attempt to reconnect and continue installation',
            action: async () => {
              // This would trigger a retry in the installation process
              return true;
            },
            requiresUserAction: false
          },
          {
            id: 'manual_download',
            label: 'Manual Download',
            description: 'Download installer manually from ollama.com',
            action: async () => {
              window.open('https://ollama.com/download', '_blank');
              return true;
            },
            requiresUserAction: true
          }
        );
        break;

      case 'PERMISSION_ERROR':
        actions.push(
          {
            id: 'run_as_admin',
            label: 'Run as Administrator',
            description: 'Restart the application with elevated privileges',
            action: async () => {
              // This would guide the user to restart as admin
              return true;
            },
            requiresUserAction: true
          },
          {
            id: 'check_permissions',
            label: 'Check Permissions',
            description: 'Verify file system permissions',
            action: async () => {
              // This would check and display permission issues
              return true;
            },
            requiresUserAction: false
          }
        );
        break;

      case 'INSTALLATION_ERROR':
        actions.push(
          {
            id: 'retry_installation',
            label: 'Retry Installation',
            description: 'Attempt installation again',
            action: async () => {
              return true;
            },
            requiresUserAction: false
          },
          {
            id: 'check_space',
            label: 'Check Disk Space',
            description: 'Verify sufficient disk space is available',
            action: async () => {
              // This would check disk space
              return true;
            },
            requiresUserAction: false
          }
        );
        break;

      case 'SERVICE_ERROR':
        actions.push(
          {
            id: 'restart_service',
            label: 'Restart Service',
            description: 'Restart the OLLAMA service',
            action: async () => {
              return true;
            },
            requiresUserAction: false
          },
          {
            id: 'check_port',
            label: 'Check Port Availability',
            description: 'Verify port 11434 is not in use',
            action: async () => {
              return true;
            },
            requiresUserAction: false
          }
        );
        break;

      case 'VALIDATION_ERROR':
        actions.push(
          {
            id: 'reinstall',
            label: 'Reinstall OLLAMA',
            description: 'Perform a fresh installation',
            action: async () => {
              return true;
            },
            requiresUserAction: false
          },
          {
            id: 'verify_installation',
            label: 'Verify Installation',
            description: 'Check installation integrity',
            action: async () => {
              return true;
            },
            requiresUserAction: false
          }
        );
        break;

      case 'TIMEOUT_ERROR':
        actions.push(
          {
            id: 'retry_with_timeout',
            label: 'Retry with Extended Timeout',
            description: 'Retry the operation with a longer timeout',
            action: async () => {
              return true;
            },
            requiresUserAction: false
          },
          {
            id: 'check_connection',
            label: 'Check Connection',
            description: 'Verify internet connection stability',
            action: async () => {
              return true;
            },
            requiresUserAction: false
          }
        );
        break;

      default:
        actions.push(
          {
            id: 'retry_operation',
            label: 'Retry Operation',
            description: 'Attempt the operation again',
            action: async () => {
              return true;
            },
            requiresUserAction: false
          },
          {
            id: 'restart_application',
            label: 'Restart Application',
            description: 'Restart the application and try again',
            action: async () => {
              return true;
            },
            requiresUserAction: true
          }
        );
    }

    return actions;
  }

  /**
   * Get user-friendly error message
   */
  public getUserFriendlyMessage(error: OllamaError): string {
    switch (error.code) {
      case 'NETWORK_ERROR':
        return 'We couldn\'t connect to download OLLAMA. Please check your internet connection and try again.';
      case 'PERMISSION_ERROR':
        return 'We need additional permissions to install OLLAMA. Please run the application as Administrator (Windows) or with sudo (macOS/Linux).';
      case 'INSTALLATION_ERROR':
        return 'The OLLAMA installation failed. This might be due to insufficient disk space or interference from other applications.';
      case 'SERVICE_ERROR':
        return 'OLLAMA service is having trouble starting. This could be due to port conflicts or service issues.';
      case 'VALIDATION_ERROR':
        return 'We couldn\'t verify that OLLAMA was installed correctly. The installation may be incomplete.';
      case 'TIMEOUT_ERROR':
        return 'The installation is taking longer than expected. This might be due to a slow internet connection.';
      default:
        return 'Something went wrong during the Privacy Mode setup. Don\'t worry, we can help you resolve this.';
    }
  }

  /**
   * Get error severity color
   */
  public getSeverityColor(severity: OllamaError['severity']): string {
    switch (severity) {
      case 'low': return '#6B7280';
      case 'medium': return '#F59E0B';
      case 'high': return '#EF4444';
      case 'critical': return '#DC2626';
      default: return '#6B7280';
    }
  }

  /**
   * Get error severity icon
   */
  public getSeverityIcon(severity: OllamaError['severity']): string {
    switch (severity) {
      case 'low': return 'ℹ️';
      case 'medium': return '⚠️';
      case 'high': return '❌';
      case 'critical': return '🚨';
      default: return '❓';
    }
  }

  /**
   * Check if error is recoverable
   */
  public isRecoverable(error: OllamaError): boolean {
    return error.retryable && error.severity !== 'critical';
  }

  /**
   * Get troubleshooting steps for an error
   */
  public getTroubleshootingSteps(error: OllamaError): string[] {
    const baseSteps = [
      'Make sure you have a stable internet connection',
      'Close other applications that might interfere',
      'Check if your antivirus software is blocking the installation'
    ];

    switch (error.code) {
      case 'PERMISSION_ERROR':
        return [
          ...baseSteps,
          'Right-click the application and select "Run as administrator" (Windows)',
          'Use sudo command when starting the application (macOS/Linux)',
          'Check if User Account Control (UAC) is blocking the installation'
        ];

      case 'NETWORK_ERROR':
        return [
          ...baseSteps,
          'Try using a different network connection',
          'Check if your firewall is blocking the connection',
          'Verify that port 11434 is not blocked by your router'
        ];

      case 'INSTALLATION_ERROR':
        return [
          ...baseSteps,
          'Ensure you have at least 10GB of free disk space',
          'Try running the installation in safe mode',
          'Download the installer manually from ollama.com'
        ];

      case 'SERVICE_ERROR':
        return [
          ...baseSteps,
          'Restart your computer and try again',
          'Check if another application is using port 11434',
          'Verify OLLAMA service is not already running'
        ];

      default:
        return baseSteps;
    }
  }
}

// Convenience functions
export const parseError = (error: any, context?: string): OllamaError => {
  return OllamaErrorHandler.getInstance().parseError(error, context);
};

export const getRecoveryActions = (error: OllamaError): ErrorRecoveryAction[] => {
  return OllamaErrorHandler.getInstance().getRecoveryActions(error);
};

export const getUserFriendlyMessage = (error: OllamaError): string => {
  return OllamaErrorHandler.getInstance().getUserFriendlyMessage(error);
};

export const getSeverityColor = (severity: OllamaError['severity']): string => {
  return OllamaErrorHandler.getInstance().getSeverityColor(severity);
};

export const getSeverityIcon = (severity: OllamaError['severity']): string => {
  return OllamaErrorHandler.getInstance().getSeverityIcon(severity);
};

export const isRecoverable = (error: OllamaError): boolean => {
  return OllamaErrorHandler.getInstance().isRecoverable(error);
};

export const getTroubleshootingSteps = (error: OllamaError): string[] => {
  return OllamaErrorHandler.getInstance().getTroubleshootingSteps(error);
};
