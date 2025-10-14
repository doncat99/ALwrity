import { InstallationStep } from '../../components/PrivacyMode';
import { ollamaApi } from '../../api/ollama';

export type Platform = 'windows' | 'macos' | 'linux' | 'unknown';

export interface InstallationConfig {
  platform: Platform;
  steps: InstallationStep[];
  downloadUrl?: string;
  installCommand?: string;
  verifyCommand?: string;
}

export class OllamaInstallationManager {
  private platform: Platform;
  private steps: InstallationStep[] = [];
  private currentStepIndex = 0;

  constructor(platform: Platform) {
    this.platform = platform;
    this.initializeSteps();
  }

  private initializeSteps(): void {
    const baseSteps: InstallationStep[] = [
      {
        id: 'detect-platform',
        label: 'Detecting Platform',
        description: 'Identifying your operating system and architecture',
        status: 'completed',
      },
      {
        id: 'download-installer',
        label: 'Downloading OLLAMA',
        description: 'Downloading the OLLAMA installer for your platform',
        status: 'pending',
      },
      {
        id: 'install-ollama',
        label: 'Installing OLLAMA',
        description: 'Installing OLLAMA on your system',
        status: 'pending',
      },
      {
        id: 'start-service',
        label: 'Starting OLLAMA Service',
        description: 'Starting the OLLAMA service locally',
        status: 'pending',
      },
      {
        id: 'verify-installation',
        label: 'Verifying Installation',
        description: 'Verifying that OLLAMA is running correctly',
        status: 'pending',
      },
    ];

    this.steps = baseSteps;
  }

  public getInstallationConfig(): InstallationConfig {
    const config: InstallationConfig = {
      platform: this.platform,
      steps: this.steps,
    };

    switch (this.platform) {
      case 'windows':
        config.downloadUrl = 'https://ollama.com/download/windows';
        config.installCommand = 'ollama-windows-amd64.exe /S';
        config.verifyCommand = 'ollama --version';
        break;
      case 'macos':
        config.downloadUrl = 'https://ollama.com/download/mac';
        config.installCommand = 'brew install ollama || curl -fsSL https://ollama.com/install.sh | sh';
        config.verifyCommand = 'ollama --version';
        break;
      case 'linux':
        config.downloadUrl = 'https://ollama.com/download/linux';
        config.installCommand = 'curl -fsSL https://ollama.com/install.sh | sh';
        config.verifyCommand = 'ollama --version';
        break;
    }

    return config;
  }

  public async executeInstallation(
    onStepUpdate: (stepIndex: number, step: InstallationStep) => void,
    onProgress: (progress: number) => void,
    onError: (error: string) => void
  ): Promise<boolean> {
    try {
      // Step 1: Platform detection (already completed)
      await this.updateStep(0, { status: 'completed' });
      onStepUpdate(0, this.steps[0]);
      onProgress(20);

      // Step 2: Download installer
      await this.updateStep(1, { status: 'in-progress', progress: 0 });
      onStepUpdate(1, this.steps[1]);
      
      const downloadSuccess = await this.downloadInstaller();
      if (!downloadSuccess) {
        throw new Error('Failed to download OLLAMA installer');
      }
      
      await this.updateStep(1, { status: 'completed' });
      onStepUpdate(1, this.steps[1]);
      onProgress(40);

      // Step 3: Install OLLAMA
      await this.updateStep(2, { status: 'in-progress', progress: 0 });
      onStepUpdate(2, this.steps[2]);
      
      const installSuccess = await this.installOllama();
      if (!installSuccess) {
        throw new Error('Failed to install OLLAMA');
      }
      
      await this.updateStep(2, { status: 'completed' });
      onStepUpdate(2, this.steps[2]);
      onProgress(60);

      // Step 4: Start service
      await this.updateStep(3, { status: 'in-progress', progress: 0 });
      onStepUpdate(3, this.steps[3]);
      
      const startSuccess = await this.startOllamaService();
      if (!startSuccess) {
        throw new Error('Failed to start OLLAMA service');
      }
      
      await this.updateStep(3, { status: 'completed' });
      onStepUpdate(3, this.steps[3]);
      onProgress(80);

      // Step 5: Verify installation
      await this.updateStep(4, { status: 'in-progress', progress: 0 });
      onStepUpdate(4, this.steps[4]);
      
      const verifySuccess = await this.verifyInstallation();
      if (!verifySuccess) {
        throw new Error('OLLAMA installation verification failed');
      }
      
      await this.updateStep(4, { status: 'completed' });
      onStepUpdate(4, this.steps[4]);
      onProgress(100);

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown installation error';
      await this.updateStep(this.currentStepIndex, { 
        status: 'error', 
        error: errorMessage 
      });
      onStepUpdate(this.currentStepIndex, this.steps[this.currentStepIndex]);
      onError(errorMessage);
      return false;
    }
  }

  private async updateStep(stepIndex: number, updates: Partial<InstallationStep>): Promise<void> {
    if (stepIndex >= 0 && stepIndex < this.steps.length) {
      this.steps[stepIndex] = { ...this.steps[stepIndex], ...updates };
      this.currentStepIndex = stepIndex;
    }
  }

  private async downloadInstaller(): Promise<boolean> {
    try {
      // Simulate download progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await this.updateStep(1, { progress });
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // The backend handles the actual download and installation
      // We just need to trigger the installation process
      return true;
    } catch (error) {
      console.error('Download installer error:', error);
      return false;
    }
  }

  private async installOllama(): Promise<boolean> {
    try {
      // Simulate installation progress
      for (let progress = 0; progress <= 100; progress += 15) {
        await this.updateStep(2, { progress });
        await new Promise(resolve => setTimeout(resolve, 150));
      }
      
      // Call the backend to install OLLAMA
      const result = await ollamaApi.install(false);
      
      if (!result.success) {
        throw new Error(result.error || 'Installation failed');
      }
      
      return true;
    } catch (error) {
      console.error('Install OLLAMA error:', error);
      return false;
    }
  }

  private async startOllamaService(): Promise<boolean> {
    try {
      // Simulate service startup
      for (let progress = 0; progress <= 100; progress += 20) {
        await this.updateStep(3, { progress });
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Call the backend to start OLLAMA service
      const result = await ollamaApi.startService();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to start OLLAMA service');
      }
      
      return true;
    } catch (error) {
      console.error('Start OLLAMA service error:', error);
      return false;
    }
  }

  private async verifyInstallation(): Promise<boolean> {
    try {
      // Simulate verification
      for (let progress = 0; progress <= 100; progress += 25) {
        await this.updateStep(4, { progress });
        await new Promise(resolve => setTimeout(resolve, 80));
      }
      
      // Call the backend to verify installation
      const status = await ollamaApi.getStatus();
      
      if (!status.installation.installed || !status.installation.running) {
        throw new Error('OLLAMA installation verification failed');
      }
      
      return true;
    } catch (error) {
      console.error('Verify installation error:', error);
      return false;
    }
  }

  public getCurrentStep(): number {
    return this.currentStepIndex;
  }

  public getSteps(): InstallationStep[] {
    return [...this.steps];
  }

  public getOverallProgress(): number {
    const completedSteps = this.steps.filter(step => step.status === 'completed').length;
    const inProgressStep = this.steps.find(step => step.status === 'in-progress');
    
    let progress = (completedSteps / this.steps.length) * 100;
    
    if (inProgressStep && inProgressStep.progress !== undefined) {
      progress += (inProgressStep.progress / this.steps.length);
    }
    
    return Math.min(progress, 100);
  }
}

export const createInstallationManager = (platform: Platform): OllamaInstallationManager => {
  return new OllamaInstallationManager(platform);
};
