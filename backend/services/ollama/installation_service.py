"""
OLLAMA Installation Service
Handles cross-platform OLLAMA installation and management.
"""

import os
import subprocess
import platform
import requests
import tempfile
import shutil
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from loguru import logger
import psutil
import time
import json
from datetime import datetime

class OllamaInstallationService:
    """Service for installing and managing OLLAMA across different platforms."""
    
    def __init__(self):
        self.system_platform = platform.system().lower()
        self.architecture = platform.machine().lower()
        self.ollama_port = 11434
        self.ollama_base_url = f"http://localhost:{self.ollama_port}"
        
    def detect_platform(self) -> Dict[str, str]:
        """Detect the current platform and architecture."""
        return {
            'platform': self.system_platform,
            'architecture': self.architecture,
            'is_supported': self.is_platform_supported(),
            'ollama_port': self.ollama_port,
        }
    
    def is_platform_supported(self) -> bool:
        """Check if the current platform is supported."""
        supported_platforms = ['windows', 'darwin', 'linux']
        return self.system_platform in supported_platforms
    
    def get_download_url(self) -> Optional[str]:
        """Get the appropriate OLLAMA download URL for the current platform."""
        if self.system_platform == 'windows':
            # For Windows, we'll use the direct download URL that redirects to the actual installer
            return 'https://ollama.com/download/windows'
        elif self.system_platform == 'darwin':
            return 'https://ollama.com/download/mac'
        elif self.system_platform == 'linux':
            return 'https://ollama.com/download/linux'
        return None
    
    def check_ollama_installed(self) -> Dict[str, any]:
        """Check if OLLAMA is already installed."""
        try:
            # Try to run ollama command
            result = subprocess.run(
                ['ollama', '--version'],
                capture_output=True,
                text=True,
                timeout=10
            )
            
            if result.returncode == 0:
                version = result.stdout.strip()
                return {
                    'installed': True,
                    'version': version,
                    'path': shutil.which('ollama'),
                }
            else:
                return {
                    'installed': False,
                    'error': result.stderr,
                }
        except subprocess.TimeoutExpired:
            return {
                'installed': False,
                'error': 'Command timeout',
            }
        except FileNotFoundError:
            return {
                'installed': False,
                'error': 'OLLAMA not found in PATH',
            }
        except Exception as e:
            return {
                'installed': False,
                'error': str(e),
            }
    
    def check_ollama_running(self) -> Dict[str, any]:
        """Check if OLLAMA service is running."""
        try:
            # Check if port is in use
            for conn in psutil.net_connections():
                if conn.laddr.port == self.ollama_port:
                    return {
                        'running': True,
                        'port': self.ollama_port,
                        'pid': conn.pid,
                    }
            
            # Try to connect to OLLAMA API
            response = requests.get(f"{self.ollama_base_url}/api/version", timeout=5)
            if response.status_code == 200:
                version_info = response.json()
                return {
                    'running': True,
                    'port': self.ollama_port,
                    'version': version_info.get('version'),
                    'api_responding': True,
                }
            
            return {
                'running': False,
                'error': f'API returned status {response.status_code}',
            }
            
        except requests.exceptions.ConnectionError:
            return {
                'running': False,
                'error': 'Cannot connect to OLLAMA API',
            }
        except Exception as e:
            return {
                'running': False,
                'error': str(e),
            }
    
    def download_installer(self, download_url: str) -> Tuple[bool, Optional[str], Optional[str]]:
        """Download the OLLAMA installer with enhanced error handling."""
        try:
            logger.info(f"Downloading OLLAMA installer from {download_url}")
            
            # Check network connectivity first
            try:
                response = requests.head(download_url, timeout=10)
                if response.status_code not in [200, 302]:
                    return False, None, f"Download URL not accessible: HTTP {response.status_code}"
            except requests.exceptions.RequestException as e:
                return False, None, f"Network error: {str(e)}"
            
            # Download with progress tracking
            response = requests.get(download_url, stream=True, timeout=60)
            response.raise_for_status()
            
            # Check content length
            total_size = int(response.headers.get('content-length', 0))
            if total_size > 500 * 1024 * 1024:  # 500MB limit
                return False, None, "Installer file too large (>500MB)"
            
            # Create temporary file
            suffix = '.exe' if self.system_platform == 'windows' else '.sh'
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
                downloaded_size = 0
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        temp_file.write(chunk)
                        downloaded_size += len(chunk)
                        
                        # Log progress every 10MB
                        if downloaded_size % (10 * 1024 * 1024) == 0:
                            logger.info(f"Downloaded {downloaded_size / (1024*1024):.1f}MB")
                
                installer_path = temp_file.name
            
            # Verify file was downloaded
            if not os.path.exists(installer_path) or os.path.getsize(installer_path) == 0:
                return False, None, "Downloaded file is empty or missing"
            
            logger.info(f"Successfully downloaded installer to {installer_path} ({os.path.getsize(installer_path) / (1024*1024):.1f}MB)")
            return True, installer_path, None
            
        except requests.exceptions.Timeout:
            error_msg = "Download timeout - please check your internet connection"
            logger.error(error_msg)
            return False, None, error_msg
        except requests.exceptions.ConnectionError as e:
            error_msg = f"Connection error: {str(e)}"
            logger.error(error_msg)
            return False, None, error_msg
        except requests.exceptions.HTTPError as e:
            error_msg = f"HTTP error: {str(e)}"
            logger.error(error_msg)
            return False, None, error_msg
        except Exception as e:
            error_msg = f"Unexpected download error: {str(e)}"
            logger.error(error_msg)
            return False, None, error_msg
    
    def install_windows(self, installer_path: str) -> Tuple[bool, str]:
        """Install OLLAMA on Windows using Python-native approach."""
        try:
            logger.info("Installing OLLAMA on Windows using Python-native method")
            
            # Method 1: Direct Python download and installation
            try:
                import tempfile
                import shutil
                import os
                from pathlib import Path
                
                # Create installation directory
                install_dir = Path.home() / "AppData" / "Local" / "Ollama"
                install_dir.mkdir(parents=True, exist_ok=True)
                
                final_path = install_dir / "ollama.exe"
                
                # Try multiple download URLs - use the official download page as primary
                download_urls = [
                    "https://ollama.com/download/windows",  # Official download page (should redirect to actual file)
                    "https://github.com/ollama/ollama/releases/download/v0.1.32/ollama-windows-amd64.exe",
                    "https://github.com/ollama/ollama/releases/download/v0.1.31/ollama-windows-amd64.exe",
                    "https://github.com/ollama/ollama/releases/download/v0.1.30/ollama-windows-amd64.exe",
                ]
                
                download_success = False
                for download_url in download_urls:
                    try:
                        logger.info(f"Trying download from {download_url}")
                        
                        # Download using requests
                        response = requests.get(download_url, stream=True, timeout=60, allow_redirects=True)
                        response.raise_for_status()
                        
                        # Save to final location
                        with open(final_path, 'wb') as f:
                            for chunk in response.iter_content(chunk_size=8192):
                                f.write(chunk)
                        
                        # Verify download
                        if final_path.exists():
                            file_size = final_path.stat().st_size
                            logger.info(f"Downloaded file size: {file_size} bytes")
                            
                            if file_size > 10000000:  # > 10MB
                                logger.info("OLLAMA downloaded and installed successfully")
                                download_success = True
                                break
                            else:
                                logger.warning(f"Downloaded file too small: {file_size} bytes, trying next URL")
                                final_path.unlink(missing_ok=True)  # Delete the small file
                        else:
                            logger.warning("Downloaded file not found, trying next URL")
                            
                    except Exception as e:
                        logger.warning(f"Download from {download_url} failed: {str(e)}, trying next URL")
                        final_path.unlink(missing_ok=True)  # Clean up any partial download
                        continue
                
                if download_success:
                    return True, "OLLAMA installed successfully via Python download"
                else:
                    return False, "All download URLs failed"
                    
            except Exception as e:
                logger.error(f"Python download method failed: {str(e)}")
                
            # Method 2: Use curl command (built into Windows 10+)
            try:
                logger.info("Trying curl method")
                import tempfile
                from pathlib import Path
                
                install_dir = Path.home() / "AppData" / "Local" / "Ollama"
                install_dir.mkdir(parents=True, exist_ok=True)
                
                final_path = install_dir / "ollama.exe"
                download_url = "https://github.com/ollama/ollama/releases/latest/download/ollama-windows-amd64.exe"
                
                # Use curl to download
                result = subprocess.run([
                    'curl', '-L', '-o', str(final_path), download_url
                ], capture_output=True, text=True, timeout=120)
                
                if result.returncode == 0 and final_path.exists():
                    file_size = final_path.stat().st_size
                    if file_size > 10000000:
                        logger.info("OLLAMA installed successfully via curl")
                        return True, "OLLAMA installed successfully via curl"
                    else:
                        return False, f"Downloaded file too small: {file_size} bytes"
                else:
                    return False, f"Curl download failed: {result.stderr}"
                    
            except Exception as e:
                logger.error(f"Curl method failed: {str(e)}")
                
            # Method 3: PowerShell with better URL handling
            try:
                logger.info("Trying PowerShell method with better URL handling")
                ps_script = '''
                try {
                    Write-Host "PowerShell OLLAMA installation with robust URL handling..."
                    
                    # Create installation directory
                    $installDir = "$env:LOCALAPPDATA\\Ollama"
                    if (-not (Test-Path $installDir)) {
                        New-Item -ItemType Directory -Path $installDir -Force | Out-Null
                    }
                    
                    $finalPath = "$installDir\\ollama.exe"
                    
                    # Try multiple URLs with better error handling
                    $urls = @(
                        "https://ollama.com/download/windows",
                        "https://github.com/ollama/ollama/releases/download/v0.1.32/ollama-windows-amd64.exe",
                        "https://github.com/ollama/ollama/releases/download/v0.1.31/ollama-windows-amd64.exe",
                        "https://github.com/ollama/ollama/releases/download/v0.1.30/ollama-windows-amd64.exe"
                    )
                    
                    foreach ($url in $urls) {
                        try {
                            Write-Host "Trying: $url"
                            
                            # Use Invoke-WebRequest with better settings
                            $response = Invoke-WebRequest -Uri $url -OutFile $finalPath -UseBasicParsing -TimeoutSec 120 -ErrorAction Stop
                            
                            # Verify download
                            if (Test-Path $finalPath) {
                                $size = (Get-Item $finalPath).Length
                                Write-Host "Downloaded: $size bytes"
                                
                                if ($size -gt 10000000) {
                                    Write-Host "OLLAMA installed successfully"
                                    exit 0
                                } else {
                                    Write-Host "File too small, trying next URL"
                                    Remove-Item $finalPath -Force -ErrorAction SilentlyContinue
                                }
                            }
                        } catch {
                            Write-Host "Failed to download from $url : $($_.Exception.Message)"
                            Remove-Item $finalPath -Force -ErrorAction SilentlyContinue
                            continue
                        }
                    }
                    
                    throw "All download attempts failed"
                } catch {
                    Write-Error "PowerShell installation failed: $($_.Exception.Message)"
                    exit 1
                }
                '''
                
                result = subprocess.run(
                    ['powershell', '-ExecutionPolicy', 'Bypass', '-Command', ps_script],
                    capture_output=True,
                    text=True,
                    timeout=180
                )
                
                if result.returncode == 0:
                    logger.info("OLLAMA installed successfully via PowerShell")
                    return True, "OLLAMA installed successfully via PowerShell"
                else:
                    error_msg = f"PowerShell installation failed: {result.stderr}"
                    logger.error(error_msg)
                    
            except Exception as e:
                logger.error(f"PowerShell method failed: {str(e)}")
                
            # Method 4: Return manual installation instructions
            return False, (
                "Automated installation failed. Please install OLLAMA manually:\n"
                "1. Open https://ollama.com/download in your browser\n"
                "2. Click 'Download for Windows'\n"
                "3. Run the downloaded installer\n"
                "4. Refresh this page\n"
                "This will enable Privacy Mode with local AI processing."
            )
                
        except Exception as e:
            error_msg = f"Windows installation error: {str(e)}"
            logger.error(error_msg)
            return False, error_msg
    
    def install_macos(self, installer_path: str) -> Tuple[bool, str]:
        """Install OLLAMA on macOS."""
        try:
            logger.info("Installing OLLAMA on macOS")
            
            # Make script executable
            os.chmod(installer_path, 0o755)
            
            # Run installer
            result = subprocess.run(
                ['bash', installer_path],
                capture_output=True,
                text=True,
                timeout=300
            )
            
            if result.returncode == 0:
                logger.info("OLLAMA installed successfully on macOS")
                return True, "Installation completed successfully"
            else:
                error_msg = f"Installation failed: {result.stderr}"
                logger.error(error_msg)
                return False, error_msg
                
        except subprocess.TimeoutExpired:
            error_msg = "Installation timeout"
            logger.error(error_msg)
            return False, error_msg
        except Exception as e:
            error_msg = f"Installation error: {str(e)}"
            logger.error(error_msg)
            return False, error_msg
    
    def install_linux(self, installer_path: str) -> Tuple[bool, str]:
        """Install OLLAMA on Linux."""
        try:
            logger.info("Installing OLLAMA on Linux")
            
            # Make script executable
            os.chmod(installer_path, 0o755)
            
            # Run installer
            result = subprocess.run(
                ['bash', installer_path],
                capture_output=True,
                text=True,
                timeout=300
            )
            
            if result.returncode == 0:
                logger.info("OLLAMA installed successfully on Linux")
                return True, "Installation completed successfully"
            else:
                error_msg = f"Installation failed: {result.stderr}"
                logger.error(error_msg)
                return False, error_msg
                
        except subprocess.TimeoutExpired:
            error_msg = "Installation timeout"
            logger.error(error_msg)
            return False, error_msg
        except Exception as e:
            error_msg = f"Installation error: {str(e)}"
            logger.error(error_msg)
            return False, error_msg
    
    def start_ollama_service(self) -> Tuple[bool, str]:
        """Start the OLLAMA service."""
        try:
            logger.info("Starting OLLAMA service")
            
            if self.system_platform == 'windows':
                # On Windows, OLLAMA runs as a service
                result = subprocess.run(
                    ['net', 'start', 'ollama'],
                    capture_output=True,
                    text=True,
                    timeout=30
                )
            else:
                # On Unix-like systems, start ollama serve
                result = subprocess.run(
                    ['ollama', 'serve'],
                    capture_output=True,
                    text=True,
                    timeout=30,
                    start_new_session=True  # Run in background
                )
            
            if result.returncode == 0:
                logger.info("OLLAMA service started successfully")
                return True, "Service started successfully"
            else:
                # Try alternative method
                try:
                    subprocess.Popen(['ollama', 'serve'], 
                                   stdout=subprocess.DEVNULL, 
                                   stderr=subprocess.DEVNULL,
                                   start_new_session=True)
                    logger.info("OLLAMA service started in background")
                    return True, "Service started in background"
                except Exception as e:
                    error_msg = f"Failed to start service: {str(e)}"
                    logger.error(error_msg)
                    return False, error_msg
                
        except subprocess.TimeoutExpired:
            error_msg = "Service start timeout"
            logger.error(error_msg)
            return False, error_msg
        except Exception as e:
            error_msg = f"Service start error: {str(e)}"
            logger.error(error_msg)
            return False, error_msg
    
    def verify_installation(self) -> Tuple[bool, str]:
        """Verify that OLLAMA is properly installed and running."""
        try:
            # Check if installed
            install_check = self.check_ollama_installed()
            if not install_check.get('installed', False):
                return False, "OLLAMA is not installed"
            
            # Check if running
            running_check = self.check_ollama_running()
            if not running_check.get('running', False):
                return False, "OLLAMA service is not running"
            
            # Try to get version from API
            try:
                response = requests.get(f"{self.ollama_base_url}/api/version", timeout=5)
                if response.status_code == 200:
                    version_info = response.json()
                    return True, f"OLLAMA is running version {version_info.get('version', 'unknown')}"
                else:
                    return False, f"API returned status {response.status_code}"
            except Exception as e:
                return False, f"API verification failed: {str(e)}"
                
        except Exception as e:
            return False, f"Verification error: {str(e)}"
    
    def install_ollama(self) -> Dict[str, any]:
        """Main installation method that handles the complete installation process."""
        try:
            # Check if already installed
            install_check = self.check_ollama_installed()
            if install_check.get('installed', False):
                return {
                    'success': True,
                    'message': 'OLLAMA is already installed',
                    'version': install_check.get('version'),
                    'already_installed': True,
                }
            
            # Get download URL
            download_url = self.get_download_url()
            if not download_url:
                return {
                    'success': False,
                    'error': f'Platform {self.system_platform} is not supported',
                }
            
            # For Windows, we handle download and installation in one step
            if self.system_platform == 'windows':
                install_success, install_message = self.install_windows(None)
            else:
                # Download installer for other platforms
                download_success, installer_path, download_error = self.download_installer(download_url)
                if not download_success:
                    return {
                        'success': False,
                        'error': download_error or 'Failed to download installer',
                        'error_type': 'download_error',
                    }
                
                # Install based on platform
                if self.system_platform == 'darwin':
                    install_success, install_message = self.install_macos(installer_path)
                elif self.system_platform == 'linux':
                    install_success, install_message = self.install_linux(installer_path)
                else:
                    return {
                        'success': False,
                        'error': f'Unsupported platform: {self.system_platform}',
                    }
            
            if not install_success:
                return {
                    'success': False,
                    'error': install_message,
                }
            
            # Start service
            start_success, start_message = self.start_ollama_service()
            if not start_success:
                logger.warning(f"Failed to start service: {start_message}")
            
            # Verify installation
            verify_success, verify_message = self.verify_installation()
            
            return {
                'success': True,
                'message': verify_message,
                'version': install_check.get('version'),
                'service_started': start_success,
                'verification_passed': verify_success,
            }
                        
        except Exception as e:
            logger.error(f"Installation failed: {e}")
            return {
                'success': False,
                'error': str(e),
            }
    
    def get_installation_status(self) -> Dict[str, any]:
        """Get comprehensive installation status."""
        install_check = self.check_ollama_installed()
        running_check = self.check_ollama_running()
        
        return {
            'platform': self.system_platform,
            'architecture': self.architecture,
            'installed': install_check.get('installed', False),
            'running': running_check.get('running', False),
            'version': install_check.get('version'),
            'path': install_check.get('path'),
            'port': self.ollama_port,
            'api_responding': running_check.get('api_responding', False),
            'errors': {
                'install': install_check.get('error'),
                'running': running_check.get('error'),
            },
        }
