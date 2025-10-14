import { ollamaApi } from '../../api/ollama';

export interface OllamaStatus {
  isInstalled: boolean;
  isRunning: boolean;
  version?: string;
  port: number;
  error?: string;
}

export interface OllamaModel {
  name: string;
  size: string;
  modifiedAt: string;
  digest: string;
}

export class OllamaValidator {
  private static readonly DEFAULT_PORT = 11434;
  private static readonly API_BASE_URL = `http://localhost:${OllamaValidator.DEFAULT_PORT}`;

  /**
   * Check if OLLAMA is installed and running
   */
  public static async checkOllamaStatus(): Promise<OllamaStatus> {
    try {
      // Use backend API to check OLLAMA status
      const status = await ollamaApi.getStatus();
      
      return {
        isInstalled: status.installation.installed,
        isRunning: status.installation.running,
        version: status.installation.version,
        port: status.installation.port,
        error: status.installation.errors.install || status.installation.errors.running,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      return {
        isInstalled: false,
        isRunning: false,
        port: OllamaValidator.DEFAULT_PORT,
        error: `Backend check failed: ${errorMessage}`,
      };
    }
  }

  /**
   * Get list of available models
   */
  public static async getAvailableModels(): Promise<OllamaModel[]> {
    try {
      const response = await ollamaApi.getAvailableModels();
      return response.models.map(model => ({
        name: model.name,
        size: model.size,
        modifiedAt: model.modifiedAt,
        digest: model.digest,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Cannot fetch models: ${errorMessage}`);
    }
  }

  /**
   * Pull a model (download it)
   */
  public static async pullModel(modelName: string): Promise<boolean> {
    try {
      const result = await ollamaApi.pullModel(modelName);
      return result.success;
    } catch (error) {
      console.error('Failed to pull model:', error);
      return false;
    }
  }

  /**
   * Test if a model can generate text
   */
  public static async testModel(modelName: string): Promise<boolean> {
    try {
      const response = await fetch(`${OllamaValidator.API_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelName,
          prompt: 'Hello, world!',
          stream: false,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return !!data.response;
      }
      return false;
    } catch (error) {
      console.error('Failed to test model:', error);
      return false;
    }
  }

  /**
   * Get recommended models for different use cases
   */
  public static getRecommendedModels(): Array<{
    name: string;
    description: string;
    size: string;
    useCase: string;
  }> {
    return [
      {
        name: 'llama3.2:3b',
        description: 'Fast and efficient model for general tasks',
        size: '~2GB',
        useCase: 'General purpose, fast responses',
      },
      {
        name: 'llama3.2:1b',
        description: 'Ultra-lightweight model for basic tasks',
        size: '~1GB',
        useCase: 'Basic tasks, low resource usage',
      },
      {
        name: 'llama3.1:8b',
        description: 'Balanced model with good performance',
        size: '~4.7GB',
        useCase: 'Balanced performance and resource usage',
      },
      {
        name: 'codellama:7b',
        description: 'Specialized for code generation and analysis',
        size: '~3.8GB',
        useCase: 'Code generation, programming assistance',
      },
      {
        name: 'mistral:7b',
        description: 'High-quality general purpose model',
        size: '~4.1GB',
        useCase: 'High-quality text generation',
      },
    ];
  }

  /**
   * Validate system requirements
   */
  public static async validateSystemRequirements(): Promise<{
    isValid: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check available memory (approximate)
    if ('memory' in navigator) {
      const memory = (navigator as any).memory;
      if (memory && memory.jsHeapSizeLimit) {
        const availableMemory = memory.jsHeapSizeLimit / (1024 * 1024 * 1024); // GB
        if (availableMemory < 4) {
          issues.push('Low available memory detected');
          recommendations.push('Consider closing other applications');
        }
      }
    }

    // Check if we're in a secure context
    if (!window.isSecureContext) {
      issues.push('Not running in a secure context');
      recommendations.push('Use HTTPS or localhost for full functionality');
    }

    // Check browser compatibility
    if (!window.fetch) {
      issues.push('Browser does not support Fetch API');
      recommendations.push('Update your browser to a modern version');
    }

    return {
      isValid: issues.length === 0,
      issues,
      recommendations,
    };
  }

  /**
   * Get installation troubleshooting tips
   */
  public static getTroubleshootingTips(): Array<{
    issue: string;
    solution: string;
  }> {
    return [
      {
        issue: 'OLLAMA is not starting',
        solution: 'Check if port 11434 is available and restart the service',
      },
      {
        issue: 'Cannot connect to OLLAMA API',
        solution: 'Ensure OLLAMA service is running and firewall allows local connections',
      },
      {
        issue: 'Installation failed',
        solution: 'Run installer as Administrator (Windows) or with sudo (Linux/macOS)',
      },
      {
        issue: 'Out of memory errors',
        solution: 'Close other applications or use a smaller model',
      },
      {
        issue: 'Model download failed',
        solution: 'Check internet connection and try again',
      },
    ];
  }
}

// Convenience functions
export const checkOllamaStatus = (): Promise<OllamaStatus> => {
  return OllamaValidator.checkOllamaStatus();
};

export const getAvailableModels = (): Promise<OllamaModel[]> => {
  return OllamaValidator.getAvailableModels();
};

export const validateSystemRequirements = (): Promise<{
  isValid: boolean;
  issues: string[];
  recommendations: string[];
}> => {
  return OllamaValidator.validateSystemRequirements();
};
