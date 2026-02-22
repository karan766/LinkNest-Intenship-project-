// Environment configuration utility
const getEnvVar = (name, defaultValue = '') => {
  const value = import.meta.env[name];
  if (value === undefined && defaultValue === '') {
    console.warn(`Environment variable ${name} is not defined`);
  }
  return value || defaultValue;
};

const getBooleanEnvVar = (name, defaultValue = false) => {
  const value = import.meta.env[name];
  if (value === undefined) return defaultValue;
  return value === 'true' || value === '1';
};

const getNumberEnvVar = (name, defaultValue = 0) => {
  const value = import.meta.env[name];
  if (value === undefined) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

const getArrayEnvVar = (name, defaultValue = []) => {
  const value = import.meta.env[name];
  if (value === undefined) return defaultValue;
  return value.split(',').map(item => item.trim());
};

// App Configuration
export const config = {
  // API Configuration
  apiBaseUrl: getEnvVar('VITE_API_BASE_URL', 'http://localhost:5000'),
  apiTimeout: getNumberEnvVar('VITE_API_TIMEOUT', 10000),
  socketUrl: getEnvVar('VITE_SOCKET_URL', 'http://localhost:5000'),

  // App Information
  appName: getEnvVar('VITE_APP_NAME', 'LinkNest'),
  appVersion: getEnvVar('VITE_APP_VERSION', '1.0.0'),
  appDescription: getEnvVar('VITE_APP_DESCRIPTION', 'Social networking platform'),
  
  // Environment
  nodeEnv: getEnvVar('VITE_NODE_ENV', 'development'),
  isDevelopment: getEnvVar('VITE_NODE_ENV', 'development') === 'development',
  isProduction: getEnvVar('VITE_NODE_ENV', 'development') === 'production',

  // Render Deployment
  renderExternalUrl: getEnvVar('VITE_RENDER_EXTERNAL_URL'),
  renderInternalUrl: getEnvVar('VITE_RENDER_INTERNAL_URL'),

  // Feature Flags
  enableAnalytics: getBooleanEnvVar('VITE_ENABLE_ANALYTICS', false),
  enableErrorReporting: getBooleanEnvVar('VITE_ENABLE_ERROR_REPORTING', false),
  enablePWA: getBooleanEnvVar('VITE_ENABLE_PWA', false),
  enableServiceWorker: getBooleanEnvVar('VITE_ENABLE_SERVICE_WORKER', false),
  enableLazyLoading: getBooleanEnvVar('VITE_ENABLE_LAZY_LOADING', true),

  // Security
  enableHttpsOnly: getBooleanEnvVar('VITE_ENABLE_HTTPS_ONLY', false),
  enableCSP: getBooleanEnvVar('VITE_ENABLE_CONTENT_SECURITY_POLICY', false),

  // Social Media
  googleClientId: getEnvVar('VITE_GOOGLE_CLIENT_ID'),
  facebookAppId: getEnvVar('VITE_FACEBOOK_APP_ID'),

  // Analytics
  gaTrackingId: getEnvVar('VITE_GA_TRACKING_ID'),
  hotjarId: getEnvVar('VITE_HOTJAR_ID'),

  // Error Reporting
  sentryDsn: getEnvVar('VITE_SENTRY_DSN'),
  sentryEnvironment: getEnvVar('VITE_SENTRY_ENVIRONMENT', 'development'),

  // CDN
  cdnUrl: getEnvVar('VITE_CDN_URL'),
  staticAssetsUrl: getEnvVar('VITE_STATIC_ASSETS_URL'),

  // File Upload
  maxFileSize: getNumberEnvVar('VITE_MAX_FILE_SIZE', 5242880), // 5MB default, 10MB for production
  allowedFileTypes: getArrayEnvVar('VITE_ALLOWED_FILE_TYPES', ['image/jpeg', 'image/png', 'image/gif', 'image/webp']),

  // Rate Limiting
  apiRateLimit: getNumberEnvVar('VITE_API_RATE_LIMIT', 100),
  uploadRateLimit: getNumberEnvVar('VITE_UPLOAD_RATE_LIMIT', 10),

  // Cache
  cacheDuration: getNumberEnvVar('VITE_CACHE_DURATION', 3600000), // 1 hour
  staticCacheDuration: getNumberEnvVar('VITE_STATIC_CACHE_DURATION', 86400000), // 24 hours

  // Socket.IO Configuration
  socketTransports: getArrayEnvVar('VITE_SOCKET_TRANSPORTS', ['websocket', 'polling']),
  socketTimeout: getNumberEnvVar('VITE_SOCKET_TIMEOUT', 20000),
  socketReconnectionAttempts: getNumberEnvVar('VITE_SOCKET_RECONNECTION_ATTEMPTS', 5),
  socketReconnectionDelay: getNumberEnvVar('VITE_SOCKET_RECONNECTION_DELAY', 1000),

  // PWA
  pwa: {
    name: getEnvVar('VITE_PWA_NAME', 'LinkNest'),
    shortName: getEnvVar('VITE_PWA_SHORT_NAME', 'LinkNest'),
    themeColor: getEnvVar('VITE_PWA_THEME_COLOR', '#1a202c'),
    backgroundColor: getEnvVar('VITE_PWA_BACKGROUND_COLOR', '#ffffff'),
  },

  // Performance
  enableCompression: getBooleanEnvVar('VITE_ENABLE_COMPRESSION', true),
  enableTreeShaking: getBooleanEnvVar('VITE_ENABLE_TREE_SHAKING', true),
  enableCodeSplitting: getBooleanEnvVar('VITE_ENABLE_CODE_SPLITTING', true),

  // Development
  enableDevtools: getBooleanEnvVar('VITE_ENABLE_DEVTOOLS', false),
  enableHotReload: getBooleanEnvVar('VITE_ENABLE_HOT_RELOAD', true),
  enableDebugLogs: getBooleanEnvVar('VITE_ENABLE_DEBUG_LOGS', false),
};

// Validation
const validateConfig = () => {
  const requiredVars = [
    'VITE_API_BASE_URL',
    'VITE_SOCKET_URL',
  ];

  const missing = requiredVars.filter(varName => !import.meta.env[varName]);
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing);
    if (config.isProduction) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }
};

// Run validation
validateConfig();

export default config;