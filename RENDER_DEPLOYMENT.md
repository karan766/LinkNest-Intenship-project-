# Render Deployment Guide for LinkNest

## Overview
This guide covers deploying LinkNest as a single application on Render, where the backend serves both the API and the frontend static files.

## Architecture
- **Single App Deployment**: Backend serves frontend static files
- **Port**: 10000 (Render's default)
- **Domain**: `https://linknest-app.onrender.com`
- **Database**: MongoDB Atlas (external)
- **File Storage**: Cloudinary (external)

## Environment Variables Setup

### Required Environment Variables (Must be set in Render Dashboard)

#### Database
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database
```

#### Authentication
```
JWT_SECRET=your-super-secure-jwt-secret-here
SESSION_SECRET=your-session-secret-here
COOKIE_SECRET=your-cookie-secret-here
```

#### Cloudinary (File Storage)
```
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

### Automatic Environment Variables (Set by render.yaml)

#### Core Configuration
- `NODE_ENV=production`
- `PORT=10000`
- `CLIENT_URL=https://linknest-app.onrender.com`
- `RENDER_EXTERNAL_URL=https://linknest-app.onrender.com`

#### Security & Performance
- `ALLOWED_ORIGINS=https://linknest-app.onrender.com`
- `ENABLE_HELMET=true`
- `ENABLE_CORS=true`
- `ENABLE_RATE_LIMITING=true`

#### File Upload Limits
- `MAX_FILE_SIZE=10485760` (10MB)
- `ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp`

#### Socket.IO Configuration
- `SOCKET_CORS_ORIGIN=https://linknest-app.onrender.com`
- `SOCKET_PING_TIMEOUT=60000`
- `SOCKET_PING_INTERVAL=25000`

## Deployment Steps

### 1. Prepare Repository
```bash
# Ensure all files are committed
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### 2. Create Render Service
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Use these settings:
   - **Name**: `linknest-app`
   - **Environment**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Free` (or upgrade as needed)

### 3. Configure Environment Variables
In Render Dashboard → Environment:

#### Required (Add these manually):
```
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
SESSION_SECRET=your-session-secret
COOKIE_SECRET=your-cookie-secret
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
```

#### Optional (for enhanced features):
```
# Analytics (if using)
GA_TRACKING_ID=your-google-analytics-id

# Error Reporting (if using Sentry)
SENTRY_DSN=your-sentry-dsn

# Social Login (if implementing)
GOOGLE_CLIENT_ID=your-google-client-id
FACEBOOK_APP_ID=your-facebook-app-id
```

### 4. Deploy
1. Click "Create Web Service"
2. Render will automatically deploy using the `render.yaml` configuration
3. Monitor the build logs for any issues

## Build Process
The deployment follows this sequence:
1. `npm run build` (installs deps for both frontend/backend, builds frontend)
2. `npm start` (starts the backend server)
3. Backend serves frontend static files from `/frontend/dist`
4. All API routes are prefixed with `/api`
5. All other routes serve the React app

## URL Structure
- **Frontend**: `https://linknest-app.onrender.com`
- **API**: `https://linknest-app.onrender.com/api/*`
- **Socket.IO**: `https://linknest-app.onrender.com/socket.io/*`
- **Health Check**: `https://linknest-app.onrender.com/health`

## Verification Steps

### 1. Check Health Endpoint
```bash
curl https://linknest-app.onrender.com/health
```
Should return:
```json
{
  "status": "OK",
  "message": "LinkNest API is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 2. Test Frontend
Visit `https://linknest-app.onrender.com` - should load the React app

### 3. Test API
```bash
curl https://linknest-app.onrender.com/api/users/suggested
```

### 4. Check Socket.IO
Open browser dev tools → Network → WS tab
Should see successful WebSocket connection to `/socket.io/`

## Troubleshooting

### Common Issues

#### 1. Build Failures
- Check that all dependencies are in `package.json`
- Verify Node.js version compatibility
- Check build logs for specific errors

#### 2. Environment Variable Issues
- Ensure all required variables are set in Render dashboard
- Check for typos in variable names
- Verify MongoDB connection string format

#### 3. Socket.IO Connection Issues
- Check CORS configuration in backend
- Verify `CLIENT_URL` matches your Render domain
- Check browser console for connection errors

#### 4. File Upload Issues
- Verify Cloudinary credentials
- Check file size limits
- Ensure allowed file types are correct

#### 5. Database Connection Issues
- Verify MongoDB Atlas allows connections from `0.0.0.0/0`
- Check connection string format
- Ensure database user has proper permissions

### Debug Commands
```bash
# Check environment variables (in Render shell)
printenv | grep -E "(MONGO|JWT|CLOUDINARY)"

# Check if frontend build exists
ls -la frontend/dist/

# Check server logs
tail -f /var/log/render.log
```

## Performance Optimization

### 1. Enable Compression
The backend automatically serves compressed static files in production.

### 2. CDN (Optional)
For better performance, consider using a CDN:
1. Upload static assets to a CDN
2. Update `VITE_CDN_URL` environment variable
3. Configure asset URLs in frontend

### 3. Database Optimization
- Use MongoDB Atlas in the same region as Render
- Enable database connection pooling
- Add appropriate database indexes

## Security Considerations

### 1. Environment Variables
- Never commit sensitive data to Git
- Use strong, unique secrets for JWT and sessions
- Rotate secrets regularly

### 2. CORS Configuration
- Only allow your domain in CORS origins
- Don't use wildcards in production

### 3. Rate Limiting
- Configured automatically via environment variables
- Adjust limits based on your needs

### 4. HTTPS
- Render provides HTTPS automatically
- All cookies are secure in production

## Monitoring

### 1. Health Checks
Render automatically monitors the `/health` endpoint

### 2. Logs
Access logs via Render Dashboard → Logs

### 3. Metrics
Monitor via Render Dashboard → Metrics:
- Response times
- Memory usage
- CPU usage
- Request volume

## Scaling

### 1. Vertical Scaling
Upgrade Render plan for more resources:
- Starter: 0.5 CPU, 512MB RAM
- Standard: 1 CPU, 2GB RAM
- Pro: 2 CPU, 4GB RAM

### 2. Database Scaling
Upgrade MongoDB Atlas cluster as needed

### 3. File Storage
Cloudinary scales automatically

## Backup Strategy

### 1. Database
- MongoDB Atlas provides automatic backups
- Consider additional backup strategies for critical data

### 2. File Storage
- Cloudinary provides redundancy
- Consider backup policies for uploaded media

### 3. Code
- Keep Git repository as source of truth
- Tag releases for easy rollbacks

## Support

### Getting Help
1. Check Render documentation
2. Review application logs
3. Check this deployment guide
4. Contact support if needed

### Useful Links
- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Cloudinary Documentation](https://cloudinary.com/documentation)