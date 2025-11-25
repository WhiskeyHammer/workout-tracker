#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

let commitHash, shortHash, commitDate, branch;

// Check for Render environment variables first (for production deployments)
if (process.env.RENDER_GIT_COMMIT) {
  console.log('📦 Using Render environment variables');
  commitHash = process.env.RENDER_GIT_COMMIT;
  shortHash = commitHash.substring(0, 7);
  branch = process.env.RENDER_GIT_BRANCH || 'main';
  commitDate = new Date().toISOString(); // Render doesn't provide commit date, use build date
  
  console.log('✓ Version info from Render');
  console.log(`  Commit: ${shortHash}`);
  console.log(`  Branch: ${branch}`);
  
} else {
  // Try to use Git commands for local development
  try {
    console.log('🔧 Using Git commands');
    commitHash = execSync('git rev-parse HEAD').toString().trim();
    shortHash = execSync('git rev-parse --short HEAD').toString().trim();
    commitDate = execSync('git log -1 --format=%cd --date=iso').toString().trim();
    branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
    
    console.log('✓ Version info from Git');
    console.log(`  Commit: ${shortHash}`);
    console.log(`  Date: ${commitDate}`);
    
  } catch (error) {
    console.error('⚠️  Git not available, using fallback version');
    commitHash = 'unknown';
    shortHash = 'dev';
    commitDate = new Date().toISOString();
    branch = 'unknown';
  }
}

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

console.log('✓ Version file written to', outputPath);
