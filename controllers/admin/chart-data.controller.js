import { User } from "../../models/user.model.js";
import { validateDate } from "../../utils/validate-date.js";
import Order from "../../models/order.model.js";
import { logger } from "../../config/logger.config.js";

// GET /new-users?startDate=2024-04-01&endDate=2024-04-30

export const getNewUserCountsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        msg: "Missing required parameters!",
        success: false,
      });
    }

    if (validateDate(startDate) === false || validateDate(endDate) === false) {
      return res.status(400).json({
        msg: "Invalid date format!",
        success: false,
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      return res.status(400).json({
        msg: "Start date cannot be greater than end date!",
        success: false,
      });
    }

    const newUserCounts = await User.aggregate([
      {
        $match: {
          createdAt: {
            $gte: start,
            $lte: end,
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    return res.status(200).json({
      msg: "New user counts by date range fetched successfully!",
      success: true,
      data: newUserCounts,
    });
  } catch (error) {
    logger.error(
      `Error while getting new user counts by date range: ${error.message}`
    );
    return res.status(500).json({
      msg: "Something went wrong!",
      error: error.message,
      success: false,
    });
  }
};

export const getNewUserCountOnDate = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        msg: "Date is required!",
        success: false,
      });
    }

    if (!validateDate(date)) {
      return res.status(400).json({
        msg: "Invalid date format!",
        success: false,
      });
    }

    const targetDate = new Date(date);

    const startOfDay = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate()
    );
    const endOfDay = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate() + 1
    );

    const newUserCount = await User.countDocuments({
      createdAt: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
    });

    return res.status(200).json({
      msg: "New user count on date fetched successfully!",
      success: true,
      data: newUserCount,
    });
  } catch (error) {
    logger.error(
      `Error while getting new user count on date: ${error.message}`
    );
    return res.status(500).json({
      msg: "Something went wrong!",
      error: error.message,
      success: false,
    });
  }
};

// GET /mew-users-per-month
export const getNewUserCountsPerMonth = async (req, res) => {
  try {
    const newUserCountsPerMonth = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
      {
        $addFields: {
          monthName: {
            $switch: {
              branches: [
                { case: { $eq: ["$_id.month", 1] }, then: "January" },
                { case: { $eq: ["$_id.month", 2] }, then: "February" },
                { case: { $eq: ["$_id.month", 3] }, then: "March" },
                { case: { $eq: ["$_id.month", 4] }, then: "April" },
                { case: { $eq: ["$_id.month", 5] }, then: "May" },
                { case: { $eq: ["$_id.month", 6] }, then: "June" },
                { case: { $eq: ["$_id.month", 7] }, then: "July" },
                { case: { $eq: ["$_id.month", 8] }, then: "August" },
                { case: { $eq: ["$_id.month", 9] }, then: "September" },
                { case: { $eq: ["$_id.month", 10] }, then: "October" },
                { case: { $eq: ["$_id.month", 11] }, then: "November" },
                { case: { $eq: ["$_id.month", 12] }, then: "December" },
              ],
              default: "Unknown",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$monthName",
          count: 1,
        },
      },
    ]);

    return res.status(200).json({
      msg: "New user counts per month fetched successfully!",
      success: true,
      data: newUserCountsPerMonth,
    });
  } catch (error) {
    logger.error(
      `Error while getting new user counts per month: ${error.message}`
    );
    return res.status(500).json({
      msg: "Something went wrong!",
      error: error.message,
      success: false,
    });
  }
};

export const getOrdersCountsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        msg: "Start date and end date are required!",
        success: false,
      });
    }
    if (!isValidDate(startDate) || !isValidDate(endDate)) {
      return res.status(400).json({
        msg: "Invalid date format!",
        success: false,
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      return res.status(400).json({
        msg: "Start date cannot be greater than end date!",
        success: false,
      });
    }

    const newOrderCounts = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: start,
            $lte: end,
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    return res.status(200).json({
      msg: "New order counts by date range fetched successfully!",
      success: true,
      data: newOrderCounts,
    });
  } catch (error) {
    logger.error(
      `Error while getting new order counts by date range: ${error.message}`
    );
    return res.status(500).json({
      msg: "Something went wrong!",
      error: error.message,
      success: false,
    });
  }
};

// GET /api/order-count?date=YYYY-MM-DD

export const getOrderCountByDate = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        msg: "Date is required!",
        success: false,
      });
    }

    if (!isValidDate(date)) {
      return res.status(400).json({
        msg: "Invalid date format!",
        success: false,
      });
    }

    const orderCount = await Order.countDocuments({
      createdAt: {
        $gte: new Date(date),
        $lte: new Date(new Date(date).setDate(new Date(date).getDate() + 1)),
      },
    });

    return res.status(200).json({
      msg: "Order count fetched successfully!",
      success: true,
      data: orderCount,
    });
  } catch (error) {
    logger.error(`Error while getting total orders on date: ${error.message}`);
    return res.status(500).json({
      msg: "Something went wrong!",
      error: error.message,
      success: false,
    });
  }
};

// GET /api/order-count-last-24-hours

export const getOrderCountLast24Hours = async (req, res) => {
  try {
    const orderCount = await Order.countDocuments({
      createdAt: {
        $gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    });

    return res.status(200).json({
      msg: "Order count fetched successfully!",
      success: true,
      data: orderCount,
    });
  } catch (error) {
    logger.error(
      `Error while getting total orders last 24 hours: ${error.message}`
    );
    return res.status(500).json({
      msg: "Something went wrong!",
      error: error.message,
      success: false,
    });
  }
};


