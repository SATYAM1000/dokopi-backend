import { User } from "../../models/user.model.js";
import { logger } from "../../config/logger.config.js";

export const getAllPlatformUsers = async (req, res) => {
  try {
    const allUsers = await User.find().select("-createdAt -updatedAt -__v");
    return res.status(200).json({
      msg: "Users fetched successfully!",
      success: true,
      data: allUsers,
    });
  } catch (error) {
    logger.error(`Error while getting all platform users: ${error.message}`);
    return res.status(500).json({
      msg: "Internal server error!",
      success: false,
      error: error.message,
    });
  }
};

export const countAllPlatformUsers = async (req, res) => {
  try {
    const count = await User.countDocuments();
    return res.status(200).json({
      msg: "Users count fetched successfully!",
      success: true,
      data: count,
    });
    
  } catch (error) {
    logger.error(`Error while counting all platform users: ${error.message}`);
    return res.status(500).json({
      msg: "Internal server error!",
      success: false,
      error: error.message,
    });
    
  }
}
export const changeUserRole = async (req, res) => {
  try {
    const userId = req.params.userId;
    const userRole = req.params.userRole;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        msg: "Invalid user id!",
        success: false,
      });
    }

    if (!userRole || !["USER", "MERCHANT", "ADMIN"].includes(userRole)) {
      return res.status(400).json({
        msg: "Invalid user role!",
        success: false,
      });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        msg: "User not found!",
        success: false,
      });
    }

    if (user.role === userRole) {
      return res.status(400).json({
        msg: "User already has this role!",
        success: false,
      });
    }

    user.role = userRole;
    await user.save();
    return res.status(200).json({
      msg: "User role changed successfully!",
      success: true,
    });
  } catch (error) {
    logger.error(`Error while changing user role: ${error.message}`);
    return res.status(500).json({
      msg: "Something went wrong!",
      error: error.message,
      success: false,
    });
  }
};

export const blockUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        msg: "Invalid user id!",
        success: false,
      });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        msg: "User not found!",
        success: false,
      });
    }
    if (user.isBlocked) {
      return res.status(400).json({
        msg: "User already blocked!",
        success: false,
      });
    }
    user.isBlocked = true;
    await user.save();
    return res.status(200).json({
      msg: "User blocked successfully!",
      success: true,
    });
  } catch (error) {
    logger.error(`Error while blocking user: ${error.message}`);
    return res.status(500).json({
      msg: "Something went wrong!",
      error: error.message,
      success: false,
    });
  }
};

export const unblockUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        msg: "Invalid user id!",
        success: false,
      });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        msg: "User not found!",
        success: false,
      });
    }
    if (!user.isBlocked) {
      return res.status(400).json({
        msg: "User already unblocked!",
        success: false,
      });
    }
    user.isBlocked = false;
    await user.save();
    return res.status(200).json({
      msg: "User unblocked successfully!",
      success: true,
    });
  } catch (error) {
    logger.error(`Error while unblocking user: ${error.message}`);
    return res.status(500).json({
      msg: "Something went wrong!",
      error: error.message,
      success: false,
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        msg: "Invalid user id!",
        success: false,
      });
    }
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({
        msg: "User not found!",
        success: false,
      });
    }
    return res.status(200).json({
      msg: "User deleted successfully!",
      success: true,
    });
  } catch (error) {
    logger.error(`Error while deleting user: ${error.message}`);
    return res.status(500).json({
      msg: "Something went wrong!",
      error: error.message,
      success: false,
    });
  }
};

export const deleteAllUsers = async (req, res) => {
  try {
    const allUsers = await User.deleteMany();
    return res.status(200).json({
      msg: "All users deleted successfully!",
      success: true,
    });
  } catch (error) {
    logger.error(`Error while deleting all users: ${error.message}`);
    return res.status(500).json({
      msg: "Something went wrong!",
      error: error.message,
      success: false,
    });
  }
};










