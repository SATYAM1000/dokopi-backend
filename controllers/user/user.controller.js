import { logger } from "../../config/logger.config.js";
import { User } from "../../models/user.model.js";
import userSupportModel from "../../models/userSupport.model.js";

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
      const [localPart, domain] = existingUser.email.split("@");
      const maskedEmail = `${localPart.slice(0, 6)}xxxxxx@${domain}`;
      return res.status(400).json({
        msg: `Phone assigned to ${maskedEmail}!`,
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

export const supportFormForUser = async (req, res) => {
  try {
    const { _id } = req.user;

    const user = await User.findById(_id);

    const { name, email, phone, message } = req.body.formData;

    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        msg: "All fields are required!",
        success: false,
      });
    }

    const newSupport = new userSupportModel({
      userId: _id,
      name,
      email,
      phone,
      message,
    });
    await newSupport.save();

    return res.status(201).json({
      msg: "Support form submitted successfully!",
      success: true,
    });
  } catch (error) {
    logger.error(`Error while getting store bank details: ${error.message}`);
    return res.status(500).json({
      msg: "Internal server error!",
      error: error.message,
      success: false,
    });
  }
};
