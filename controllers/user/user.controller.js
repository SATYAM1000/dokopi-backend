import { logger } from "../../config/logger.config.js";
import { User } from "../../models/user.model.js";

export const submitUserPhoneNumber = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const { _id } = req.user;

    if (!phoneNumber) {
      return res.status(400).json({
        msg: "Phone number is required!",
        success: false,
      });
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({
        msg: "Invalid phone number!",
        success: false,
      });
    }

    const existingUser = await User.findOne({ phone: phoneNumber });
    if (existingUser) {
      return res.status(400).json({
        msg: "Phone number already exists!",
        success: false,
      });
    }

    await User.findByIdAndUpdate(_id, { phone: phoneNumber });

    return res.status(200).json({
      msg: "Phone number added successfully!",
      success: true,
    });
  } catch (error) {
    logger.error(`Error while submitting user phone number: ${error.message}`);
    return res.status(500).json({
      msg: "Something went wrong!",
      error: error.message,
      success: false,
    });
  }
};
