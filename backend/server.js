import express, { json } from "express";
import { connect, model } from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import questionRoutes from "./routes/questions.js";
import commentRoutes from "./routes/comments.js";
import chatRoutes from "./routes/chat.js";
import Chat from "./models/Chat.js"; // Ensure Chat model is imported
import { errorHandler, notFound } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();
app.use(cookieParser());
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5002",
  'https://junior-senior-app.vercel.app/'
];

// Middleware
const corsOptions = {
  origin: allowedOrigins, // Allow frontend URLs
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization", "x-auth-token"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(json());

// Database connection
connect(process.env.MONGODB_URI || "mongodb://localhost:27017/qa_platform")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Root route - API status endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Q&A Chat Platform API',
    status: 'Server is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      questions: '/api/questions',
      comments: '/api/comments',
      chats: '/api/chats'
    }
  });
});

// Health check endpoint (commonly used by deployment platforms)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/chats", chatRoutes);

// Error handling middleware (must be after routes)
app.use(notFound);
app.use(errorHandler);

// Socket.io connection for real-time chat
io.on("connection", (socket) => {
  console.log("New client connected");

  // Authenticate user via token
  socket.on("authenticate", (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.join(`user:${decoded.id}`);
      console.log(`User ${decoded.id} authenticated`);
    } catch (error) {
      console.error("Authentication error:", error);
    }
  });

  // Join a chat room
  socket.on("joinChat", (chatId) => {
    socket.join(`chat:${chatId}`);
    console.log(`User ${socket.userId} joined chat ${chatId}`);
  });

  // Send a message
  socket.on("sendMessage", async ({ chatId, content }) => {
    if (!socket.userId) return;

    try {
      const chat = await Chat.findById(chatId);

      if (!chat || !chat.participants.includes(socket.userId)) {
        return;
      }

      const newMessage = {
        sender: socket.userId,
        content,
        timestamp: new Date(),
        read: false,
      };

      chat.messages.push(newMessage);
      chat.lastActivity = new Date();
      await chat.save();

      io.to(`chat:${chatId}`).emit("newMessage", {
        chatId,
        message: newMessage,
      });

      // Notify other participant
      chat.participants.forEach((participantId) => {
        if (participantId.toString() !== socket.userId) {
          io.to(`user:${participantId}`).emit("messageNotification", {
            chatId,
            senderId: socket.userId,
          });
        }
      });
    } catch (error) {
      console.error("Send message error:", error);
    }
  });

  // Mark messages as read
  socket.on("markAsRead", async ({ chatId }) => {
    if (!socket.userId) return;

    try {
      const chat = await Chat.findById(chatId);

      if (!chat || !chat.participants.includes(socket.userId)) {
        return;
      }

      let updated = false;
      chat.messages.forEach((msg) => {
        if (msg.sender.toString() !== socket.userId && !msg.read) {
          msg.read = true;
          updated = true;
        }
      });

      if (updated) {
        await chat.save();

        // Notify sender that messages were read
        chat.participants.forEach((participantId) => {
          if (participantId.toString() !== socket.userId) {
            io.to(`user:${participantId}`).emit("messagesRead", {
              chatId,
              readerId: socket.userId,
            });
          }
        });
      }
    } catch (error) {
      console.error("Mark as read error:", error);
    }
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Start server
const PORT = process.env.PORT || 5002;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`API available at: http://localhost:${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('Unhandled Promise Rejection:', err.message);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  process.exit(1);
});
