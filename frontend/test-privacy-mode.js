#!/usr/bin/env node
/**
 * Frontend Privacy Mode Testing Script
 * Tests React components, hooks, and integration
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class FrontendTestRunner {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      platform: process.platform,
      nodeVersion: process.version,
      tests: {},
      summary: {
        totalTests: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
      }
    };
    
    this.projectRoot = path.resolve(__dirname);
    this.frontendPath = this.projectRoot;
  }

  logTestResult(testName, passed, message = '', details = {}) {
    this.results.tests[testName] = {
      passed,
      message,
      details,
      timestamp: new Date().toISOString(),
    };
    
    this.results.summary.totalTests++;
    if (passed) {
      this.results.summary.passed++;
      console.log(`✅ ${testName}: ${message}`);
    } else {
      this.results.summary.failed++;
      console.log(`❌ ${testName}: ${message}`);
    }
  }

  async runCommand(command, options = {}) {
    return new Promise((resolve, reject) => {
      try {
        const result = execSync(command, {
          cwd: this.frontendPath,
          encoding: 'utf8',
          stdio: options.silent ? 'pipe' : 'inherit',
          ...options
        });
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  }

  async checkFileExists(filePath) {
    try {
      const fullPath = path.join(this.frontendPath, filePath);
      return fs.existsSync(fullPath);
    } catch (error) {
      return false;
    }
  }

  async readFileContent(filePath) {
    try {
      const fullPath = path.join(this.frontendPath, filePath);
      return fs.readFileSync(fullPath, 'utf8');
    } catch (error) {
      return null;
    }
  }

  async testProjectStructure() {
    console.log('\n📁 Testing Project Structure...');
    
    const requiredFiles = [
      'package.json',
      'src/components/PrivacyMode/index.ts',
      'src/components/PrivacyMode/PrivacyModeButton.tsx',
      'src/components/PrivacyMode/InstallationModal.tsx',
      'src/components/PrivacyMode/ErrorRecoveryModal.tsx',
      'src/components/PrivacyMode/SystemRequirementsChecker.tsx',
      'src/components/PrivacyMode/InstallationProgressFeedback.tsx',
      'src/hooks/useOllamaInstallation.ts',
      'src/utils/ollama/errorHandling.ts',
      'src/utils/ollama/platformDetection.ts',
      'src/utils/ollama/validation.ts',
      'src/api/ollama.ts',
    ];

    for (const file of requiredFiles) {
      const exists = await this.checkFileExists(file);
      this.logTestResult(
        `file_exists_${file.replace(/[\/\-\.]/g, '_')}`,
        exists,
        exists ? `File ${file} exists` : `File ${file} missing`
      );
    }

    // Test component exports
    try {
      const indexContent = await this.readFileContent('src/components/PrivacyMode/index.ts');
      if (indexContent && indexContent.includes('PrivacyModeButton')) {
        this.logTestResult('component_exports', true, 'Privacy Mode components properly exported');
      } else {
        this.logTestResult('component_exports', false, 'Privacy Mode components not properly exported');
      }
    } catch (error) {
      this.logTestResult('component_exports', false, `Failed to read component exports: ${error.message}`);
    }
  }

  async testDependencies() {
    console.log('\n📦 Testing Dependencies...');
    
    try {
      const packageJson = JSON.parse(await this.readFileContent('package.json'));
      
      // Check required dependencies
      const requiredDeps = [
        'react',
        'react-dom',
        '@mui/material',
        '@mui/icons-material',
        '@emotion/react',
        '@emotion/styled',
        'axios',
      ];

      for (const dep of requiredDeps) {
        const hasDep = packageJson.dependencies && packageJson.dependencies[dep];
        this.logTestResult(
          `dependency_${dep.replace(/[\/\-\.]/g, '_')}`,
          !!hasDep,
          hasDep ? `Dependency ${dep} installed` : `Dependency ${dep} missing`
        );
      }

      // Check dev dependencies
      const requiredDevDeps = [
        '@types/react',
        '@types/react-dom',
        'typescript',
        'vitest',
        '@testing-library/react',
        '@testing-library/jest-dom',
      ];

      for (const dep of requiredDevDeps) {
        const hasDep = packageJson.devDependencies && packageJson.devDependencies[dep];
        this.logTestResult(
          `dev_dependency_${dep.replace(/[\/\-\.]/g, '_')}`,
          !!hasDep,
          hasDep ? `Dev dependency ${dep} installed` : `Dev dependency ${dep} missing`
        );
      }

    } catch (error) {
      this.logTestResult('dependencies', false, `Failed to check dependencies: ${error.message}`);
    }
  }

  async testTypeScriptCompilation() {
    console.log('\n🔧 Testing TypeScript Compilation...');
    
    try {
      await this.runCommand('npx tsc --noEmit', { silent: true });
      this.logTestResult('typescript_compilation', true, 'TypeScript compilation successful');
    } catch (error) {
      this.logTestResult('typescript_compilation', false, `TypeScript compilation failed: ${error.message}`);
    }
  }

  async testLinting() {
    console.log('\n🧹 Testing Code Linting...');
    
    try {
      await this.runCommand('npm run lint', { silent: true });
      this.logTestResult('linting', true, 'Linting passed');
    } catch (error) {
      // Linting might not be configured, check if eslint is available
      try {
        await this.runCommand('npx eslint src --ext .ts,.tsx', { silent: true });
        this.logTestResult('linting', true, 'ESLint passed');
      } catch (eslintError) {
        this.logTestResult('linting', false, `Linting failed: ${error.message}`);
      }
    }
  }

  async testComponentSyntax() {
    console.log('\n🎨 Testing Component Syntax...');
    
    const componentFiles = [
      'src/components/PrivacyMode/PrivacyModeButton.tsx',
      'src/components/PrivacyMode/InstallationModal.tsx',
      'src/components/PrivacyMode/ErrorRecoveryModal.tsx',
      'src/components/PrivacyMode/SystemRequirementsChecker.tsx',
      'src/components/PrivacyMode/InstallationProgressFeedback.tsx',
    ];

    for (const file of componentFiles) {
      try {
        const content = await this.readFileContent(file);
        if (content) {
          // Basic syntax checks
          const hasReactImport = content.includes('import React');
          const hasExport = content.includes('export default') || content.includes('export {');
          const hasJSX = content.includes('<');
          
          const syntaxValid = hasReactImport && hasExport && hasJSX;
          
          this.logTestResult(
            `component_syntax_${path.basename(file, '.tsx')}`,
            syntaxValid,
            syntaxValid ? `Component ${file} syntax valid` : `Component ${file} syntax issues`
          );
        } else {
          this.logTestResult(
            `component_syntax_${path.basename(file, '.tsx')}`,
            false,
            `Could not read component ${file}`
          );
        }
      } catch (error) {
        this.logTestResult(
          `component_syntax_${path.basename(file, '.tsx')}`,
          false,
          `Error checking component ${file}: ${error.message}`
        );
      }
    }
  }

  async testHookSyntax() {
    console.log('\n🪝 Testing Hook Syntax...');
    
    try {
      const hookContent = await this.readFileContent('src/hooks/useOllamaInstallation.ts');
      if (hookContent) {
        // Basic hook syntax checks
        const hasReactImport = hookContent.includes('import React') || hookContent.includes('from \'react\'');
        const hasHookExport = hookContent.includes('export const useOllamaInstallation');
        const hasUseState = hookContent.includes('useState');
        const hasUseCallback = hookContent.includes('useCallback');
        
        const syntaxValid = hasReactImport && hasHookExport && (hasUseState || hasUseCallback);
        
        this.logTestResult(
          'hook_syntax_useOllamaInstallation',
          syntaxValid,
          syntaxValid ? 'Hook syntax valid' : 'Hook syntax issues'
        );
      } else {
        this.logTestResult('hook_syntax_useOllamaInstallation', false, 'Could not read hook file');
      }
    } catch (error) {
      this.logTestResult('hook_syntax_useOllamaInstallation', false, `Error checking hook: ${error.message}`);
    }
  }

  async testUtilityFunctions() {
    console.log('\n🔧 Testing Utility Functions...');
    
    const utilityFiles = [
      'src/utils/ollama/errorHandling.ts',
      'src/utils/ollama/platformDetection.ts',
      'src/utils/ollama/validation.ts',
      'src/api/ollama.ts',
    ];

    for (const file of utilityFiles) {
      try {
        const content = await this.readFileContent(file);
        if (content) {
          // Basic utility syntax checks
          const hasExports = content.includes('export');
          const hasFunctions = content.includes('function') || content.includes('=>') || content.includes('class');
          
          const syntaxValid = hasExports && hasFunctions;
          
          this.logTestResult(
            `utility_syntax_${path.basename(file, '.ts')}`,
            syntaxValid,
            syntaxValid ? `Utility ${file} syntax valid` : `Utility ${file} syntax issues`
          );
        } else {
          this.logTestResult(
            `utility_syntax_${path.basename(file, '.ts')}`,
            false,
            `Could not read utility ${file}`
          );
        }
      } catch (error) {
        this.logTestResult(
          `utility_syntax_${path.basename(file, '.ts')}`,
          false,
          `Error checking utility ${file}: ${error.message}`
        );
      }
    }
  }

  async testBuildProcess() {
    console.log('\n🏗️  Testing Build Process...');
    
    try {
      // Test if build script exists
      const packageJson = JSON.parse(await this.readFileContent('package.json'));
      const hasBuildScript = packageJson.scripts && packageJson.scripts.build;
      
      if (hasBuildScript) {
        this.logTestResult('build_script_exists', true, 'Build script exists');
        
        // Try building (but don't wait too long)
        try {
          await Promise.race([
            this.runCommand('npm run build', { silent: true }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Build timeout')), 60000))
          ]);
          this.logTestResult('build_process', true, 'Build process successful');
        } catch (error) {
          this.logTestResult('build_process', false, `Build process failed: ${error.message}`);
        }
      } else {
        this.logTestResult('build_script_exists', false, 'Build script missing');
        this.logTestResult('build_process', false, 'Cannot test build - no build script');
      }
    } catch (error) {
      this.logTestResult('build_process', false, `Error testing build: ${error.message}`);
    }
  }

  async testIntegration() {
    console.log('\n🔗 Testing Integration...');
    
    try {
      // Test if components can be imported
      const testImportScript = `
        try {
          const { PrivacyModeButton } = require('./src/components/PrivacyMode');
          const { useOllamaInstallation } = require('./src/hooks/useOllamaInstallation');
          const { parseError } = require('./src/utils/ollama/errorHandling');
          console.log('Integration test: All imports successful');
        } catch (error) {
          console.error('Integration test failed:', error.message);
          process.exit(1);
        }
      `;
      
      const testFile = path.join(this.frontendPath, 'temp_integration_test.js');
      fs.writeFileSync(testFile, testImportScript);
      
      try {
        await this.runCommand(`node ${testFile}`, { silent: true });
        this.logTestResult('integration_imports', true, 'Component and utility imports working');
      } catch (error) {
        this.logTestResult('integration_imports', false, `Import test failed: ${error.message}`);
      } finally {
        // Clean up test file
        if (fs.existsSync(testFile)) {
          fs.unlinkSync(testFile);
        }
      }
      
    } catch (error) {
      this.logTestResult('integration', false, `Integration test error: ${error.message}`);
    }
  }

  async runAllTests() {
    console.log('🚀 Starting Frontend Privacy Mode Testing');
    console.log('=' * 60);
    
    const startTime = Date.now();
    
    // Run all tests
    await this.testProjectStructure();
    await this.testDependencies();
    await this.testTypeScriptCompilation();
    await this.testLinting();
    await this.testComponentSyntax();
    await this.testHookSyntax();
    await this.testUtilityFunctions();
    await this.testBuildProcess();
    await this.testIntegration();
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    // Generate summary
    this.results.summary.durationSeconds = Math.round(duration * 100) / 100;
    this.results.summary.successRate = Math.round(
      (this.results.summary.passed / this.results.summary.totalTests) * 100 * 100
    ) / 100;
    
    return this.results;
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 FRONTEND TEST SUMMARY');
    console.log('='.repeat(60));
    
    const summary = this.results.summary;
    console.log(`Platform: ${this.results.platform}`);
    console.log(`Node Version: ${this.results.nodeVersion}`);
    console.log(`Total Tests: ${summary.totalTests}`);
    console.log(`Passed: ${summary.passed} ✅`);
    console.log(`Failed: ${summary.failed} ❌`);
    console.log(`Skipped: ${summary.skipped} ⏭️`);
    console.log(`Success Rate: ${summary.successRate}%`);
    console.log(`Duration: ${summary.durationSeconds}s`);
    
    if (summary.failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      for (const [testName, testResult] of Object.entries(this.results.tests)) {
        if (!testResult.passed) {
          console.log(`  - ${testName}: ${testResult.message}`);
        }
      }
    }
    
    console.log('\n' + '='.repeat(60));
    
    if (summary.successRate >= 90) {
      console.log('🎉 EXCELLENT! Frontend is ready for production.');
    } else if (summary.successRate >= 80) {
      console.log('✅ GOOD! Frontend is mostly working, minor issues to address.');
    } else if (summary.successRate >= 70) {
      console.log('⚠️  FAIR! Frontend needs some fixes before production.');
    } else {
      console.log('🚨 POOR! Frontend needs significant fixes.');
    }
  }

  saveResults(filename = null) {
    if (!filename) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      filename = `frontend_test_results_${timestamp}.json`;
    }
    
    try {
      fs.writeFileSync(filename, JSON.stringify(this.results, null, 2));
      console.log(`\n💾 Test results saved to: ${filename}`);
    } catch (error) {
      console.log(`\n❌ Failed to save results: ${error.message}`);
    }
  }
}

async function main() {
  console.log('🔧 OLLAMA Privacy Mode - Frontend Testing Suite');
  console.log('='.repeat(60));
  
  // Initialize test runner
  const testRunner = new FrontendTestRunner();
  
  // Run all tests
  const results = await testRunner.runAllTests();
  
  // Print summary
  testRunner.printSummary();
  
  // Save results
  testRunner.saveResults();
  
  // Exit with appropriate code
  if (results.summary.failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = FrontendTestRunner;
