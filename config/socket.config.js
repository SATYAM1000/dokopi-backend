import { User } from "../models/user.model.js";

export const socketHandlers = (io, logger) => {
  io.on("connection", (socket) => {
    logger.info("New client connected!", socket.id);

    socket.on("userConnect", async ({ userId }) => {
      try {
        const user = await User.findOneAndUpdate(
          { _id: userId },
          { socketId: socket.id },
          { new: true }
        );
      } catch (error) {
        logger.error("Error handling user connection:", error);
      }
    });

    socket.on("disconnect", async () => {
      logger.info("Client disconnected!", socket.id);
      await User.findOneAndUpdate({ socketId: socket.id }, { socketId: "" });
    });
  });
};
