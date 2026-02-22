# Render Deployment Checklist for LinkNest

## Pre-Deployment Setup

### 1. MongoDB Atlas Setup
- [ ] Create MongoDB Atlas account
- [ ] Create a new cluster
- [ ] Create database user with read/write permissions
- [ ] Whitelist all IP addresses (0.0.0.0/0) for Render
- [ ] Get connection string (MONGO_URI)

### 2. Cloudinary Setup
- [ ] Create Cloudinary account
- [ ] Get Cloud Name, API Key, and API Secret
- [ ] Configure upload presets if needed

### 3. Environment Variables
Prepare these environment variables for Render:

```
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/linknest
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLIENT_URL=https://your-app-name.onrender.com
```

## Render Deployment Steps

### 1. Repository Setup
- [ ] Push code to GitHub repository
- [ ] Ensure all files are committed including:
  - [ ] `package.json` (root)
  - [ ] `render.yaml`
  - [ ] Updated `server.js`
  - [ ] Updated `socket.js`

### 2. Render Configuration
- [ ] Go to [Render Dashboard](https://dashboard.render.com/)
- [ ] Click "New +" → "Web Service"
- [ ] Connect GitHub repository
- [ ] Configure service:
  - **Name:** `linknest-app` (or your preferred name)
  - **Environment:** `Node`
  - **Build Command:** `npm run build`
  - **Start Command:** `npm start`
  - **Plan:** Free or Starter

### 3. Environment Variables in Render
- [ ] Go to Environment tab in your service
- [ ] Add all environment variables listed above
- [ ] Make sure `CLIENT_URL` matches your Render app URL

### 4. Deploy
- [ ] Click "Create Web Service"
- [ ] Monitor build logs for any errors
- [ ] Wait for deployment to complete (usually 5-10 minutes)

## Post-Deployment Verification

### 1. Health Check
- [ ] Visit `https://your-app-name.onrender.com/health`
- [ ] Should return: `{"status":"OK","message":"LinkNest API is running"}`

### 2. Frontend Check
- [ ] Visit `https://your-app-name.onrender.com`
- [ ] Verify the React app loads correctly
- [ ] Check browser console for errors

### 3. API Testing
- [ ] Test user registration
- [ ] Test user login
- [ ] Test creating a post
- [ ] Test real-time messaging (if applicable)

### 4. Database Connection
- [ ] Check Render logs for "MongoDB Connected" message
- [ ] Verify data is being saved to MongoDB Atlas

## Common Issues & Solutions

### Build Failures
- **Issue:** `npm install` fails
- **Solution:** Check `package.json` syntax and dependencies

### Environment Variables
- **Issue:** App can't connect to MongoDB
- **Solution:** Verify `MONGO_URI` is correct and IP whitelist includes 0.0.0.0/0

### Socket.io Issues
- **Issue:** Real-time features not working
- **Solution:** Ensure `CLIENT_URL` environment variable is set correctly

### Static Files Not Serving
- **Issue:** React app shows 404 or blank page
- **Solution:** Verify build process completed and `frontend/dist` exists

## Performance Optimization

### For Free Tier
- [ ] App will sleep after 15 minutes of inactivity
- [ ] First request after sleep takes 30+ seconds (cold start)
- [ ] Consider upgrading to Starter plan for better performance

### Monitoring
- [ ] Set up Render service monitoring
- [ ] Monitor application logs regularly
- [ ] Set up error tracking (optional)

## Maintenance

### Updates
- [ ] Push changes to GitHub
- [ ] Render will auto-deploy from main branch
- [ ] Monitor deployment logs

### Scaling
- [ ] Monitor resource usage in Render dashboard
- [ ] Upgrade plan if needed for higher traffic

## Support Resources

- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Cloudinary Documentation](https://cloudinary.com/documentation)

---

**Note:** Replace `your-app-name` with your actual Render app name throughout this checklist.