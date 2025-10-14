"""
OLLAMA Validation Service
Validates OLLAMA installation and functionality.
"""

import requests
import subprocess
import psutil
import time
from typing import Dict, List, Optional, Tuple
from loguru import logger

class OllamaValidationService:
    """Service for validating OLLAMA installation and functionality."""
    
    def __init__(self):
        self.ollama_port = 11434
        self.ollama_base_url = f"http://localhost:{self.ollama_port}"
        self.timeout = 10
    
    def validate_installation(self) -> Dict[str, any]:
        """Comprehensive validation of OLLAMA installation."""
        results = {
            'overall_status': 'unknown',
            'checks': {},
            'summary': {},
            'recommendations': [],
        }
        
        # Run all validation checks
        results['checks']['api_connectivity'] = self.check_api_connectivity()
        results['checks']['service_status'] = self.check_service_status()
        results['checks']['version_info'] = self.check_version_info()
        results['checks']['models_available'] = self.check_models_available()
        results['checks']['basic_functionality'] = self.check_basic_functionality()
        results['checks']['port_availability'] = self.check_port_availability()
        results['checks']['process_status'] = self.check_process_status()
        
        # Determine overall status
        results['overall_status'] = self._determine_overall_status(results['checks'])
        results['summary'] = self._generate_summary(results['checks'])
        results['recommendations'] = self._generate_recommendations(results['checks'])
        
        return results
    
    def check_api_connectivity(self) -> Dict[str, any]:
        """Check if OLLAMA API is accessible."""
        try:
            response = requests.get(f"{self.ollama_base_url}/api/version", timeout=self.timeout)
            
            if response.status_code == 200:
                version_data = response.json()
                return {
                    'status': 'success',
                    'message': 'API is accessible',
                    'response_time': response.elapsed.total_seconds(),
                    'version': version_data.get('version', 'unknown'),
                    'details': version_data,
                }
            else:
                return {
                    'status': 'error',
                    'message': f'API returned status {response.status_code}',
                    'status_code': response.status_code,
                }
        except requests.exceptions.ConnectionError:
            return {
                'status': 'error',
                'message': 'Cannot connect to OLLAMA API',
                'error_type': 'connection_error',
            }
        except requests.exceptions.Timeout:
            return {
                'status': 'error',
                'message': 'API request timeout',
                'error_type': 'timeout',
            }
        except Exception as e:
            return {
                'status': 'error',
                'message': f'API check failed: {str(e)}',
                'error_type': 'unknown',
            }
    
    def check_service_status(self) -> Dict[str, any]:
        """Check if OLLAMA service is running."""
        try:
            # Check if port is in use
            port_in_use = False
            ollama_processes = []
            
            for conn in psutil.net_connections():
                if conn.laddr.port == self.ollama_port:
                    port_in_use = True
                    if conn.pid:
                        try:
                            process = psutil.Process(conn.pid)
                            ollama_processes.append({
                                'pid': conn.pid,
                                'name': process.name(),
                                'cmdline': ' '.join(process.cmdline()),
                                'status': process.status(),
                                'memory_mb': process.memory_info().rss / (1024 * 1024),
                                'cpu_percent': process.cpu_percent(),
                            })
                        except (psutil.NoSuchProcess, psutil.AccessDenied):
                            pass
            
            if port_in_use and ollama_processes:
                return {
                    'status': 'success',
                    'message': 'OLLAMA service is running',
                    'port_in_use': True,
                    'processes': ollama_processes,
                }
            elif port_in_use:
                return {
                    'status': 'warning',
                    'message': 'Port is in use but no OLLAMA process found',
                    'port_in_use': True,
                    'processes': [],
                }
            else:
                return {
                    'status': 'error',
                    'message': 'OLLAMA service is not running',
                    'port_in_use': False,
                    'processes': [],
                }
        except Exception as e:
            return {
                'status': 'error',
                'message': f'Service check failed: {str(e)}',
                'error_type': 'unknown',
            }
    
    def check_version_info(self) -> Dict[str, any]:
        """Check OLLAMA version information."""
        try:
            # Try API first
            try:
                response = requests.get(f"{self.ollama_base_url}/api/version", timeout=self.timeout)
                if response.status_code == 200:
                    api_version = response.json()
                    return {
                        'status': 'success',
                        'message': 'Version information retrieved via API',
                        'version': api_version.get('version', 'unknown'),
                        'source': 'api',
                        'details': api_version,
                    }
            except:
                pass
            
            # Fallback to command line
            result = subprocess.run(
                ['ollama', '--version'],
                capture_output=True,
                text=True,
                timeout=self.timeout
            )
            
            if result.returncode == 0:
                version_output = result.stdout.strip()
                return {
                    'status': 'success',
                    'message': 'Version information retrieved via command line',
                    'version': version_output,
                    'source': 'command_line',
                    'details': {'output': version_output},
                }
            else:
                return {
                    'status': 'error',
                    'message': 'Failed to get version information',
                    'error': result.stderr,
                    'return_code': result.returncode,
                }
        except subprocess.TimeoutExpired:
            return {
                'status': 'error',
                'message': 'Version check timeout',
                'error_type': 'timeout',
            }
        except FileNotFoundError:
            return {
                'status': 'error',
                'message': 'OLLAMA command not found',
                'error_type': 'not_found',
            }
        except Exception as e:
            return {
                'status': 'error',
                'message': f'Version check failed: {str(e)}',
                'error_type': 'unknown',
            }
    
    def check_models_available(self) -> Dict[str, any]:
        """Check what models are available."""
        try:
            response = requests.get(f"{self.ollama_base_url}/api/tags", timeout=self.timeout)
            
            if response.status_code == 200:
                models_data = response.json()
                models = models_data.get('models', [])
                
                return {
                    'status': 'success',
                    'message': f'Found {len(models)} models',
                    'model_count': len(models),
                    'models': models,
                    'details': models_data,
                }
            else:
                return {
                    'status': 'error',
                    'message': f'Failed to get models: {response.status_code}',
                    'status_code': response.status_code,
                }
        except Exception as e:
            return {
                'status': 'error',
                'message': f'Models check failed: {str(e)}',
                'error_type': 'unknown',
            }
    
    def check_basic_functionality(self) -> Dict[str, any]:
        """Test basic OLLAMA functionality."""
        try:
            # Try a simple generation request
            test_prompt = "Hello"
            response = requests.post(
                f"{self.ollama_base_url}/api/generate",
                json={
                    'model': 'llama3.2:1b',  # Use a small model for testing
                    'prompt': test_prompt,
                    'stream': False,
                },
                timeout=30  # Longer timeout for generation
            )
            
            if response.status_code == 200:
                generation_data = response.json()
                response_text = generation_data.get('response', '')
                
                return {
                    'status': 'success',
                    'message': 'Basic functionality test passed',
                    'test_prompt': test_prompt,
                    'response_length': len(response_text),
                    'response_preview': response_text[:100] + '...' if len(response_text) > 100 else response_text,
                    'details': generation_data,
                }
            else:
                return {
                    'status': 'error',
                    'message': f'Generation test failed: {response.status_code}',
                    'status_code': response.status_code,
                    'response_text': response.text,
                }
        except requests.exceptions.Timeout:
            return {
                'status': 'warning',
                'message': 'Generation test timeout (this may be normal for first run)',
                'error_type': 'timeout',
            }
        except Exception as e:
            return {
                'status': 'error',
                'message': f'Functionality test failed: {str(e)}',
                'error_type': 'unknown',
            }
    
    def check_port_availability(self) -> Dict[str, any]:
        """Check if the OLLAMA port is available."""
        try:
            # Check if port is in use
            port_in_use = False
            process_info = None
            
            for conn in psutil.net_connections():
                if conn.laddr.port == self.ollama_port:
                    port_in_use = True
                    if conn.pid:
                        try:
                            process = psutil.Process(conn.pid)
                            process_info = {
                                'pid': conn.pid,
                                'name': process.name(),
                                'cmdline': ' '.join(process.cmdline()),
                            }
                        except (psutil.NoSuchProcess, psutil.AccessDenied):
                            pass
                    break
            
            return {
                'status': 'success' if port_in_use else 'warning',
                'message': f'Port {self.ollama_port} is {"in use" if port_in_use else "available"}',
                'port': self.ollama_port,
                'in_use': port_in_use,
                'process': process_info,
            }
        except Exception as e:
            return {
                'status': 'error',
                'message': f'Port check failed: {str(e)}',
                'error_type': 'unknown',
            }
    
    def check_process_status(self) -> Dict[str, any]:
        """Check OLLAMA process status."""
        try:
            ollama_processes = []
            
            for proc in psutil.process_iter(['pid', 'name', 'cmdline', 'status', 'memory_info', 'cpu_percent']):
                try:
                    if 'ollama' in proc.info['name'].lower():
                        ollama_processes.append({
                            'pid': proc.info['pid'],
                            'name': proc.info['name'],
                            'cmdline': ' '.join(proc.info['cmdline']) if proc.info['cmdline'] else '',
                            'status': proc.info['status'],
                            'memory_mb': proc.info['memory_info'].rss / (1024 * 1024) if proc.info['memory_info'] else 0,
                            'cpu_percent': proc.info['cpu_percent'],
                        })
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    continue
            
            if ollama_processes:
                return {
                    'status': 'success',
                    'message': f'Found {len(ollama_processes)} OLLAMA processes',
                    'process_count': len(ollama_processes),
                    'processes': ollama_processes,
                }
            else:
                return {
                    'status': 'warning',
                    'message': 'No OLLAMA processes found',
                    'process_count': 0,
                    'processes': [],
                }
        except Exception as e:
            return {
                'status': 'error',
                'message': f'Process check failed: {str(e)}',
                'error_type': 'unknown',
            }
    
    def _determine_overall_status(self, checks: Dict[str, Dict[str, any]]) -> str:
        """Determine overall validation status."""
        statuses = [check.get('status', 'unknown') for check in checks.values()]
        
        if 'error' in statuses:
            return 'error'
        elif 'warning' in statuses:
            return 'warning'
        elif all(status == 'success' for status in statuses):
            return 'success'
        else:
            return 'unknown'
    
    def _generate_summary(self, checks: Dict[str, Dict[str, any]]) -> Dict[str, any]:
        """Generate a summary of validation results."""
        total_checks = len(checks)
        successful_checks = sum(1 for check in checks.values() if check.get('status') == 'success')
        warning_checks = sum(1 for check in checks.values() if check.get('status') == 'warning')
        error_checks = sum(1 for check in checks.values() if check.get('status') == 'error')
        
        return {
            'total_checks': total_checks,
            'successful_checks': successful_checks,
            'warning_checks': warning_checks,
            'error_checks': error_checks,
            'success_rate': (successful_checks / total_checks) * 100 if total_checks > 0 else 0,
        }
    
    def _generate_recommendations(self, checks: Dict[str, Dict[str, any]]) -> List[str]:
        """Generate recommendations based on validation results."""
        recommendations = []
        
        # API connectivity issues
        if checks.get('api_connectivity', {}).get('status') == 'error':
            recommendations.append("Start OLLAMA service: ollama serve")
        
        # Service status issues
        if checks.get('service_status', {}).get('status') == 'error':
            recommendations.append("Install and start OLLAMA service")
        
        # No models available
        models_check = checks.get('models_available', {})
        if models_check.get('status') == 'success' and models_check.get('model_count', 0) == 0:
            recommendations.append("Download a model: ollama pull llama3.2:1b")
        
        # Port availability
        port_check = checks.get('port_availability', {})
        if port_check.get('status') == 'warning' and not port_check.get('in_use', False):
            recommendations.append("Start OLLAMA service to use port 11434")
        
        # Process status
        process_check = checks.get('process_status', {})
        if process_check.get('status') == 'warning':
            recommendations.append("Ensure OLLAMA processes are running")
        
        return recommendations
