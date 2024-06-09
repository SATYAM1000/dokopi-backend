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

    switch (timeRange) {
      case 'today':
        start = moment().startOf('day');
        end = moment().endOf('day');
        prevStart = moment().subtract(1, 'day').startOf('day');
        prevEnd = moment().subtract(1, 'day').endOf('day');
        break;
      case 'yesterday':
        start = moment().subtract(1, 'day').startOf('day');
        end = moment().subtract(1, 'day').endOf('day');
        prevStart = moment().subtract(2, 'day').startOf('day');
        prevEnd = moment().subtract(2, 'day').endOf('day');
        break;
      case 'thisweek':
        start = moment().startOf('week');
        end = moment();
        prevStart = moment().subtract(1, 'week').startOf('week');
        prevEnd = moment().subtract(1, 'week').endOf('week');
        break;
      case 'thismonth':
        start = moment().startOf('month');
        end = moment();
        prevStart = moment().subtract(1, 'month').startOf('month');
        prevEnd = moment().subtract(1, 'month').endOf('month');
        break;
      case 'thisyear':
        start = moment().startOf('year');
        end = moment();
        prevStart = moment().subtract(1, 'year').startOf('year');
        prevEnd = moment().subtract(1, 'year').endOf('year');
        break;
      case 'custom':
        start = moment(req.query.start);
        end = moment(req.query.end);
        prevStart = moment(req.query.prevStart);
        prevEnd = moment(req.query.prevEnd);
        break;
      default:
        throw new Error('Invalid time range');
    }

    // Fetch orders for the current period
    const currentOrders = await Order.find({
      storeId: storeId,
      createdAt: { $gte: start.toDate(), $lte: end.toDate() }
    });

    // Fetch orders for the previous period
    const previousOrders = await Order.find({
      storeId: storeId,
      createdAt: { $gte: prevStart.toDate(), $lte: prevEnd.toDate() }
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
