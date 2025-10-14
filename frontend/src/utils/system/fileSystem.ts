export interface FileInfo {
  name: string;
  path: string;
  size: number;
  isDirectory: boolean;
  lastModified: Date;
  permissions?: string;
}

export interface DirectoryInfo {
  path: string;
  exists: boolean;
  isWritable: boolean;
  files: FileInfo[];
  subdirectories: string[];
}

export class FileSystemManager {
  private static instance: FileSystemManager;

  private constructor() {}

  public static getInstance(): FileSystemManager {
    if (!FileSystemManager.instance) {
      FileSystemManager.instance = new FileSystemManager();
    }
    return FileSystemManager.instance;
  }

  /**
   * Check if a directory exists
   */
  public async directoryExists(path: string): Promise<boolean> {
    try {
      const response = await fetch('/api/filesystem/exists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path, type: 'directory' }),
      });

      if (response.ok) {
        const result = await response.json();
        return result.exists;
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Check if a file exists
   */
  public async fileExists(path: string): Promise<boolean> {
    try {
      const response = await fetch('/api/filesystem/exists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path, type: 'file' }),
      });

      if (response.ok) {
        const result = await response.json();
        return result.exists;
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Create a directory
   */
  public async createDirectory(path: string): Promise<boolean> {
    try {
      const response = await fetch('/api/filesystem/create-directory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path }),
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Read directory contents
   */
  public async readDirectory(path: string): Promise<DirectoryInfo | null> {
    try {
      const response = await fetch('/api/filesystem/read-directory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path }),
      });

      if (response.ok) {
        const result = await response.json();
        return result;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Write a file
   */
  public async writeFile(path: string, content: string): Promise<boolean> {
    try {
      const response = await fetch('/api/filesystem/write-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path, content }),
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Read a file
   */
  public async readFile(path: string): Promise<string | null> {
    try {
      const response = await fetch('/api/filesystem/read-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path }),
      });

      if (response.ok) {
        const result = await response.json();
        return result.content;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Delete a file or directory
   */
  public async deletePath(path: string): Promise<boolean> {
    try {
      const response = await fetch('/api/filesystem/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path }),
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get file information
   */
  public async getFileInfo(path: string): Promise<FileInfo | null> {
    try {
      const response = await fetch('/api/filesystem/file-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path }),
      });

      if (response.ok) {
        const result = await response.json();
        return result;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Check if a path is writable
   */
  public async isWritable(path: string): Promise<boolean> {
    try {
      const response = await fetch('/api/filesystem/is-writable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path }),
      });

      if (response.ok) {
        const result = await response.json();
        return result.writable;
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Get system-specific paths
   */
  public getSystemPaths(): Record<string, string> {
    // These would be determined by the backend based on the actual system
    return {
      home: '/home/user', // Linux/macOS
      temp: '/tmp',
      applications: '/Applications', // macOS
      programFiles: 'C:\\Program Files', // Windows
      userProfile: 'C:\\Users\\User', // Windows
    };
  }

  /**
   * Get OLLAMA-specific paths
   */
  public getOllamaPaths(): Record<string, string> {
    return {
      config: '.ollama',
      models: '.ollama/models',
      logs: '.ollama/logs',
      cache: '.ollama/cache',
    };
  }

  /**
   * Validate installation paths
   */
  public async validateInstallationPaths(): Promise<{
    isValid: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    const paths = this.getOllamaPaths();

    for (const [name, path] of Object.entries(paths)) {
      const exists = await this.directoryExists(path);
      const writable = await this.isWritable(path);

      if (!exists) {
        issues.push(`${name} directory does not exist: ${path}`);
        recommendations.push(`Create directory: ${path}`);
      }

      if (!writable) {
        issues.push(`${name} directory is not writable: ${path}`);
        recommendations.push(`Fix permissions for: ${path}`);
      }
    }

    return {
      isValid: issues.length === 0,
      issues,
      recommendations,
    };
  }
}

// Convenience functions
export const directoryExists = (path: string): Promise<boolean> => {
  return FileSystemManager.getInstance().directoryExists(path);
};

export const fileExists = (path: string): Promise<boolean> => {
  return FileSystemManager.getInstance().fileExists(path);
};

export const createDirectory = (path: string): Promise<boolean> => {
  return FileSystemManager.getInstance().createDirectory(path);
};

export const readDirectory = (path: string): Promise<DirectoryInfo | null> => {
  return FileSystemManager.getInstance().readDirectory(path);
};

export const writeFile = (path: string, content: string): Promise<boolean> => {
  return FileSystemManager.getInstance().writeFile(path, content);
};

export const readFile = (path: string): Promise<string | null> => {
  return FileSystemManager.getInstance().readFile(path);
};

export const deletePath = (path: string): Promise<boolean> => {
  return FileSystemManager.getInstance().deletePath(path);
};

export const getFileInfo = (path: string): Promise<FileInfo | null> => {
  return FileSystemManager.getInstance().getFileInfo(path);
};

export const isWritable = (path: string): Promise<boolean> => {
  return FileSystemManager.getInstance().isWritable(path);
};

export const validateInstallationPaths = (): Promise<{
  isValid: boolean;
  issues: string[];
  recommendations: string[];
}> => {
  return FileSystemManager.getInstance().validateInstallationPaths();
};
