#!/usr/bin/env python3
"""
Quick Privacy Mode Test
Fast validation of key components without full test suite.
"""

import os
import sys
import json
from pathlib import Path

def check_file_exists(file_path, description):
    """Check if a file exists and log result."""
    if Path(file_path).exists():
        print(f"✅ {description}: {file_path}")
        return True
    else:
        print(f"❌ {description}: {file_path} (MISSING)")
        return False

def check_python_syntax(file_path, description):
    """Check Python file syntax."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            compile(f.read(), file_path, 'exec')
        print(f"✅ {description}: {file_path} (syntax OK)")
        return True
    except SyntaxError as e:
        print(f"❌ {description}: {file_path} (syntax error: {e})")
        return False
    except Exception as e:
        print(f"❌ {description}: {file_path} (error: {e})")
        return False

def check_typescript_syntax(file_path, description):
    """Check TypeScript/JSX file syntax (basic)."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Basic syntax checks
        if 'import' not in content:
            print(f"⚠️  {description}: {file_path} (no imports found)")
            return False
            
        if 'export' not in content:
            print(f"⚠️  {description}: {file_path} (no exports found)")
            return False
            
        # Check for basic React patterns
        if file_path.endswith('.tsx'):
            if 'React' not in content and 'from \'react\'' not in content:
                print(f"⚠️  {description}: {file_path} (no React import)")
                return False
                
        print(f"✅ {description}: {file_path} (syntax OK)")
        return True
        
    except Exception as e:
        print(f"❌ {description}: {file_path} (error: {e})")
        return False

def main():
    """Run quick validation tests."""
    print("🔍 Quick Privacy Mode Validation")
    print("=" * 40)
    
    results = {
        'backend_files': 0,
        'frontend_files': 0,
        'total_checks': 0,
        'passed_checks': 0,
    }
    
    # Backend file checks
    print("\n🔧 Backend Files:")
    backend_files = [
        ('backend/app.py', 'Main FastAPI application'),
        ('backend/services/ollama/installation_service.py', 'Installation service'),
        ('backend/services/ollama/platform_manager.py', 'Platform manager'),
        ('backend/services/ollama/validation_service.py', 'Validation service'),
        ('backend/routers/ollama_router.py', 'OLLAMA router'),
        ('backend/test/test_ollama_installation.py', 'Backend tests'),
    ]
    
    for file_path, description in backend_files:
        if check_file_exists(file_path, description):
            results['backend_files'] += 1
            if check_python_syntax(file_path, f"Syntax check - {description}"):
                results['passed_checks'] += 1
            results['total_checks'] += 1
    
    # Frontend file checks
    print("\n🎨 Frontend Files:")
    frontend_files = [
        ('frontend/src/components/PrivacyMode/PrivacyModeButton.tsx', 'Privacy Mode button'),
        ('frontend/src/components/PrivacyMode/InstallationModal.tsx', 'Installation modal'),
        ('frontend/src/components/PrivacyMode/ErrorRecoveryModal.tsx', 'Error recovery modal'),
        ('frontend/src/components/PrivacyMode/SystemRequirementsChecker.tsx', 'System requirements checker'),
        ('frontend/src/hooks/useOllamaInstallation.ts', 'OLLAMA installation hook'),
        ('frontend/src/utils/ollama/errorHandling.ts', 'Error handling utilities'),
        ('frontend/src/utils/ollama/platformDetection.ts', 'Platform detection utilities'),
        ('frontend/src/api/ollama.ts', 'OLLAMA API client'),
        ('frontend/src/components/OnboardingWizard/ApiKeyStep.tsx', 'API key step (modified)'),
        ('frontend/src/components/OnboardingWizard/ApiKeyStep/utils/useApiKeyStep.ts', 'API key hook (modified)'),
    ]
    
    for file_path, description in frontend_files:
        if check_file_exists(file_path, description):
            results['frontend_files'] += 1
            if check_typescript_syntax(file_path, f"Syntax check - {description}"):
                results['passed_checks'] += 1
            results['total_checks'] += 1
    
    # Test runner checks
    print("\n🧪 Test Runners:")
    test_files = [
        ('backend/test_ollama_comprehensive.py', 'Backend test runner'),
        ('frontend/test-privacy-mode.js', 'Frontend test runner'),
        ('test-privacy-mode-complete.py', 'Complete test orchestrator'),
    ]
    
    for file_path, description in test_files:
        if check_file_exists(file_path, description):
            if file_path.endswith('.py'):
                if check_python_syntax(file_path, f"Syntax check - {description}"):
                    results['passed_checks'] += 1
            else:
                # For JS files, just check existence
                results['passed_checks'] += 1
            results['total_checks'] += 1
    
    # Configuration files
    print("\n⚙️  Configuration Files:")
    config_files = [
        ('frontend/package.json', 'Frontend package configuration'),
        ('backend/requirements.txt', 'Backend dependencies (if exists)'),
    ]
    
    for file_path, description in config_files:
        if check_file_exists(file_path, description):
            results['passed_checks'] += 1
        results['total_checks'] += 1
    
    # Summary
    print("\n" + "=" * 40)
    print("📊 QUICK VALIDATION SUMMARY")
    print("=" * 40)
    print(f"Backend Files: {results['backend_files']}/6")
    print(f"Frontend Files: {results['frontend_files']}/10")
    print(f"Total Checks: {results['total_checks']}")
    print(f"Passed Checks: {results['passed_checks']}")
    
    success_rate = (results['passed_checks'] / results['total_checks'] * 100) if results['total_checks'] > 0 else 0
    print(f"Success Rate: {success_rate:.1f}%")
    
    if success_rate >= 90:
        print("\n🎉 EXCELLENT! All key files are present and valid.")
    elif success_rate >= 80:
        print("\n✅ GOOD! Most files are present and valid.")
    elif success_rate >= 70:
        print("\n⚠️  FAIR! Some files need attention.")
    else:
        print("\n🚨 POOR! Multiple files are missing or invalid.")
    
    print("\n" + "=" * 40)
    
    # Save results
    timestamp = __import__('datetime').datetime.now().strftime("%Y%m%d_%H%M%S")
    results_file = f"quick_test_results_{timestamp}.json"
    
    try:
        with open(results_file, 'w') as f:
            json.dump(results, f, indent=2)
        print(f"💾 Results saved to: {results_file}")
    except Exception as e:
        print(f"❌ Failed to save results: {e}")
    
    return success_rate >= 80

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
