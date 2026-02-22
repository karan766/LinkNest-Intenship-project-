# Environment Setup Guide for LinkNest Frontend

## Overview
This guide explains how to set up environment variables for different deployment environments.

## Environment Files

### `.env` (Production)
Main production environment file with all production-ready configurations.

### `.env.development` (Development)
Local development environment with relaxed security and debugging enabled.

### `.env.staging` (Staging)
Staging environment for testing production-like configurations.

### `.env.example`
Template file showing all available environment variables.

## Required Environment Variables

### Essential Variables (Must be configured)
```bash
VITE_API_BASE_URL=https://your-backend-domain.com
VITE_SOCKET_URL=https://your-backend-domain.com
```

### App Configuration
```bash
VITE_APP_NAME=LinkNest
VITE_APP_VERSION=1.0.0
VITE_NODE_ENV=production
```

## Optional Environment Variables

### Social Media Integration
```bash
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_FACEBOOK_APP_ID=your-facebook-app-id
```

### Analytics
```bash
VITE_GA_TRACKING_ID=your-google-analytics-id
VITE_HOTJAR_ID=your-hotjar-id
```

### Error Reporting
```bash
VITE_SENTRY_DSN=your-sentry-dsn
VITE_SENTRY_ENVIRONMENT=production
```

### CDN Configuration
```bash
VITE_CDN_URL=https://your-cdn-domain.com
VITE_STATIC_ASSETS_URL=https://your-cdn-domain.com/assets
```

## Setup Instructions

### 1. Local Development
```bash
# Copy the development template
cp .env.development .env.local

# Update the API URLs if your backend runs on different ports
VITE_API_BASE_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### 2. Production Deployment
```bash
# Copy the production template
cp .env .env.production

# Update with your actual production URLs
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_SOCKET_URL=https://api.yourdomain.com
```

### 3. Staging Environment
```bash
# Copy the staging template
cp .env.staging .env.staging.local

# Update with your staging URLs
VITE_API_BASE_URL=https://staging-api.yourdomain.com
VITE_SOCKET_URL=https://staging-api.yourdomain.com
```

## Build Commands

### Development Build
```bash
npm run build:dev
```

### Staging Build
```bash
npm run build:staging
```

### Production Build
```bash
npm run build
```

## Environment Variable Usage in Code

Import the configuration utility:
```javascript
import config from './config/env.js';

// Use environment variables
const apiUrl = config.apiBaseUrl;
const isProduction = config.isProduction;
const enableAnalytics = config.enableAnalytics;
```

## Security Best Practices

1. **Never commit sensitive data** to version control
2. **Use different values** for each environment
3. **Validate required variables** before deployment
4. **Use HTTPS** in production environments
5. **Enable CSP** for additional security

## Deployment Checklist

### Before Production Deployment
- [ ] All required environment variables are set
- [ ] API URLs point to production backend
- [ ] Analytics tracking IDs are configured
- [ ] Error reporting is enabled
- [ ] HTTPS is enforced
- [ ] Service worker is enabled
- [ ] Source maps are disabled
- [ ] Debug logs are disabled

### Verification
```bash
# Check if all required variables are set
npm run build

# Preview the production build
npm run preview:build

# Analyze bundle size
npm run analyze
```

## Troubleshooting

### Common Issues

1. **API calls failing**
   - Check `VITE_API_BASE_URL` is correct
   - Verify backend is accessible from frontend domain

2. **Socket connection issues**
   - Ensure `VITE_SOCKET_URL` matches backend
   - Check CORS settings on backend

3. **Build failures**
   - Verify all required environment variables are set
   - Check for syntax errors in .env files

4. **Missing environment variables**
   - Check console for validation warnings
   - Ensure .env file is in the correct location

### Debug Commands
```bash
# Check environment variables
npm run dev -- --debug

# Verbose build output
npm run build -- --debug

# Check bundle analysis
npm run analyze
```

## Environment Variable Reference

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `VITE_API_BASE_URL` | string | `http://localhost:5000` | Backend API base URL |
| `VITE_SOCKET_URL` | string | `http://localhost:5000` | Socket.IO server URL |
| `VITE_APP_NAME` | string | `LinkNest` | Application name |
| `VITE_NODE_ENV` | string | `development` | Environment mode |
| `VITE_ENABLE_ANALYTICS` | boolean | `false` | Enable analytics tracking |
| `VITE_MAX_FILE_SIZE` | number | `5242880` | Max file upload size (bytes) |
| `VITE_ENABLE_PWA` | boolean | `false` | Enable PWA features |

For a complete list of all available variables, see `.env.example`.