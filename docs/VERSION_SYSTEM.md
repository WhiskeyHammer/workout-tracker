# Version System Documentation

## Overview

The workout tracker now uses a Git commit-based versioning system that provides reliable update checking by comparing the deployed version with the latest commit on GitHub.

## How It Works

### 1. Build-Time Version Generation

When the server starts, a `version.json` file is automatically generated containing:
- **commitHash**: Full Git commit SHA
- **shortHash**: Shortened 7-character commit hash (e.g., "7ce9f7f")
- **commitDate**: Date/time of the commit
- **branch**: Git branch name
- **buildDate**: When the version file was generated
- **repository**: GitHub repository URL

### 2. Version API Endpoint

The server exposes `/api/version` which returns the current deployed version information. This allows the client to know exactly what version is running.

### 3. GitHub Integration

When users click "check for updates", the app:
1. Fetches the latest commit from GitHub API: `https://api.github.com/repos/WhiskeyHammer/workout-tracker/commits/main`
2. Compares the remote commit hash with the local version
3. If they differ, displays an "Update Available" button
4. Shows the exact commit hash being run in the footer (e.g., "7ce9f7f")

### 4. Service Worker Cache

The service worker now uses the commit hash in its cache name (e.g., `workout-tracker-7ce9f7f`), ensuring proper cache invalidation when new versions are deployed.

## Usage

### Development

When running in development mode:
```bash
npm run dev
```
The version file is automatically regenerated with the latest Git information.

### Production Deployment

When deploying to production:
```bash
npm start
```
The version file is generated before the server starts, capturing the deployed commit.

### Manual Version Generation

You can manually generate the version file:
```bash
npm run generate-version
```

## Benefits

1. **Accurate**: Based on actual Git commits, not manually updated version numbers
2. **Reliable**: No dependency on browser cache behavior
3. **Transparent**: Users can see the exact commit they're running
4. **Automated**: No need to manually bump version numbers
5. **Traceable**: Easy to identify which code is deployed
6. **Developer-Friendly**: Integrates with existing Git workflow

## Version Display

The UI footer displays:
- **Current version**: The short commit hash (e.g., "7ce9f7f")
- **"check for updates"**: Button to query GitHub for latest commit
- **"Update Available"**: Shown when a newer commit exists on GitHub

## Troubleshooting

### "Current version: unknown"

This means the version.json file wasn't generated. Run:
```bash
npm run generate-version
```

### Git Not Available

If Git isn't available during build, the script creates a fallback version file with:
- commitHash: "unknown"
- shortHash: "dev"

### Private Repositories

If your repository is private, the GitHub API will return a 404 error for unauthenticated requests. You have several options:

**Option 1: Make Repository Public** (simplest)
- If your repository can be public, this is the easiest solution
- No code changes needed

**Option 2: Use GitHub Personal Access Token**
- Create a read-only personal access token
- Add it to your environment variables
- Modify the fetch request to include the token in headers
- **Security Note**: Never commit tokens to your repository

**Option 3: Server-Side Checking** (recommended for private repos)
- Move the GitHub API call to the server
- Store the token securely in environment variables on the server
- The client calls your server's API which then calls GitHub
- This keeps the token secure and off the client

**Option 4: Disable GitHub Checking**
- Remove the GitHub API call
- Rely only on service worker update detection
- Show current version but no update checking

For most users with private repositories, **Option 3 or 4** is recommended.

### GitHub API Rate Limiting

The GitHub API has rate limits for unauthenticated requests (60 per hour). If users check for updates frequently, they might hit this limit. Consider adding authentication tokens for production deployments if needed.

## Files Modified

- `scripts/generate-version.js`: Script to generate version info
- `server.js`: Added `/api/version` endpoint
- `public/js/components/Library/WorkoutLibrary.jsx`: Updated version checking logic
- `public/service-worker.js`: Dynamic cache naming
- `package.json`: Added version generation to start scripts
- `.gitignore`: Excludes generated `version.json` file

## Migration from Old System

The old system used:
- Hardcoded version string ("v5")
- Service worker update detection only
- Manual version bumps in code

The new system is backwards compatible and will work immediately upon deployment.
