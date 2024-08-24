import { User } from "../../models/user.model.js";
import { handleHttpError } from "../../utils/http-error.js";
export const testAPI = async (req, res, next) => {
  try {
    const user = await User.findById("66c889d0c58abfdf54eae8f0");
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    return res.status(200).json({
      msg: "API is working fine!",
      success: true,
    });
  } catch (error) {
    handleHttpError(next, error, req, error.statusCode || 500);
  }
};
