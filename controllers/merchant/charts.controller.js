import moment from 'moment';
import { Order } from '../../models/order.model.js';

// Function to calculate percentage change
const calculatePercentageChange = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0; // If previous is 0 and current is positive, it's 100% increase
  return ((current - previous) / previous) * 100;
};

// Controller function to get analytics data for a specific time range and store
export const getAnalyticsDataForTimeRange = async (req, res) => {
  try {
    const storeId = req.params.storeId;
    const timeRange = req.params.timeRange;
    let start, end, prevStart, prevEnd;

    const IST_OFFSET = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds

    switch (timeRange) {
      case 'today':
        start = moment().startOf('day').utcOffset('+05:30');
        end = moment().endOf('day').utcOffset('+05:30');
        prevStart = moment().subtract(1, 'day').startOf('day').utcOffset('+05:30');
        prevEnd = moment().subtract(1, 'day').endOf('day').utcOffset('+05:30');
        break;
      case 'yesterday':
        start = moment().subtract(1, 'day').startOf('day').utcOffset('+05:30');
        end = moment().subtract(1, 'day').endOf('day').utcOffset('+05:30');
        prevStart = moment().subtract(2, 'day').startOf('day').utcOffset('+05:30');
        prevEnd = moment().subtract(2, 'day').endOf('day').utcOffset('+05:30');
        break;
      case 'thisweek':
        start = moment().startOf('week').utcOffset('+05:30');
        end = moment().utcOffset('+05:30');
        prevStart = moment().subtract(1, 'week').startOf('week').utcOffset('+05:30');
        prevEnd = moment().subtract(1, 'week').endOf('week').utcOffset('+05:30');
        break;
      case 'thismonth':
        start = moment().startOf('month').utcOffset('+05:30');
        end = moment().utcOffset('+05:30');
        prevStart = moment().subtract(1, 'month').startOf('month').utcOffset('+05:30');
        prevEnd = moment().subtract(1, 'month').endOf('month').utcOffset('+05:30');
        break;
      case 'thisyear':
        start = moment().startOf('year').utcOffset('+05:30');
        end = moment().utcOffset('+05:30');
        prevStart = moment().subtract(1, 'year').startOf('year').utcOffset('+05:30');
        prevEnd = moment().subtract(1, 'year').endOf('year').utcOffset('+05:30');
        break;
      case 'custom':
        start = moment(req.query.start).utcOffset('+05:30');
        end = moment(req.query.end).utcOffset('+05:30');
        prevStart = moment(req.query.prevStart).utcOffset('+05:30');
        prevEnd = moment(req.query.prevEnd).utcOffset('+05:30');
        break;
      default:
        throw new Error('Invalid time range');
    }

    // Convert the start and end times back to UTC for querying the database
    const startUTC = start.utc();
    const endUTC = end.utc();
    const prevStartUTC = prevStart.utc();
    const prevEndUTC = prevEnd.utc();

    // Fetch orders for the current period
    const currentOrders = await Order.find({
      storeId: storeId,
      createdAt: { $gte: startUTC.toDate(), $lte: endUTC.toDate() }
    });

    // Fetch orders for the previous period
    const previousOrders = await Order.find({
      storeId: storeId,
      createdAt: { $gte: prevStartUTC.toDate(), $lte: prevEndUTC.toDate() }
    });

    // Calculate total orders, earnings, and pages printed for the current period
    const currentTotalEarnings = currentOrders.reduce((acc, order) => acc + order.totalPrice, 0);
    const currentTotalOrders = currentOrders.length;
    const currentTotalPagesPrinted = currentOrders.reduce((acc, order) => {
      return acc + order.cartItems.reduce((itemAcc, item) => {
        return itemAcc + (item.filePageCount * item.fileCopiesCount);
      }, 0);
    }, 0);

    // Calculate total orders, earnings, and pages printed for the previous period
    const previousTotalEarnings = previousOrders.reduce((acc, order) => acc + order.totalPrice, 0);
    const previousTotalOrders = previousOrders.length;
    const previousTotalPagesPrinted = previousOrders.reduce((acc, order) => {
      return acc + order.cartItems.reduce((itemAcc, item) => {
        return itemAcc + (item.filePageCount * item.fileCopiesCount);
      }, 0);
    }, 0);

    // Calculate percentage changes
    const percentageChangeEarnings = calculatePercentageChange(currentTotalEarnings, previousTotalEarnings);
    const percentageChangeOrders = calculatePercentageChange(currentTotalOrders, previousTotalOrders);
    const percentageChangePagesPrinted = calculatePercentageChange(currentTotalPagesPrinted, previousTotalPagesPrinted);

    const ordersChartData = currentOrders.map(order => ({
      date: order.createdAt,
      orders: 1
    }));

    const earningsChartData = currentOrders.map(order => ({
      date: order.createdAt,
      earnings: order.totalPrice
    }));

    res.json({
      totalOrders: currentTotalOrders,
      totalEarnings: currentTotalEarnings,
      totalPagesPrinted: currentTotalPagesPrinted,
      percentageChangeEarnings: percentageChangeEarnings,
      percentageChangeOrders: percentageChangeOrders,
      percentageChangePagesPrinted: percentageChangePagesPrinted,
      ordersChartData: ordersChartData,
      earningsChartData: earningsChartData
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
