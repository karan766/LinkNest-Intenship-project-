# Technology Stack

## Frontend

- **Framework**: React 18 with Vite build tool
- **UI Library**: Chakra UI with Emotion for styling
- **State Management**: Recoil for global state
- **Routing**: React Router DOM v6
- **Real-time**: Socket.io Client
- **Styling**: Tailwind CSS + PostCSS + Autoprefixer
- **Icons**: React Icons + Chakra UI Icons
- **Utilities**: date-fns for date formatting

## Backend

- **Runtime**: Node.js (>=18.0.0)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken) + bcryptjs
- **Real-time**: Socket.io
- **File Upload**: Cloudinary SDK
- **Task Scheduling**: cron for scheduled jobs
- **Environment**: dotenv for configuration

## Development Tools

- **Package Manager**: npm (>=8.0.0)
- **Linting**: ESLint with React plugins
- **Dev Server**: Vite dev server (frontend), nodemon (backend)
- **Concurrency**: concurrently for running multiple processes

## Common Commands

### Development
```bash
# Install all dependencies (root, backend, frontend)
npm run install-deps

# Run both frontend and backend in development mode
npm run dev

# Run backend only
npm run dev --prefix backend

# Run frontend only
npm run dev --prefix frontend
```

### Building
```bash
# Build for production (cleans, installs, builds frontend)
npm run build

# Build frontend only
npm run build:frontend

# Build backend only (production dependencies)
npm run build:backend

# Verify build integrity
npm run build:verify --prefix frontend
```

### Testing & Linting
```bash
# Run all tests
npm test

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix --prefix frontend
```

### Deployment
```bash
# Start production server
npm start

# Deploy to Render (uses build + start)
npm run deploy:render

# Clean all dependencies and build artifacts
npm run clean
```

### Frontend-Specific
```bash
# Build for different environments
npm run build:dev --prefix frontend
npm run build:staging --prefix frontend
npm run build --prefix frontend  # production

# Preview production build locally
npm run preview --prefix frontend

# Analyze bundle size
npm run analyze --prefix frontend
```

## Build System

- **Frontend**: Vite with manual chunk splitting for optimal loading
  - Separate chunks: vendor (React), chakra (UI), router, icons, socket, utils
  - Environment-based configuration via .env files
  - Proxy setup for API and WebSocket in development
  
- **Backend**: Standard Node.js with ES modules (type: "module")
  - Production uses only production dependencies
  - Static file serving for frontend build in production

## Environment Variables

### Backend (.env)
- `NODE_ENV`: development/production
- `PORT`: Server port (default: 5000)
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret for JWT signing
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

### Frontend (.env.development, .env.production, .env.staging)
- `VITE_API_BASE_URL`: Backend API URL
- `VITE_SOCKET_URL`: WebSocket server URL
- `VITE_APP_VERSION`: Application version
- `VITE_BUILD_SOURCEMAP`: Enable/disable sourcemaps
- `VITE_BUILD_MINIFY`: Enable/disable minification
- `VITE_CHUNK_SIZE_WARNING_LIMIT`: Bundle size warning threshold

## Module System

- Backend uses ES modules (`import`/`export`)
- Frontend uses ES modules with JSX
- File extensions required in backend imports (`.js`)
