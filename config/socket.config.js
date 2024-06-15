import { XeroxStore } from "../models/store.model.js";
import { User } from "../models/user.model.js";

export const socketHandlers = (io, logger) => {
  io.on("connection", (socket) => {
    logger.info("New client connected! ", socket.id);

    socket.on(`userLogin`, async (userId) => {
      try {
        const userSocket = await User.findOneAndUpdate(
          {
            _id: userId,
          },
          {
            socketId: socket.id,
          },
          {
            upsert: true,
            new: true,
          }
        );

        logger.info(`User logged in with ID ${userId}`);
      } catch (error) {
        logger.error("Error handling user login:", error);
      }
    });


    socket.on("disconnect", async() => {
      logger.info("Client disconnected!", socket.id);
      await User.findOneAndUpdate(
        {
          socketId: socket.id,
        },
        {
          socketId: "",
        }
      )
    })
  });
};

