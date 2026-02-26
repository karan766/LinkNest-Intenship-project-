# Project Structure

## Root Level

```
linknest-app/
├── backend/           # Node.js/Express API server
├── frontend/          # React/Vite client application
├── package.json       # Root package with workspace scripts
├── render.yaml        # Render deployment configuration
└── build.sh           # Build script for deployment
```

## Backend Structure

```
backend/
├── controllers/       # Request handlers and business logic
│   ├── messageController.js
│   ├── postController.js
│   └── userController.js
├── models/           # Mongoose schemas and models
│   ├── conversationModel.js
│   ├── messageModel.js
│   ├── notificationModel.js
│   ├── postModel.js
│   └── userModel.js
├── routes/           # Express route definitions
├── middlewares/      # Custom middleware (auth, validation)
│   └── protectRoute.js
├── socket/           # Socket.io configuration and handlers
│   └── socket.js
├── db/               # Database connection setup
│   └── connectDB.js
├── cron/             # Scheduled tasks
│   └── cron.js
├── utils/            # Helper functions and utilities
│   └── helpers/
│       └── generateTokenAndSetCookie.js
├── scripts/          # Database migration and utility scripts
│   └── migrateUsers.js
└── server.js         # Application entry point
```

## Frontend Structure

```
frontend/
├── src/
│   ├── components/   # Reusable React components
│   │   ├── Actions.jsx
│   │   ├── Comment.jsx
│   │   ├── Conversation.jsx
│   │   ├── CreatePost.jsx
│   │   ├── ErrorBoundary.jsx
│   │   ├── Header.jsx
│   │   ├── LoginCard.jsx
│   │   ├── LogoutButton.jsx
│   │   ├── Message.jsx
│   │   ├── MessageContainer.jsx
│   │   ├── MessageInput.jsx
│   │   ├── Post.jsx
│   │   ├── Search.jsx
│   │   ├── SignupCard.jsx
│   │   ├── UserHeader.jsx
│   │   └── UserPost.jsx
│   ├── pages/        # Route-level page components
│   │   ├── AuthPage.jsx
│   │   ├── ChatPage.jsx
│   │   ├── FollowerPage.jsx
│   │   ├── FriendsPage.jsx
│   │   ├── HomePage.jsx
│   │   ├── NotificationPage.jsx
│   │   ├── PostPage.jsx
│   │   ├── SettingsPage.jsx
│   │   ├── UpdateProfilePage.jsx
│   │   └── UserPage.jsx
│   ├── atoms/        # Recoil state atoms
│   │   ├── authAtom.js
│   │   ├── messagesAtom.js
│   │   ├── postsAtom.js
│   │   └── userAtom.js
│   ├── context/      # React context providers
│   │   └── SocketContext.jsx
│   ├── hooks/        # Custom React hooks
│   │   ├── useFollowUnfollow.js
│   │   ├── useGetUserProfile.js
│   │   ├── useLogout.js
│   │   ├── usePreviewImg.js
│   │   └── useShowToast.js
│   ├── config/       # Configuration files
│   │   ├── api.js
│   │   └── env.js
│   ├── assets/       # Static assets
│   │   ├── icons/
│   │   └── sounds/
│   ├── styles/       # Global styles
│   │   └── responsive.css
│   ├── App.jsx       # Root component with routing
│   ├── main.jsx      # Application entry point
│   └── index.css     # Global CSS
├── public/           # Static public assets
├── dist/             # Production build output (generated)
├── scripts/          # Build and deployment scripts
│   ├── deploy.js
│   └── verify-build.js
└── vite.config.js    # Vite configuration
```

## Architecture Patterns

### Backend Patterns

- **MVC-like structure**: Controllers handle requests, Models define data schemas, Routes define endpoints
- **Middleware chain**: Authentication via `protectRoute` middleware on protected routes
- **Centralized error handling**: Controllers use try-catch with consistent error responses
- **ES modules**: All files use `import`/`export` syntax with `.js` extensions
- **Socket.io integration**: Separate socket instance exported from `socket/socket.js`, shared with Express app

### Frontend Patterns

- **Component-based architecture**: Reusable components in `/components`, page-level in `/pages`
- **State management**: Recoil atoms for global state (user, posts, messages, auth)
- **Custom hooks**: Encapsulate reusable logic (API calls, side effects)
- **Context providers**: SocketContext wraps app for WebSocket access
- **Protected routes**: Route guards check user authentication state
- **Responsive design**: Chakra UI responsive props + custom CSS for mobile/desktop

### Data Flow

1. **Authentication**: JWT stored in httpOnly cookies, user state in Recoil atom
2. **API calls**: Frontend → `/api/*` → Backend controllers → MongoDB
3. **Real-time updates**: Socket.io events for messages, notifications, online status
4. **Image uploads**: Client → Cloudinary API → URL stored in MongoDB
5. **State updates**: API response → Recoil atom update → Component re-render

## File Naming Conventions

- **Backend**: camelCase for files (e.g., `userController.js`, `postModel.js`)
- **Frontend components**: PascalCase for files (e.g., `UserHeader.jsx`, `ChatPage.jsx`)
- **Frontend utilities**: camelCase for files (e.g., `useShowToast.js`, `authAtom.js`)
- **Configuration**: kebab-case or dot notation (e.g., `vite.config.js`, `.env.production`)

## Import Conventions

### Backend
```javascript
// Always include .js extension
import User from "./models/userModel.js";
import { protectRoute } from "./middlewares/protectRoute.js";
```

### Frontend
```javascript
// No extension needed (Vite handles resolution)
import UserHeader from "../components/UserHeader";
import userAtom from "../atoms/userAtom";
```

## Environment-Specific Files

- **Backend**: Single `.env` file with `NODE_ENV` variable
- **Frontend**: Multiple env files (`.env.development`, `.env.production`, `.env.staging`)
- **Vite**: Automatically loads correct env file based on `--mode` flag
