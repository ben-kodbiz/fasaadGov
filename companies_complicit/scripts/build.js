#!/usr/bin/env node

/**
 * Build script for FasaadGov v02
 * Prepares the application for production deployment
 */

import fs from 'fs';
import path from 'path';

async function build() {
  console.log('🔨 Building FasaadGov v02...');
  
  try {
    // Validate data first
    console.log('1. Validating data files...');
    const { execSync } = await import('child_process');
    execSync('npm run validate', { stdio: 'inherit' });
    
    // Run linting
    console.log('2. Running linter...');
    execSync('npm run lint', { stdio: 'inherit' });
    
    // Run tests
    console.log('3. Running tests...');
    execSync('npm test', { stdio: 'inherit' });
    
    // Create build info
    const buildInfo = {
      version: process.env.npm_package_version || '2.0.0',
      buildDate: new Date().toISOString(),
      gitCommit: process.env.GITHUB_SHA || 'local',
      environment: process.env.NODE_ENV || 'development'
    };
    
    fs.writeFileSync('build-info.json', JSON.stringify(buildInfo, null, 2));
    
    console.log('✅ Build completed successfully!');
    console.log(`📦 Version: ${buildInfo.version}`);
    console.log(`📅 Build Date: ${buildInfo.buildDate}`);
    
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

build();