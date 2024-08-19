import { createServer as httpCreateServer } from "http";
import { Server } from "socket.io";
import { socketHandlers } from "./config/socket.config.js";
import { logger } from "./config/logger.config.js";

let io; 

export const createServer = (app) => {
  const server = httpCreateServer(app);
  io = new Server(server, {
    cors: {
      origin: [
        "https://www.dokopi.com",
        "https://merchant.dokopi.com",
        "http://localhost:3000",
      ],
      methods: ["GET", "POST", "PUT", "DELETE"],
    },
  });

  socketHandlers(io, logger);
  return server;
};

export { io }; // Export io so it can be used elsewhere in the application
