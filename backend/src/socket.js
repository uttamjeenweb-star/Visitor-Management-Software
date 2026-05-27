import { Server } from "socket.io";
import { verifyAccessToken } from "./utils/jwt.utils.js";
import logger from "./utils/logger.utils.js";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      const decoded = verifyAccessToken(token);
      if (!decoded) {
        return next(new Error("Authentication error: Invalid token"));
      }

      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    logger.info(`Socket connected for user: ${socket.userId}`);
    
    // Join a private room unique to this user
    socket.join(`user_${socket.userId}`);

    socket.on("disconnect", () => {
      logger.info(`Socket disconnected for user: ${socket.userId}`);
    });
  });

  return io;
};

export const emitNotification = (userId, notification) => {
  if (io) {
    io.to(`user_${userId}`).emit("new_notification", notification);
  }
};
