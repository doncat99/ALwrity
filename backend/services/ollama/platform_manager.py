"""
OLLAMA Platform Manager
Handles platform-specific operations and configurations.
"""

import platform
import os
import subprocess
import psutil
from typing import Dict, List, Optional, Tuple
from loguru import logger
from pathlib import Path

class OllamaPlatformManager:
    """Manages platform-specific operations for OLLAMA."""
    
    def __init__(self):
        self.system_platform = platform.system().lower()
        self.architecture = platform.machine().lower()
        self.system_info = self._get_system_info()
    
    def _get_system_info(self) -> Dict[str, any]:
        """Get comprehensive system information."""
        return {
            'platform': self.system_platform,
            'architecture': self.architecture,
            'platform_version': platform.version(),
            'platform_release': platform.release(),
            'platform_machine': platform.machine(),
            'platform_processor': platform.processor(),
            'python_version': platform.python_version(),
            'cpu_count': psutil.cpu_count(),
            'memory_total': psutil.virtual_memory().total,
            'memory_available': psutil.virtual_memory().available,
        }
    
    def get_platform_info(self) -> Dict[str, any]:
        """Get platform-specific information."""
        info = {
            'system': self.system_info,
            'ollama_paths': self.get_ollama_paths(),
            'requirements': self.get_platform_requirements(),
            'installation_method': self.get_installation_method(),
            'service_management': self.get_service_management_info(),
        }
        
        return info
    
    def get_ollama_paths(self) -> Dict[str, str]:
        """Get OLLAMA-specific paths for the current platform."""
        if self.system_platform == 'windows':
            return {
                'home': os.path.expanduser('~'),
                'config': os.path.join(os.path.expanduser('~'), '.ollama'),
                'models': os.path.join(os.path.expanduser('~'), '.ollama', 'models'),
                'logs': os.path.join(os.path.expanduser('~'), '.ollama', 'logs'),
                'cache': os.path.join(os.path.expanduser('~'), '.ollama', 'cache'),
                'binary': 'ollama.exe',
                'service_name': 'ollama',
            }
        elif self.system_platform == 'darwin':
            return {
                'home': os.path.expanduser('~'),
                'config': os.path.join(os.path.expanduser('~'), '.ollama'),
                'models': os.path.join(os.path.expanduser('~'), '.ollama', 'models'),
                'logs': os.path.join(os.path.expanduser('~'), '.ollama', 'logs'),
                'cache': os.path.join(os.path.expanduser('~'), '.ollama', 'cache'),
                'binary': 'ollama',
                'service_name': 'ollama',
            }
        elif self.system_platform == 'linux':
            return {
                'home': os.path.expanduser('~'),
                'config': os.path.join(os.path.expanduser('~'), '.ollama'),
                'models': os.path.join(os.path.expanduser('~'), '.ollama', 'models'),
                'logs': os.path.join(os.path.expanduser('~'), '.ollama', 'logs'),
                'cache': os.path.join(os.path.expanduser('~'), '.ollama', 'cache'),
                'binary': 'ollama',
                'service_name': 'ollama',
            }
        else:
            return {
                'home': os.path.expanduser('~'),
                'config': os.path.join(os.path.expanduser('~'), '.ollama'),
                'models': os.path.join(os.path.expanduser('~'), '.ollama', 'models'),
                'logs': os.path.join(os.path.expanduser('~'), '.ollama', 'logs'),
                'cache': os.path.join(os.path.expanduser('~'), '.ollama', 'cache'),
                'binary': 'ollama',
                'service_name': 'ollama',
            }
    
    def get_platform_requirements(self) -> Dict[str, any]:
        """Get platform-specific requirements."""
        base_requirements = {
            'min_ram_gb': 8,
            'recommended_ram_gb': 16,
            'min_storage_gb': 10,
            'recommended_storage_gb': 50,
            'min_cpu_cores': 2,
            'recommended_cpu_cores': 4,
        }
        
        if self.system_platform == 'windows':
            return {
                **base_requirements,
                'os_version': 'Windows 10 or later',
                'architecture': 'x64 or ARM64',
                'additional_requirements': [
                    'Administrator privileges for installation',
                    'Windows Defender exclusion for OLLAMA folder',
                    'Firewall exception for port 11434',
                ],
            }
        elif self.system_platform == 'darwin':
            return {
                **base_requirements,
                'os_version': 'macOS 12 or later',
                'architecture': 'x64 or Apple Silicon (M1/M2)',
                'additional_requirements': [
                    'Homebrew (optional, for easier installation)',
                    'Full disk access permission (for some models)',
                ],
            }
        elif self.system_platform == 'linux':
            return {
                **base_requirements,
                'os_version': 'Ubuntu 18.04+, CentOS 7+, or equivalent',
                'architecture': 'x64 or ARM64',
                'additional_requirements': [
                    'curl or wget',
                    'sudo privileges for installation',
                    'systemd or equivalent init system',
                ],
            }
        else:
            return {
                **base_requirements,
                'os_version': 'Unknown',
                'architecture': 'Unknown',
                'additional_requirements': [],
            }
    
    def get_installation_method(self) -> Dict[str, any]:
        """Get the recommended installation method for the platform."""
        if self.system_platform == 'windows':
            return {
                'method': 'installer',
                'download_url': 'https://ollama.com/download/windows',
                'install_command': 'ollama-windows-amd64.exe /S',
                'verify_command': 'ollama --version',
                'start_command': 'net start ollama',
                'stop_command': 'net stop ollama',
                'description': 'Windows installer with automatic service setup',
            }
        elif self.system_platform == 'darwin':
            return {
                'method': 'homebrew_or_script',
                'download_url': 'https://ollama.com/download/mac',
                'install_command_homebrew': 'brew install ollama',
                'install_command_script': 'curl -fsSL https://ollama.com/install.sh | sh',
                'verify_command': 'ollama --version',
                'start_command': 'ollama serve',
                'stop_command': 'pkill ollama',
                'description': 'Homebrew package or installation script',
            }
        elif self.system_platform == 'linux':
            return {
                'method': 'script',
                'download_url': 'https://ollama.com/download/linux',
                'install_command': 'curl -fsSL https://ollama.com/install.sh | sh',
                'verify_command': 'ollama --version',
                'start_command': 'systemctl --user start ollama',
                'stop_command': 'systemctl --user stop ollama',
                'enable_command': 'systemctl --user enable ollama',
                'description': 'Installation script with systemd service',
            }
        else:
            return {
                'method': 'manual',
                'download_url': 'https://ollama.com/download',
                'description': 'Manual installation required',
            }
    
    def get_service_management_info(self) -> Dict[str, any]:
        """Get service management information for the platform."""
        if self.system_platform == 'windows':
            return {
                'service_type': 'windows_service',
                'start_command': 'net start ollama',
                'stop_command': 'net stop ollama',
                'status_command': 'sc query ollama',
                'auto_start': True,
                'management_commands': {
                    'start': 'net start ollama',
                    'stop': 'net stop ollama',
                    'restart': 'net stop ollama && net start ollama',
                    'status': 'sc query ollama',
                    'enable': 'sc config ollama start= auto',
                    'disable': 'sc config ollama start= disabled',
                },
            }
        elif self.system_platform == 'darwin':
            return {
                'service_type': 'user_process',
                'start_command': 'ollama serve',
                'stop_command': 'pkill ollama',
                'status_command': 'pgrep ollama',
                'auto_start': False,
                'management_commands': {
                    'start': 'ollama serve &',
                    'stop': 'pkill ollama',
                    'restart': 'pkill ollama && sleep 2 && ollama serve &',
                    'status': 'pgrep ollama',
                },
            }
        elif self.system_platform == 'linux':
            return {
                'service_type': 'systemd_user_service',
                'start_command': 'systemctl --user start ollama',
                'stop_command': 'systemctl --user stop ollama',
                'status_command': 'systemctl --user status ollama',
                'auto_start': True,
                'management_commands': {
                    'start': 'systemctl --user start ollama',
                    'stop': 'systemctl --user stop ollama',
                    'restart': 'systemctl --user restart ollama',
                    'status': 'systemctl --user status ollama',
                    'enable': 'systemctl --user enable ollama',
                    'disable': 'systemctl --user disable ollama',
                },
            }
        else:
            return {
                'service_type': 'unknown',
                'description': 'Service management not defined for this platform',
            }
    
    def check_system_requirements(self) -> Dict[str, any]:
        """Check if the system meets the requirements."""
        requirements = self.get_platform_requirements()
        system_info = self.system_info
        
        # Check RAM
        memory_gb = system_info['memory_total'] / (1024**3)
        ram_sufficient = memory_gb >= requirements['min_ram_gb']
        
        # Check CPU cores
        cpu_sufficient = system_info['cpu_count'] >= requirements['min_cpu_cores']
        
        # Check storage (approximate)
        disk_usage = psutil.disk_usage('/')
        storage_gb = disk_usage.free / (1024**3)
        storage_sufficient = storage_gb >= requirements['min_storage_gb']
        
        # Check platform support
        platform_supported = self.system_platform in ['windows', 'darwin', 'linux']
        
        return {
            'meets_requirements': all([
                ram_sufficient,
                cpu_sufficient,
                storage_sufficient,
                platform_supported
            ]),
            'checks': {
                'ram': {
                    'required': f"{requirements['min_ram_gb']}GB",
                    'available': f"{memory_gb:.1f}GB",
                    'sufficient': ram_sufficient,
                },
                'cpu': {
                    'required': f"{requirements['min_cpu_cores']} cores",
                    'available': f"{system_info['cpu_count']} cores",
                    'sufficient': cpu_sufficient,
                },
                'storage': {
                    'required': f"{requirements['min_storage_gb']}GB",
                    'available': f"{storage_gb:.1f}GB",
                    'sufficient': storage_sufficient,
                },
                'platform': {
                    'supported': platform_supported,
                    'detected': self.system_platform,
                },
            },
            'recommendations': self._get_recommendations(ram_sufficient, cpu_sufficient, storage_sufficient),
        }
    
    def _get_recommendations(self, ram_sufficient: bool, cpu_sufficient: bool, storage_sufficient: bool) -> List[str]:
        """Get recommendations based on system check results."""
        recommendations = []
        
        if not ram_sufficient:
            recommendations.append("Consider upgrading RAM for better performance")
        
        if not cpu_sufficient:
            recommendations.append("Consider upgrading CPU for faster processing")
        
        if not storage_sufficient:
            recommendations.append("Free up disk space or add more storage")
        
        if not self.system_platform in ['windows', 'darwin', 'linux']:
            recommendations.append("Platform may not be fully supported")
        
        return recommendations
    
    def get_environment_variables(self) -> Dict[str, str]:
        """Get environment variables relevant to OLLAMA."""
        return {
            'OLLAMA_HOST': os.environ.get('OLLAMA_HOST', '127.0.0.1:11434'),
            'OLLAMA_MODELS': os.environ.get('OLLAMA_MODELS', os.path.join(os.path.expanduser('~'), '.ollama', 'models')),
            'OLLAMA_KEEP_ALIVE': os.environ.get('OLLAMA_KEEP_ALIVE', '5m'),
            'OLLAMA_DEBUG': os.environ.get('OLLAMA_DEBUG', ''),
            'OLLAMA_FLASH_ATTENTION': os.environ.get('OLLAMA_FLASH_ATTENTION', ''),
        }
    
    def get_network_info(self) -> Dict[str, any]:
        """Get network information relevant to OLLAMA."""
        return {
            'ollama_port': 11434,
            'localhost': '127.0.0.1',
            'api_base_url': 'http://127.0.0.1:11434',
            'network_interfaces': self._get_network_interfaces(),
        }
    
    def _get_network_interfaces(self) -> List[Dict[str, any]]:
        """Get network interface information."""
        interfaces = []
        try:
            for interface, addrs in psutil.net_if_addrs().items():
                for addr in addrs:
                    if addr.family == psutil.AF_INET:  # IPv4
                        interfaces.append({
                            'interface': interface,
                            'address': addr.address,
                            'netmask': addr.netmask,
                        })
        except Exception as e:
            logger.warning(f"Failed to get network interfaces: {e}")
        
        return interfaces
