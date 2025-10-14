export interface ProcessResult {
  success: boolean;
  output: string;
  error?: string;
  exitCode: number;
}

export interface ProcessOptions {
  timeout?: number;
  workingDirectory?: string;
  environment?: Record<string, string>;
}

export class ProcessRunner {
  private static instance: ProcessRunner;

  private constructor() {}

  public static getInstance(): ProcessRunner {
    if (!ProcessRunner.instance) {
      ProcessRunner.instance = new ProcessRunner();
    }
    return ProcessRunner.instance;
  }

  /**
   * Execute a command and return the result
   * Note: This is a browser-compatible implementation that uses Web APIs
   * For actual process execution, this would need to be handled by the backend
   */
  public async executeCommand(
    command: string,
    args: string[] = [],
    options: ProcessOptions = {}
  ): Promise<ProcessResult> {
    try {
      // In a real implementation, this would send a request to the backend
      // to execute the command on the server side
      const response = await fetch('/api/system/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command,
          args,
          options,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        return result;
      } else {
        throw new Error(`Command execution failed: ${response.status}`);
      }
    } catch (error) {
      return {
        success: false,
        output: '',
        error: error instanceof Error ? error.message : 'Unknown error',
        exitCode: 1,
      };
    }
  }

  /**
   * Check if a command exists in the system PATH
   */
  public async commandExists(command: string): Promise<boolean> {
    try {
      const result = await this.executeCommand('which', [command]);
      return result.success && result.exitCode === 0;
    } catch {
      return false;
    }
  }

  /**
   * Get the version of a command
   */
  public async getCommandVersion(command: string): Promise<string | null> {
    try {
      const result = await this.executeCommand(command, ['--version']);
      if (result.success && result.output) {
        return result.output.trim();
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Check if a port is available
   */
  public async isPortAvailable(port: number): Promise<boolean> {
    try {
      const response = await fetch(`http://localhost:${port}`, {
        method: 'HEAD',
        mode: 'no-cors',
      });
      // If we can connect, the port is not available
      return false;
    } catch {
      // If we can't connect, the port is likely available
      return true;
    }
  }

  /**
   * Start a service
   */
  public async startService(serviceName: string): Promise<boolean> {
    try {
      const result = await this.executeCommand('systemctl', ['start', serviceName]);
      return result.success && result.exitCode === 0;
    } catch {
      return false;
    }
  }

  /**
   * Stop a service
   */
  public async stopService(serviceName: string): Promise<boolean> {
    try {
      const result = await this.executeCommand('systemctl', ['stop', serviceName]);
      return result.success && result.exitCode === 0;
    } catch {
      return false;
    }
  }

  /**
   * Check if a service is running
   */
  public async isServiceRunning(serviceName: string): Promise<boolean> {
    try {
      const result = await this.executeCommand('systemctl', ['is-active', serviceName]);
      return result.success && result.output.trim() === 'active';
    } catch {
      return false;
    }
  }

  /**
   * Enable a service to start on boot
   */
  public async enableService(serviceName: string): Promise<boolean> {
    try {
      const result = await this.executeCommand('systemctl', ['enable', serviceName]);
      return result.success && result.exitCode === 0;
    } catch {
      return false;
    }
  }

  /**
   * Disable a service from starting on boot
   */
  public async disableService(serviceName: string): Promise<boolean> {
    try {
      const result = await this.executeCommand('systemctl', ['disable', serviceName]);
      return result.success && result.exitCode === 0;
    } catch {
      return false;
    }
  }
}

// Convenience functions
export const executeCommand = (
  command: string,
  args: string[] = [],
  options: ProcessOptions = {}
): Promise<ProcessResult> => {
  return ProcessRunner.getInstance().executeCommand(command, args, options);
};

export const commandExists = (command: string): Promise<boolean> => {
  return ProcessRunner.getInstance().commandExists(command);
};

export const getCommandVersion = (command: string): Promise<string | null> => {
  return ProcessRunner.getInstance().getCommandVersion(command);
};

export const isPortAvailable = (port: number): Promise<boolean> => {
  return ProcessRunner.getInstance().isPortAvailable(port);
};

export const startService = (serviceName: string): Promise<boolean> => {
  return ProcessRunner.getInstance().startService(serviceName);
};

export const stopService = (serviceName: string): Promise<boolean> => {
  return ProcessRunner.getInstance().stopService(serviceName);
};

export const isServiceRunning = (serviceName: string): Promise<boolean> => {
  return ProcessRunner.getInstance().isServiceRunning(serviceName);
};

export const enableService = (serviceName: string): Promise<boolean> => {
  return ProcessRunner.getInstance().enableService(serviceName);
};

export const disableService = (serviceName: string): Promise<boolean> => {
  return ProcessRunner.getInstance().disableService(serviceName);
};
