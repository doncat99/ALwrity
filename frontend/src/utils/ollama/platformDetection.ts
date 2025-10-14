export type Platform = 'windows' | 'macos' | 'linux' | 'unknown';
export type Architecture = 'x64' | 'arm64' | 'unknown';

export interface SystemInfo {
  platform: Platform;
  architecture: Architecture;
  userAgent: string;
  isSupported: boolean;
  requirements: {
    minRam: string;
    minStorage: string;
    minCpu: string;
  };
}

export class PlatformDetector {
  private static instance: PlatformDetector;
  private systemInfo: SystemInfo | null = null;

  private constructor() {}

  public static getInstance(): PlatformDetector {
    if (!PlatformDetector.instance) {
      PlatformDetector.instance = new PlatformDetector();
    }
    return PlatformDetector.instance;
  }

  public detectPlatform(): SystemInfo {
    if (this.systemInfo) {
      return this.systemInfo;
    }

    const userAgent = navigator.userAgent.toLowerCase();
    let platform: Platform = 'unknown';
    let architecture: Architecture = 'unknown';
    let isSupported = false;

    // Detect platform
    if (userAgent.includes('win')) {
      platform = 'windows';
    } else if (userAgent.includes('mac')) {
      platform = 'macos';
    } else if (userAgent.includes('linux') || userAgent.includes('x11')) {
      platform = 'linux';
    }

    // Detect architecture (limited in browser environment)
    if (navigator.userAgent.includes('x64') || navigator.userAgent.includes('wow64')) {
      architecture = 'x64';
    } else if (navigator.userAgent.includes('arm')) {
      architecture = 'arm64';
    } else {
      // Default to x64 for most modern systems
      architecture = 'x64';
    }

    // Check if platform is supported
    isSupported = platform !== 'unknown';

    // Get platform-specific requirements
    const requirements = this.getPlatformRequirements(platform);

    this.systemInfo = {
      platform,
      architecture,
      userAgent: navigator.userAgent,
      isSupported,
      requirements,
    };

    return this.systemInfo;
  }

  private getPlatformRequirements(platform: Platform) {
    switch (platform) {
      case 'windows':
        return {
          minRam: '8GB (16GB recommended)',
          minStorage: '10GB free space',
          minCpu: '64-bit processor (Intel/AMD)',
        };
      case 'macos':
        return {
          minRam: '8GB (16GB recommended)',
          minStorage: '10GB free space',
          minCpu: 'Apple Silicon (M1/M2) or Intel x64',
        };
      case 'linux':
        return {
          minRam: '8GB (16GB recommended)',
          minStorage: '10GB free space',
          minCpu: '64-bit processor',
        };
      default:
        return {
          minRam: '8GB (16GB recommended)',
          minStorage: '10GB free space',
          minCpu: '64-bit processor',
        };
    }
  }

  public getInstallationInstructions(platform: Platform): string[] {
    switch (platform) {
      case 'windows':
        return [
          'Download the OLLAMA installer from the official website',
          'Run the installer as Administrator',
          'Follow the installation wizard',
          'OLLAMA will start automatically after installation',
          'Open Command Prompt and run "ollama --version" to verify',
        ];
      case 'macos':
        return [
          'Install using Homebrew: brew install ollama',
          'Or download the installer from the official website',
          'Move OLLAMA to your Applications folder',
          'Open Terminal and run "ollama --version" to verify',
          'OLLAMA will start automatically on first use',
        ];
      case 'linux':
        return [
          'Open Terminal and run: curl -fsSL https://ollama.com/install.sh | sh',
          'The script will install OLLAMA and its dependencies',
          'Start OLLAMA service: systemctl --user start ollama',
          'Enable auto-start: systemctl --user enable ollama',
          'Run "ollama --version" to verify installation',
        ];
      default:
        return [
          'Please visit https://ollama.com for installation instructions',
          'Select your operating system for specific guidance',
        ];
    }
  }

  public getDownloadUrl(platform: Platform): string {
    switch (platform) {
      case 'windows':
        return 'https://ollama.com/download/windows';
      case 'macos':
        return 'https://ollama.com/download/mac';
      case 'linux':
        return 'https://ollama.com/download/linux';
      default:
        return 'https://ollama.com/download';
    }
  }

  public getPlatformDisplayName(platform: Platform): string {
    switch (platform) {
      case 'windows':
        return 'Windows';
      case 'macos':
        return 'macOS';
      case 'linux':
        return 'Linux';
      default:
        return 'Unknown Platform';
    }
  }

  public getPlatformIcon(platform: Platform): string {
    switch (platform) {
      case 'windows':
        return '🪟';
      case 'macos':
        return '🍎';
      case 'linux':
        return '🐧';
      default:
        return '💻';
    }
  }

  public isPlatformSupported(platform: Platform): boolean {
    return platform !== 'unknown';
  }

  public getSystemInfo(): SystemInfo | null {
    return this.systemInfo;
  }

  public reset(): void {
    this.systemInfo = null;
  }
}

// Convenience functions
export const detectPlatform = (): SystemInfo => {
  return PlatformDetector.getInstance().detectPlatform();
};

export const getPlatformDisplayName = (platform: Platform): string => {
  return PlatformDetector.getInstance().getPlatformDisplayName(platform);
};

export const getPlatformIcon = (platform: Platform): string => {
  return PlatformDetector.getInstance().getPlatformIcon(platform);
};

export const getInstallationInstructions = (platform: Platform): string[] => {
  return PlatformDetector.getInstance().getInstallationInstructions(platform);
};

export const getDownloadUrl = (platform: Platform): string => {
  return PlatformDetector.getInstance().getDownloadUrl(platform);
};

export const isPlatformSupported = (platform: Platform): boolean => {
  return PlatformDetector.getInstance().isPlatformSupported(platform);
};
