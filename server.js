import { createServer as httpCreateServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { socketHandlers } from "./config/socket.config.js";
import { logger } from "./config/logger.config.js";
import { config } from "./config/config.js";

let io; 

export const createServer = (app) => {
  // Create the HTTP server using the Express app
  const server = httpCreateServer(app);

  const allowedOrigins =
    config.NODE_ENV === "production" ? config.ALLOWED_ORIGINS.split(",") : "*";

  // Socket.IO configuration
  const socketOptions = {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    },
  };

  // Initialize Socket.IO with CORS options
  io = new SocketIOServer(server, socketOptions);

  // Register socket handlers
  socketHandlers(io, logger);

  return server; // Return the HTTP server instance
};

// Export io instance for use in other parts of the application
export { io };
