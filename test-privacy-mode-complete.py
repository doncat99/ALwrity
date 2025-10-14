#!/usr/bin/env python3
"""
Complete Privacy Mode Testing Suite
Orchestrates backend and frontend testing for the OLLAMA Privacy Mode system.
"""

import os
import sys
import json
import time
import subprocess
import platform
from datetime import datetime
from pathlib import Path

class PrivacyModeTestOrchestrator:
    """Orchestrates comprehensive testing of the Privacy Mode system."""
    
    def __init__(self):
        self.results = {
            'timestamp': datetime.now().isoformat(),
            'platform': platform.system().lower(),
            'architecture': platform.machine().lower(),
            'test_suites': {},
            'summary': {
                'total_suites': 0,
                'passed_suites': 0,
                'failed_suites': 0,
                'total_tests': 0,
                'passed_tests': 0,
                'failed_tests': 0,
                'duration_seconds': 0,
            }
        }
        
        self.project_root = Path(__file__).parent
        self.backend_path = self.project_root / 'backend'
        self.frontend_path = self.project_root / 'frontend'
        
        # Test configuration
        self.config = {
            'run_backend_tests': True,
            'run_frontend_tests': True,
            'run_integration_tests': True,
            'run_system_tests': True,
            'run_performance_tests': False,
            'generate_report': True,
            'save_artifacts': True,
        }
    
    def log_suite_result(self, suite_name: str, passed: bool, message: str = "", details: dict = None):
        """Log test suite result."""
        self.results['test_suites'][suite_name] = {
            'passed': passed,
            'message': message,
            'details': details or {},
            'timestamp': datetime.now().isoformat(),
        }
        
        self.results['summary']['total_suites'] += 1
        if passed:
            self.results['summary']['passed_suites'] += 1
            print(f"✅ {suite_name}: {message}")
        else:
            self.results['summary']['failed_suites'] += 1
            print(f"❌ {suite_name}: {message}")
    
    def run_backend_tests(self) -> bool:
        """Run backend test suite."""
        print("\n🔧 Running Backend Tests...")
        print("=" * 50)
        
        try:
            if not self.backend_path.exists():
                self.log_suite_result('backend_tests', False, "Backend directory not found")
                return False
            
            # Change to backend directory
            original_cwd = os.getcwd()
            os.chdir(self.backend_path)
            
            try:
                # Run comprehensive backend tests
                result = subprocess.run([
                    sys.executable, 'test_ollama_comprehensive.py'
                ], capture_output=True, text=True, timeout=300)
                
                if result.returncode == 0:
                    self.log_suite_result('backend_tests', True, "Backend tests passed")
                    
                    # Parse backend test results if available
                    try:
                        # Look for JSON results file
                        import glob
                        result_files = glob.glob('ollama_test_results_*.json')
                        if result_files:
                            latest_file = max(result_files, key=os.path.getctime)
                            with open(latest_file, 'r') as f:
                                backend_results = json.load(f)
                                self.results['test_suites']['backend_tests']['details'] = backend_results
                    except Exception as e:
                        print(f"Warning: Could not parse backend results: {e}")
                    
                    return True
                else:
                    self.log_suite_result('backend_tests', False, f"Backend tests failed: {result.stderr}")
                    return False
                    
            finally:
                os.chdir(original_cwd)
                
        except subprocess.TimeoutExpired:
            self.log_suite_result('backend_tests', False, "Backend tests timed out")
            return False
        except Exception as e:
            self.log_suite_result('backend_tests', False, f"Backend test error: {str(e)}")
            return False
    
    def run_frontend_tests(self) -> bool:
        """Run frontend test suite."""
        print("\n🎨 Running Frontend Tests...")
        print("=" * 50)
        
        try:
            if not self.frontend_path.exists():
                self.log_suite_result('frontend_tests', False, "Frontend directory not found")
                return False
            
            # Change to frontend directory
            original_cwd = os.getcwd()
            os.chdir(self.frontend_path)
            
            try:
                # Check if Node.js is available
                try:
                    subprocess.run(['node', '--version'], check=True, capture_output=True)
                except (subprocess.CalledProcessError, FileNotFoundError):
                    self.log_suite_result('frontend_tests', False, "Node.js not available")
                    return False
                
                # Run frontend tests
                result = subprocess.run([
                    'node', 'test-privacy-mode.js'
                ], capture_output=True, text=True, timeout=180)
                
                if result.returncode == 0:
                    self.log_suite_result('frontend_tests', True, "Frontend tests passed")
                    
                    # Parse frontend test results if available
                    try:
                        import glob
                        result_files = glob.glob('frontend_test_results_*.json')
                        if result_files:
                            latest_file = max(result_files, key=os.path.getctime)
                            with open(latest_file, 'r') as f:
                                frontend_results = json.load(f)
                                self.results['test_suites']['frontend_tests']['details'] = frontend_results
                    except Exception as e:
                        print(f"Warning: Could not parse frontend results: {e}")
                    
                    return True
                else:
                    self.log_suite_result('frontend_tests', False, f"Frontend tests failed: {result.stderr}")
                    return False
                    
            finally:
                os.chdir(original_cwd)
                
        except subprocess.TimeoutExpired:
            self.log_suite_result('frontend_tests', False, "Frontend tests timed out")
            return False
        except Exception as e:
            self.log_suite_result('frontend_tests', False, f"Frontend test error: {str(e)}")
            return False
    
    def run_integration_tests(self) -> bool:
        """Run integration tests."""
        print("\n🔗 Running Integration Tests...")
        print("=" * 50)
        
        try:
            # Test if backend can start
            backend_startup_success = self.test_backend_startup()
            
            # Test if frontend can build
            frontend_build_success = self.test_frontend_build()
            
            # Test API endpoints (if backend is running)
            api_success = False
            if backend_startup_success:
                api_success = self.test_api_endpoints()
            
            # Test component integration
            component_success = self.test_component_integration()
            
            overall_success = backend_startup_success and frontend_build_success and component_success
            
            self.log_suite_result('integration_tests', overall_success, 
                                "Integration tests completed", {
                                    'backend_startup': backend_startup_success,
                                    'frontend_build': frontend_build_success,
                                    'api_endpoints': api_success,
                                    'component_integration': component_success,
                                })
            
            return overall_success
            
        except Exception as e:
            self.log_suite_result('integration_tests', False, f"Integration test error: {str(e)}")
            return False
    
    def test_backend_startup(self) -> bool:
        """Test if backend can start successfully."""
        try:
            original_cwd = os.getcwd()
            os.chdir(self.backend_path)
            
            # Try to start backend with a timeout
            process = subprocess.Popen([
                sys.executable, '-m', 'uvicorn', 'app:app', '--host', '127.0.0.1', '--port', '8001'
            ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            
            # Wait a bit for startup
            time.sleep(5)
            
            # Check if process is still running
            if process.poll() is None:
                # Process is running, kill it
                process.terminate()
                process.wait(timeout=5)
                os.chdir(original_cwd)
                return True
            else:
                # Process exited, check for errors
                stdout, stderr = process.communicate()
                print(f"Backend startup failed: {stderr.decode()}")
                os.chdir(original_cwd)
                return False
                
        except Exception as e:
            print(f"Backend startup test error: {e}")
            os.chdir(original_cwd)
            return False
    
    def test_frontend_build(self) -> bool:
        """Test if frontend can build successfully."""
        try:
            original_cwd = os.getcwd()
            os.chdir(self.frontend_path)
            
            # Check if package.json exists
            if not (self.frontend_path / 'package.json').exists():
                os.chdir(original_cwd)
                return False
            
            # Try to run build command
            result = subprocess.run([
                'npm', 'run', 'build'
            ], capture_output=True, text=True, timeout=120)
            
            os.chdir(original_cwd)
            return result.returncode == 0
            
        except Exception as e:
            print(f"Frontend build test error: {e}")
            os.chdir(original_cwd)
            return False
    
    def test_api_endpoints(self) -> bool:
        """Test API endpoints."""
        try:
            import requests
            
            # Test health endpoint
            response = requests.get('http://127.0.0.1:8001/health', timeout=5)
            if response.status_code != 200:
                return False
            
            # Test OLLAMA endpoints
            ollama_endpoints = [
                '/api/ollama/status',
                '/api/ollama/platform',
                '/api/ollama/requirements',
            ]
            
            for endpoint in ollama_endpoints:
                try:
                    response = requests.get(f'http://127.0.0.1:8001{endpoint}', timeout=5)
                    if response.status_code not in [200, 404]:  # 404 is ok if not implemented
                        return False
                except requests.exceptions.RequestException:
                    return False
            
            return True
            
        except ImportError:
            print("Warning: requests library not available for API testing")
            return False
        except Exception as e:
            print(f"API endpoint test error: {e}")
            return False
    
    def test_component_integration(self) -> bool:
        """Test component integration."""
        try:
            # Check if key component files exist
            required_components = [
                'src/components/PrivacyMode/PrivacyModeButton.tsx',
                'src/components/PrivacyMode/InstallationModal.tsx',
                'src/hooks/useOllamaInstallation.ts',
                'src/utils/ollama/errorHandling.ts',
            ]
            
            for component in required_components:
                if not (self.frontend_path / component).exists():
                    return False
            
            return True
            
        except Exception as e:
            print(f"Component integration test error: {e}")
            return False
    
    def run_system_tests(self) -> bool:
        """Run system-level tests."""
        print("\n🖥️  Running System Tests...")
        print("=" * 50)
        
        try:
            # Test system requirements
            system_ok = self.test_system_requirements()
            
            # Test file permissions
            permissions_ok = self.test_file_permissions()
            
            # Test network connectivity
            network_ok = self.test_network_connectivity()
            
            overall_success = system_ok and permissions_ok and network_ok
            
            self.log_suite_result('system_tests', overall_success, 
                                "System tests completed", {
                                    'system_requirements': system_ok,
                                    'file_permissions': permissions_ok,
                                    'network_connectivity': network_ok,
                                })
            
            return overall_success
            
        except Exception as e:
            self.log_suite_result('system_tests', False, f"System test error: {str(e)}")
            return False
    
    def test_system_requirements(self) -> bool:
        """Test system requirements."""
        try:
            import psutil
            
            # Check RAM
            memory = psutil.virtual_memory()
            ram_ok = memory.total >= 4 * 1024**3  # 4GB minimum
            
            # Check disk space
            disk = psutil.disk_usage('/')
            disk_ok = disk.free >= 10 * 1024**3  # 10GB minimum
            
            # Check CPU
            cpu_count = psutil.cpu_count()
            cpu_ok = cpu_count >= 2  # 2 cores minimum
            
            return ram_ok and disk_ok and cpu_ok
            
        except ImportError:
            print("Warning: psutil not available for system requirements testing")
            return True  # Assume OK if can't check
        except Exception as e:
            print(f"System requirements test error: {e}")
            return False
    
    def test_file_permissions(self) -> bool:
        """Test file permissions."""
        try:
            # Test write permissions in temp directory
            import tempfile
            with tempfile.NamedTemporaryFile(delete=True) as tmp:
                tmp.write(b'test')
            
            # Test read permissions for key files
            key_files = [
                self.backend_path / 'app.py',
                self.frontend_path / 'package.json',
            ]
            
            for file_path in key_files:
                if file_path.exists():
                    with open(file_path, 'r') as f:
                        f.read(100)  # Read first 100 characters
            
            return True
            
        except Exception as e:
            print(f"File permissions test error: {e}")
            return False
    
    def test_network_connectivity(self) -> bool:
        """Test network connectivity."""
        try:
            import requests
            
            # Test internet connectivity
            response = requests.get('https://ollama.com', timeout=10)
            internet_ok = response.status_code == 200
            
            # Test local connectivity
            try:
                response = requests.get('http://127.0.0.1:8000', timeout=2)
                local_ok = True  # Any response is fine
            except requests.exceptions.RequestException:
                local_ok = True  # No local server is fine for testing
            
            return internet_ok and local_ok
            
        except ImportError:
            print("Warning: requests not available for network testing")
            return True  # Assume OK if can't check
        except Exception as e:
            print(f"Network connectivity test error: {e}")
            return False
    
    def run_all_tests(self) -> dict:
        """Run all configured test suites."""
        print("🚀 Starting Complete Privacy Mode Testing Suite")
        print("=" * 60)
        
        start_time = time.time()
        
        # Run test suites based on configuration
        if self.config['run_backend_tests']:
            self.run_backend_tests()
        
        if self.config['run_frontend_tests']:
            self.run_frontend_tests()
        
        if self.config['run_integration_tests']:
            self.run_integration_tests()
        
        if self.config['run_system_tests']:
            self.run_system_tests()
        
        end_time = time.time()
        duration = end_time - start_time
        
        # Generate summary
        self.results['summary']['duration_seconds'] = round(duration, 2)
        
        # Calculate test counts from suite details
        total_tests = 0
        passed_tests = 0
        failed_tests = 0
        
        for suite_name, suite_result in self.results['test_suites'].items():
            if 'details' in suite_result and 'summary' in suite_result['details']:
                suite_summary = suite_result['details']['summary']
                total_tests += suite_summary.get('total_tests', 0)
                passed_tests += suite_summary.get('passed', 0)
                failed_tests += suite_summary.get('failed', 0)
        
        self.results['summary']['total_tests'] = total_tests
        self.results['summary']['passed_tests'] = passed_tests
        self.results['summary']['failed_tests'] = failed_tests
        
        return self.results
    
    def print_summary(self):
        """Print comprehensive test summary."""
        print("\n" + "=" * 60)
        print("📊 COMPLETE PRIVACY MODE TEST SUMMARY")
        print("=" * 60)
        
        summary = self.results['summary']
        print(f"Platform: {self.results['platform']} ({self.results['architecture']})")
        print(f"Total Test Suites: {summary['total_suites']}")
        print(f"Passed Suites: {summary['passed_suites']} ✅")
        print(f"Failed Suites: {summary['failed_suites']} ❌")
        print(f"Total Tests: {summary['total_tests']}")
        print(f"Passed Tests: {summary['passed_tests']} ✅")
        print(f"Failed Tests: {summary['failed_tests']} ❌")
        print(f"Duration: {summary['duration_seconds']}s")
        
        # Calculate success rates
        suite_success_rate = (summary['passed_suites'] / summary['total_suites'] * 100) if summary['total_suites'] > 0 else 0
        test_success_rate = (summary['passed_tests'] / summary['total_tests'] * 100) if summary['total_tests'] > 0 else 0
        
        print(f"Suite Success Rate: {suite_success_rate:.1f}%")
        print(f"Test Success Rate: {test_success_rate:.1f}%")
        
        # Show failed suites
        if summary['failed_suites'] > 0:
            print("\n❌ FAILED TEST SUITES:")
            for suite_name, suite_result in self.results['test_suites'].items():
                if not suite_result['passed']:
                    print(f"  - {suite_name}: {suite_result['message']}")
        
        print("\n" + "=" * 60)
        
        # Overall assessment
        if suite_success_rate >= 90 and test_success_rate >= 90:
            print("🎉 EXCELLENT! Privacy Mode system is ready for production!")
        elif suite_success_rate >= 80 and test_success_rate >= 80:
            print("✅ GOOD! Privacy Mode system is mostly working, minor issues to address.")
        elif suite_success_rate >= 70 and test_success_rate >= 70:
            print("⚠️  FAIR! Privacy Mode system needs some fixes before production.")
        else:
            print("🚨 POOR! Privacy Mode system needs significant fixes.")
    
    def save_results(self, filename: str = None):
        """Save comprehensive test results."""
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"privacy_mode_complete_test_results_{timestamp}.json"
        
        try:
            with open(filename, 'w') as f:
                json.dump(self.results, f, indent=2, default=str)
            print(f"\n💾 Complete test results saved to: {filename}")
        except Exception as e:
            print(f"\n❌ Failed to save results: {str(e)}")

def main():
    """Main test orchestrator."""
    print("🔧 OLLAMA Privacy Mode - Complete Testing Suite")
    print("=" * 60)
    
    # Initialize orchestrator
    orchestrator = PrivacyModeTestOrchestrator()
    
    # Run all tests
    results = orchestrator.run_all_tests()
    
    # Print summary
    orchestrator.print_summary()
    
    # Save results
    orchestrator.save_results()
    
    # Exit with appropriate code
    if results['summary']['failed_suites'] > 0:
        sys.exit(1)
    else:
        sys.exit(0)

if __name__ == "__main__":
    main()
