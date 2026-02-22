import config from './env.js';

// API Configuration
export const API_CONFIG = {
  baseURL: config.apiBaseUrl,
  timeout: config.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
  },
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  auth: {
    login: '/api/users/login',
    signup: '/api/users/signup',
    logout: '/api/users/logout',
  },
  
  // Users
  users: {
    profile: (query) => `/api/users/profile/${encodeURIComponent(query)}`,
    update: (id) => `/api/users/update/${id}`,
    suggested: '/api/users/suggested',
    search: '/api/users/Search',
    friends: '/api/users/friends',
    followers: '/api/users/followers',
    following: '/api/users/following',
    notifications: '/api/users/notifications',
    notificationsUnreadCount: '/api/users/notifications/unread-count',
    markNotificationRead: (id) => `/api/users/notifications/${id}/read`,
    markAllNotificationsRead: '/api/users/notifications/mark-all-read',
  },
  
  // Posts
  posts: {
    feed: '/api/posts/feed',
    create: '/api/posts/create',
    get: (id) => `/api/posts/${id}`,
    delete: (id) => `/api/posts/${id}`,
    like: (id) => `/api/posts/like/${id}`,
    reply: (id) => `/api/posts/reply/${id}`,
    userPosts: (username) => `/api/posts/user/${encodeURIComponent(username)}`,
  },
  
  // Messages
  messages: {
    conversations: '/api/messages/conversations',
    get: (otherUserId) => `/api/messages/${otherUserId}`,
    send: '/api/messages',
  },
};

// Socket Configuration
export const SOCKET_CONFIG = {
  url: config.socketUrl,
  options: {
    transports: ['websocket', 'polling'],
    timeout: 20000,
    forceNew: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    maxReconnectionAttempts: 5,
  },
};

// File Upload Configuration
export const UPLOAD_CONFIG = {
  maxFileSize: config.maxFileSize,
  allowedTypes: config.allowedFileTypes,
  maxFiles: 1,
};

// Rate Limiting Configuration
export const RATE_LIMIT_CONFIG = {
  api: config.apiRateLimit,
  upload: config.uploadRateLimit,
};

export default {
  API_CONFIG,
  API_ENDPOINTS,
  SOCKET_CONFIG,
  UPLOAD_CONFIG,
  RATE_LIMIT_CONFIG,
};