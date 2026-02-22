import { Server } from "socket.io";
import http from "http";
import express from "express";
import Message from "../models/messageModel.js";
import Conversation from "../models/conversationModel.js";

const app = express();
const server = http.createServer(app);

// Get CORS origins from environment variables
const getCorsOrigins = () => {
  if (process.env.NODE_ENV === "production") {
    const origins = [];
    
    // Add CLIENT_URL if specified
    if (process.env.CLIENT_URL) {
      origins.push(process.env.CLIENT_URL);
    }
    
    // Add RENDER_EXTERNAL_URL if specified
    if (process.env.RENDER_EXTERNAL_URL) {
      origins.push(process.env.RENDER_EXTERNAL_URL);
    }
    
    // Add ALLOWED_ORIGINS if specified
    if (process.env.ALLOWED_ORIGINS) {
      const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim());
      origins.push(...allowedOrigins);
    }
    
    // Default to Render URL pattern if no origins specified
    if (origins.length === 0) {
      origins.push("https://linknest-app.onrender.com");
    }
    
    return origins;
  }
  
  // Development origins
  return ["http://localhost:3000", "http://127.0.0.1:3000"];
};

const io = new Server(server, {
  cors: {
    origin: getCorsOrigins(),
    methods: ["GET", "POST"],
    credentials: true
  },
  pingTimeout: parseInt(process.env.SOCKET_PING_TIMEOUT) || 60000,
  pingInterval: parseInt(process.env.SOCKET_PING_INTERVAL) || 25000,
  transports: ['websocket', 'polling'],
  allowEIO3: true,
});

export const getRecipientSocketId = (recipientId) => {
  return userSocketMap[recipientId];
};

const userSocketMap = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  const userId = socket.handshake.query.userId;

  if (userId != "undefined") userSocketMap[userId] = socket.id;
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("markMessagesAsSeen", async ({ conversationId, userId }) => {
    try {
      await Message.updateMany(
        { conversationId: conversationId, seen: false },
        { $set: { seen: true } }
      );
      await Conversation.updateOne(
        { _id: conversationId },
        { $set: { "lastMessage.seen": true } }
      );
      io.to(userSocketMap[userId]).emit("messagesSeen", { conversationId });
    } catch (error) {
      console.error("Error marking messages as seen:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });

  // Handle connection errors
  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });
});

// Log socket configuration in development
if (process.env.NODE_ENV !== "production") {
  console.log("Socket.IO CORS origins:", getCorsOrigins());
}

export { io, server, app };
