# LinkNest - Social Media Platform

A modern, full-stack social media platform built with React, Node.js, Express, and MongoDB.

## Features

- 🔐 User authentication and authorization
- 📝 Create, edit, and delete posts
- 💬 Real-time messaging with Socket.io
- 👥 Follow/unfollow users
- ❤️ Like and comment on posts
- 🌓 Dark/Light mode support
- 📱 Responsive design
- ☁️ Image upload with Cloudinary
- 🔄 Real-time notifications

## Tech Stack

**Frontend:**
- React 18
- Chakra UI
- Recoil (State Management)
- Socket.io Client
- React Router DOM
- Vite

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- Socket.io
- JWT Authentication
- Cloudinary (Image Storage)
- bcryptjs (Password Hashing)

## Deployment on Render

### Prerequisites

1. MongoDB Atlas account (for database)
2. Cloudinary account (for image storage)
3. Render account

### Environment Variables

Set these environment variables in your Render dashboard:

```
NODE_ENV=production
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Deploy Steps

1. **Fork/Clone this repository**

2. **Connect to Render:**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

3. **Configure the service:**
   - **Name:** `linknest-app`
   - **Environment:** `Node`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free (or paid for better performance)

4. **Add Environment Variables:**
   - Go to Environment tab
   - Add all the required environment variables listed above

5. **Deploy:**
   - Click "Create Web Service"
   - Wait for the build and deployment to complete

### Local Development

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd LinkNest
   ```

2. **Install dependencies:**
   ```bash
   npm run install-deps
   ```

3. **Set up environment variables:**
   - Create `.env` file in the `backend` directory
   - Add all required environment variables

4. **Run the application:**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend server on http://localhost:5000
   - Frontend development server on http://localhost:3000

## Project Structure

```
LinkNest/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── socket/
│   ├── db/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── atoms/
│   │   └── context/
│   └── dist/ (build output)
├── package.json
└── render.yaml
```

## API Endpoints

- `GET /health` - Health check
- `POST /api/users/signup` - User registration
- `POST /api/users/login` - User login
- `GET /api/posts/feed` - Get user feed
- `POST /api/posts` - Create new post
- `GET /api/messages/:userId` - Get messages
- And more...

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.