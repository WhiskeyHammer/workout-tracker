#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  // Get Git information
  const commitHash = execSync('git rev-parse HEAD').toString().trim();
  const shortHash = execSync('git rev-parse --short HEAD').toString().trim();
  const commitDate = execSync('git log -1 --format=%cd --date=iso').toString().trim();
  const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
  
  // Create version object
  const versionInfo = {
    commitHash,
    shortHash,
    commitDate,
    branch,
    buildDate: new Date().toISOString(),
    repository: 'https://github.com/WhiskeyHammer/workout-tracker'
  };
  
  // Write to public directory so it's accessible to the client
  const outputPath = path.join(__dirname, '..', 'public', 'version.json');
  fs.writeFileSync(outputPath, JSON.stringify(versionInfo, null, 2));
  
  console.log('✓ Version file generated successfully');
  console.log(`  Commit: ${shortHash}`);
  console.log(`  Date: ${commitDate}`);
  
} catch (error) {
  console.error('Error generating version file:', error.message);
  
  // Fallback version info if Git is not available
  const fallbackVersion = {
    commitHash: 'unknown',
    shortHash: 'dev',
    commitDate: new Date().toISOString(),
    branch: 'unknown',
    buildDate: new Date().toISOString(),
    repository: 'https://github.com/WhiskeyHammer/workout-tracker'
  };
  
  const outputPath = path.join(__dirname, '..', 'public', 'version.json');
  fs.writeFileSync(outputPath, JSON.stringify(fallbackVersion, null, 2));
  
  console.log('✓ Fallback version file generated');
}
