# Build Troubleshooting Guide for Render Deployment

## Current Issue: "vite: not found" Error

### Root Cause
The build is failing because Vite is not available during the build process. This happens when:
1. Vite is in `devDependencies` but Render doesn't install dev dependencies by default
2. The build process doesn't properly install frontend dependencies

### Solutions Applied

#### 1. Moved Vite to Dependencies
- Moved `vite` and `@vitejs/plugin-react` from `devDependencies` to `dependencies` in `frontend/package.json`
- This ensures Vite is available during production builds

#### 2. Updated Build Commands
- Root `package.json`: Uses `npm ci` with `--include=dev` flag
- `render.yaml`: Uses dedicated build script for better control
- `build.sh`: Comprehensive build script with error handling

#### 3. Build Process Flow
```bash
1. Install backend dependencies: npm ci --prefix backend
2. Install frontend dependencies: npm ci --prefix frontend (includes dev deps)
3. Build frontend: npm run build --prefix frontend
4. Start backend: npm start --prefix backend
```

## Alternative Solutions

### Option 1: Simple Build Command (Recommended)
Update `render.yaml` buildCommand to:
```yaml
buildCommand: npm ci --prefix backend && npm ci --prefix frontend && npm run build --prefix frontend
```

### Option 2: Use NPM Scripts
Keep the current root `package.json` build script:
```json
"build": "npm ci --prefix backend && npm ci --prefix frontend --include=dev && npm run build --prefix frontend"
```

Then use in `render.yaml`:
```yaml
buildCommand: npm run build
```

### Option 3: Environment Variable Approach
Set environment variable in Render:
```
NPM_CONFIG_INCLUDE=dev
```

## Verification Steps

### 1. Local Build Test
```bash
# Clean everything
rm -rf backend/node_modules frontend/node_modules frontend/dist

# Test the build process
npm ci --prefix backend
npm ci --prefix frontend
npm run build --prefix frontend

# Verify output
ls -la frontend/dist/
```

### 2. Check Dependencies
```bash
# In frontend directory
npm list vite
npm list @vitejs/plugin-react
```

### 3. Test Build Script
```bash
# Make executable (if using build.sh)
chmod +x build.sh

# Run build script
./build.sh
```

## Common Build Issues & Solutions

### Issue 1: "vite: not found"
**Solution**: Ensure Vite is in `dependencies`, not `devDependencies`

### Issue 2: "Module not found" errors
**Solution**: Run `npm ci` instead of `npm install` for consistent builds

### Issue 3: Build timeout
**Solution**: Optimize build process, remove unnecessary dependencies

### Issue 4: Memory issues
**Solution**: Increase Node.js memory limit:
```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### Issue 5: Permission errors
**Solution**: Ensure build script has execute permissions

## Render-Specific Considerations

### 1. Build Environment
- Render uses Ubuntu-based containers
- Node.js version specified in `engines` field
- Build runs in `/opt/render/project/src`

### 2. File Permissions
- Build scripts need execute permissions
- Use `chmod +x script.sh` in buildCommand if needed

### 3. Environment Variables
- Build-time variables must be set in Render dashboard
- Runtime variables are loaded from `.env` files

### 4. Build Caching
- Render caches `node_modules` between builds
- Use `npm ci` for consistent, clean installs

## Debugging Commands

### Check Build Environment
```bash
# In buildCommand, add these for debugging:
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "Current directory: $(pwd)"
echo "Directory contents: $(ls -la)"
```

### Check Dependencies
```bash
# Check if Vite is installed
npm list vite --prefix frontend
npx vite --version --prefix frontend
```

### Check Build Output
```bash
# Verify frontend build
ls -la frontend/dist/
cat frontend/dist/index.html | head -20
```

## Recommended Build Configuration

### Final `render.yaml` (Recommended)
```yaml
services:
  - type: web
    name: linknest-app
    env: node
    plan: free
    buildCommand: npm ci --prefix backend && npm ci --prefix frontend && npm run build --prefix frontend
    startCommand: npm start --prefix backend
    healthCheckPath: /health
    # ... rest of configuration
```

### Final `package.json` (Root)
```json
{
  "scripts": {
    "build": "npm ci --prefix backend && npm ci --prefix frontend && npm run build --prefix frontend",
    "start": "npm start --prefix backend"
  }
}
```

### Final `frontend/package.json`
```json
{
  "dependencies": {
    // ... other dependencies
    "vite": "^4.4.0",
    "@vitejs/plugin-react": "^4.0.1"
  },
  "devDependencies": {
    // ... other dev dependencies (excluding vite)
  }
}
```

## Next Steps

1. **Commit Changes**: Push the updated package.json files
2. **Redeploy**: Trigger a new deployment on Render
3. **Monitor Build**: Watch the build logs for success
4. **Test Application**: Verify the app works after deployment

## Support Resources

- [Render Build Documentation](https://render.com/docs/builds)
- [Vite Build Documentation](https://vitejs.dev/guide/build.html)
- [Node.js on Render](https://render.com/docs/node-version)