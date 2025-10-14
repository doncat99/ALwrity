import { apiClient, ollamaInstallClient } from './client';

export interface OllamaStatus {
  installation: {
    platform: string;
    architecture: string;
    installed: boolean;
    running: boolean;
    version?: string;
    path?: string;
    port: number;
    api_responding: boolean;
    errors: {
      install?: string;
      running?: string;
    };
  };
  validation: {
    overall_status: string;
    checks: Record<string, any>;
    summary: Record<string, any>;
    recommendations: string[];
  };
  timestamp: string;
}

export interface InstallationResponse {
  success: boolean;
  message: string;
  version?: string;
  already_installed?: boolean;
  service_started?: boolean;
  verification_passed?: boolean;
  error?: string;
}

export interface PlatformInfo {
  system: Record<string, any>;
  ollama_paths: Record<string, string>;
  requirements: Record<string, any>;
  installation_method: Record<string, any>;
  service_management: Record<string, any>;
}

export interface SystemRequirements {
  meets_requirements: boolean;
  checks: Record<string, any>;
  recommendations: string[];
}

export interface OllamaModel {
  name: string;
  size: string;
  modifiedAt: string;
  digest: string;
}

export interface ModelsResponse {
  models: OllamaModel[];
  model_count: number;
}

export interface RecommendedModel {
  name: string;
  description: string;
  size: string;
  use_case: string;
  download_command: string;
}

export interface RecommendedModelsResponse {
  recommended_models: RecommendedModel[];
  total_count: number;
}

// OLLAMA API functions
export const ollamaApi = {
  // Get comprehensive OLLAMA status
  async getStatus(): Promise<OllamaStatus> {
    const response = await apiClient.get('/api/ollama/status');
    return response.data;
  },

  // Install OLLAMA
  async install(forceReinstall: boolean = false): Promise<InstallationResponse> {
    const response = await ollamaInstallClient.post('/api/ollama/install', {
      force_reinstall: forceReinstall,
    });
    return response.data;
  },

  // Get platform information
  async getPlatformInfo(): Promise<PlatformInfo> {
    const response = await apiClient.get('/api/ollama/platform');
    return response.data;
  },

  // Check system requirements
  async checkSystemRequirements(): Promise<SystemRequirements> {
    const response = await apiClient.get('/api/ollama/requirements');
    return response.data;
  },

  // Validate installation
  async validateInstallation(): Promise<any> {
    const response = await apiClient.post('/api/ollama/validate');
    return response.data;
  },

  // Get available models
  async getAvailableModels(): Promise<ModelsResponse> {
    const response = await apiClient.get('/api/ollama/models');
    return response.data;
  },

  // Pull a model
  async pullModel(modelName: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post('/api/ollama/models/pull', {
      model_name: modelName,
    });
    return response.data;
  },

  // Start OLLAMA service
  async startService(): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post('/api/ollama/service/start');
    return response.data;
  },

  // Stop OLLAMA service
  async stopService(): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post('/api/ollama/service/stop');
    return response.data;
  },

  // Get service status
  async getServiceStatus(): Promise<any> {
    const response = await apiClient.get('/api/ollama/service/status');
    return response.data;
  },

  // Health check
  async healthCheck(): Promise<{ status: string; message: string; version?: string; error?: string }> {
    const response = await apiClient.get('/api/ollama/health');
    return response.data;
  },

  // Get recommended models
  async getRecommendedModels(): Promise<RecommendedModelsResponse> {
    const response = await apiClient.get('/api/ollama/recommended-models');
    return response.data;
  },
};

export default ollamaApi;
