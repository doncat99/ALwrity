import { useState, useCallback, useRef, useEffect } from 'react';
import { InstallationStep } from '../components/PrivacyMode';
import { Platform } from '../utils/ollama/platformDetection';
import { OllamaInstallationManager } from '../utils/ollama/installation';
import { OllamaStatus, checkOllamaStatus } from '../utils/ollama/validation';
import { OllamaError, parseError } from '../utils/ollama/errorHandling';

export interface UseOllamaInstallationReturn {
  // State
  isInstalling: boolean;
  isInstalled: boolean;
  isModalOpen: boolean;
  platform: Platform;
  steps: InstallationStep[];
  currentStep: number;
  overallProgress: number;
  error: string | null;
  parsedError: OllamaError | null;
  ollamaStatus: OllamaStatus | null;

  // Actions
  startInstallation: () => void;
  stopInstallation: () => void;
  openModal: () => void;
  closeModal: () => void;
  checkInstallationStatus: () => Promise<void>;
  retryInstallation: () => void;
}

export const useOllamaInstallation = (): UseOllamaInstallationReturn => {
  const [isInstalling, setIsInstalling] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [platform, setPlatform] = useState<Platform>('unknown');
  const [steps, setSteps] = useState<InstallationStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [parsedError, setParsedError] = useState<OllamaError | null>(null);
  const [ollamaStatus, setOllamaStatus] = useState<OllamaStatus | null>(null);

  const installationManagerRef = useRef<OllamaInstallationManager | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize platform detection
  const initializePlatform = useCallback(() => {
    // Detect platform from user agent
    const userAgent = navigator.userAgent.toLowerCase();
    let detectedPlatform: Platform = 'unknown';

    if (userAgent.includes('win')) {
      detectedPlatform = 'windows';
    } else if (userAgent.includes('mac')) {
      detectedPlatform = 'macos';
    } else if (userAgent.includes('linux') || userAgent.includes('x11')) {
      detectedPlatform = 'linux';
    }

    setPlatform(detectedPlatform);
  }, []);

  // Check if OLLAMA is already installed and running
  const checkInstallationStatus = useCallback(async (): Promise<void> => {
    try {
      const status = await checkOllamaStatus();
      setOllamaStatus(status);
      setIsInstalled(status.isInstalled && status.isRunning);
    } catch (error) {
      console.error('Failed to check OLLAMA status:', error);
      setOllamaStatus({
        isInstalled: false,
        isRunning: false,
        port: 11434,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      setIsInstalled(false);
    }
  }, []);

  // Start installation process
  const startInstallation = useCallback(async () => {
    if (isInstalling) return;

    try {
      setIsInstalling(true);
      setError(null);
      setOverallProgress(0);
      setCurrentStep(0);

      // Create installation manager
      installationManagerRef.current = new OllamaInstallationManager(platform);
      const initialSteps = installationManagerRef.current.getSteps();
      setSteps(initialSteps);

      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController();

      // Execute installation
      const success = await installationManagerRef.current.executeInstallation(
        (stepIndex: number, step: InstallationStep) => {
          setSteps(prev => prev.map((s, i) => i === stepIndex ? step : s));
          setCurrentStep(stepIndex);
        },
        (progress: number) => {
          setOverallProgress(progress);
        },
        (errorMessage: string) => {
          const parsed = parseError(new Error(errorMessage));
          setError(errorMessage);
          setParsedError(parsed);
          setIsInstalling(false);
        }
      );

      if (success) {
        setIsInstalled(true);
        setIsModalOpen(false);
        // Recheck status to get latest info
        await checkInstallationStatus();
      }

      setIsInstalling(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Installation failed';
      const parsed = parseError(error);
      setError(errorMessage);
      setParsedError(parsed);
      setIsInstalling(false);
    }
  }, [isInstalling, platform, checkInstallationStatus]);

  // Stop installation process
  const stopInstallation = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsInstalling(false);
    setError('Installation cancelled by user');
  }, []);

  // Open installation modal
  const openModal = useCallback(() => {
    setIsModalOpen(true);
    setError(null);
  }, []);

  // Close installation modal
  const closeModal = useCallback(() => {
    if (isInstalling) {
      stopInstallation();
    }
    setIsModalOpen(false);
    setError(null);
  }, [isInstalling, stopInstallation]);

  // Retry installation
  const retryInstallation = useCallback(() => {
    setError(null);
    setSteps([]);
    setCurrentStep(0);
    setOverallProgress(0);
    startInstallation();
  }, [startInstallation]);

  // Initialize on mount
  useEffect(() => {
    initializePlatform();
    checkInstallationStatus();
  }, [initializePlatform, checkInstallationStatus]);

  return {
    // State
    isInstalling,
    isInstalled,
    isModalOpen,
    platform,
    steps,
    currentStep,
    overallProgress,
    error,
    parsedError,
    ollamaStatus,

    // Actions
    startInstallation,
    stopInstallation,
    openModal,
    closeModal,
    checkInstallationStatus,
    retryInstallation,
  };
};

export default useOllamaInstallation;
