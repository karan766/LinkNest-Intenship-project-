#!/usr/bin/env node

/**
 * Production Deployment Script for LinkNest Frontend
 * This script handles the build and deployment process
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const ENVIRONMENTS = {
  development: 'development',
  staging: 'staging',
  production: 'production'
};

class DeploymentScript {
  constructor() {
    this.environment = process.argv[2] || 'production';
    this.skipTests = process.argv.includes('--skip-tests');
    this.skipLint = process.argv.includes('--skip-lint');
    this.analyze = process.argv.includes('--analyze');
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      reset: '\x1b[0m'
    };
    
    console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
  }

  validateEnvironment() {
    this.log('Validating environment configuration...', 'info');
    
    if (!Object.values(ENVIRONMENTS).includes(this.environment)) {
      this.log(`Invalid environment: ${this.environment}`, 'error');
      this.log(`Valid environments: ${Object.values(ENVIRONMENTS).join(', ')}`, 'info');
      process.exit(1);
    }

    const envFile = `.env.${this.environment}`;
    if (!fs.existsSync(envFile) && this.environment !== 'production') {
      this.log(`Environment file ${envFile} not found`, 'error');
      process.exit(1);
    }

    this.log(`Environment: ${this.environment}`, 'success');
  }

  checkRequiredTools() {
    this.log('Checking required tools...', 'info');
    
    const tools = ['node', 'npm'];
    
    for (const tool of tools) {
      try {
        execSync(`${tool} --version`, { stdio: 'ignore' });
        this.log(`✓ ${tool} is available`, 'success');
      } catch (error) {
        this.log(`✗ ${tool} is not available`, 'error');
        process.exit(1);
      }
    }
  }

  installDependencies() {
    this.log('Installing dependencies...', 'info');
    
    try {
      execSync('npm ci', { stdio: 'inherit' });
      this.log('Dependencies installed successfully', 'success');
    } catch (error) {
      this.log('Failed to install dependencies', 'error');
      process.exit(1);
    }
  }

  runLinting() {
    if (this.skipLint) {
      this.log('Skipping linting...', 'warning');
      return;
    }

    this.log('Running ESLint...', 'info');
    
    try {
      execSync('npm run lint', { stdio: 'inherit' });
      this.log('Linting passed', 'success');
    } catch (error) {
      this.log('Linting failed', 'error');
      this.log('Run "npm run lint:fix" to auto-fix issues', 'info');
      process.exit(1);
    }
  }

  runTests() {
    if (this.skipTests) {
      this.log('Skipping tests...', 'warning');
      return;
    }

    this.log('Running tests...', 'info');
    
    try {
      execSync('npm test', { stdio: 'inherit' });
      this.log('Tests passed', 'success');
    } catch (error) {
      this.log('Tests failed', 'error');
      process.exit(1);
    }
  }

  cleanBuildDirectory() {
    this.log('Cleaning build directory...', 'info');
    
    try {
      if (fs.existsSync('dist')) {
        fs.rmSync('dist', { recursive: true, force: true });
      }
      this.log('Build directory cleaned', 'success');
    } catch (error) {
      this.log('Failed to clean build directory', 'error');
      process.exit(1);
    }
  }

  buildApplication() {
    this.log(`Building application for ${this.environment}...`, 'info');
    
    const buildCommand = this.environment === 'production' 
      ? 'npm run build'
      : `npm run build:${this.environment}`;
    
    try {
      execSync(buildCommand, { stdio: 'inherit' });
      this.log('Build completed successfully', 'success');
    } catch (error) {
      this.log('Build failed', 'error');
      process.exit(1);
    }
  }

  analyzeBuild() {
    if (!this.analyze) {
      return;
    }

    this.log('Analyzing build...', 'info');
    
    try {
      execSync('npm run analyze', { stdio: 'inherit' });
      this.log('Build analysis completed', 'success');
    } catch (error) {
      this.log('Build analysis failed', 'warning');
    }
  }

  validateBuild() {
    this.log('Validating build output...', 'info');
    
    const distPath = path.join(process.cwd(), 'dist');
    const indexPath = path.join(distPath, 'index.html');
    
    if (!fs.existsSync(distPath)) {
      this.log('Build directory not found', 'error');
      process.exit(1);
    }
    
    if (!fs.existsSync(indexPath)) {
      this.log('index.html not found in build output', 'error');
      process.exit(1);
    }
    
    const stats = fs.statSync(distPath);
    this.log(`Build output size: ${this.formatBytes(this.getDirectorySize(distPath))}`, 'info');
    this.log('Build validation passed', 'success');
  }

  getDirectorySize(dirPath) {
    let totalSize = 0;
    
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        totalSize += this.getDirectorySize(filePath);
      } else {
        totalSize += stats.size;
      }
    }
    
    return totalSize;
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  generateDeploymentInfo() {
    this.log('Generating deployment info...', 'info');
    
    const deploymentInfo = {
      environment: this.environment,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      nodeVersion: process.version,
      buildHash: this.generateBuildHash(),
    };
    
    const infoPath = path.join('dist', 'deployment-info.json');
    fs.writeFileSync(infoPath, JSON.stringify(deploymentInfo, null, 2));
    
    this.log('Deployment info generated', 'success');
  }

  generateBuildHash() {
    try {
      return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
    } catch (error) {
      return 'unknown';
    }
  }

  async deploy() {
    try {
      this.log('Starting deployment process...', 'info');
      this.log(`Target environment: ${this.environment}`, 'info');
      
      this.validateEnvironment();
      this.checkRequiredTools();
      this.installDependencies();
      this.runLinting();
      this.runTests();
      this.cleanBuildDirectory();
      this.buildApplication();
      this.validateBuild();
      this.generateDeploymentInfo();
      this.analyzeBuild();
      
      this.log('Deployment completed successfully! 🎉', 'success');
      this.log('Build output is ready in the "dist" directory', 'info');
      
      if (this.environment === 'production') {
        this.log('Production deployment checklist:', 'info');
        this.log('- Upload dist/ contents to your web server', 'info');
        this.log('- Configure web server for SPA routing', 'info');
        this.log('- Set up HTTPS and security headers', 'info');
        this.log('- Configure CDN if applicable', 'info');
      }
      
    } catch (error) {
      this.log(`Deployment failed: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// Run the deployment script
const deployment = new DeploymentScript();
deployment.deploy();