import { User } from "../models/user.model.js";

export const userSocketMap = new Map();

export const socketHandlers = (io, logger) => {
  io.on("connection", (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    socket.on("userConnect", async ({ userId }) => {
      try {
        // Update the user document with the new socketId
        const user = await User.findOneAndUpdate(
          { _id: userId },
          { socketId: socket.id },
          { new: true }
        );

        // Update the in-memory map
        if (user) {
          userSocketMap.set(user._id.toString(), socket.id);
          logger.info(`User ${userId} connected with socket ID ${socket.id}`);
        } else {
          logger.warn(`User ${userId} not found.`);
        }
      } catch (error) {
        logger.error("Error handling user connection:", error);
      }
    });

    socket.on("disconnect", async () => {
      try {
        const userId = getUserIdBySocketId(socket.id); 

        if (userId) {
          
          userSocketMap.delete(userId);

          // Update the user document in the database
          await User.findOneAndUpdate({ _id: userId }, { socketId: "" });

          logger.info(`User ${userId} disconnected.`);
        } else {
          logger.warn(`Socket ID ${socket.id} not found in userSocketMap.`);
        }
      } catch (error) {
        logger.error("Error handling user disconnection:", error);
      }
    });
  });
};

// Helper function to get userId by socketId
const getUserIdBySocketId = (socketId) => {
  for (const [userId, id] of userSocketMap.entries()) {
    if (id === socketId) {
      return userId;
    }
  }
  return null;
};

