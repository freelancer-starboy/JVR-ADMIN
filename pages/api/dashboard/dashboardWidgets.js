import connectDb from "lib/database/db";
import { adminAuth } from "lib/firebase/firebaseAdmin";
import Checkout from "lib/Models/checkoutModel";
import moment from "moment-timezone";
import mongoose from "mongoose";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Connect to database first
    await connectDb();

    const { timeFrame = 'all', startDate, endDate } = req.query;

    // Build date filter based on timeframe
    let dateFilter = {};
    
    // Get current time in IST (UTC+5:30)
    const now = moment().utcOffset('+05:30');

    switch (timeFrame) {
      case 'today':
        dateFilter = {
          createdAt: {
            $gte: now.startOf('day').toDate(),
            $lte: now.endOf('day').toDate()
          }
        };
        break;

      case 'week':
        dateFilter = {
          createdAt: {
            $gte: now.startOf('week').toDate(),
            $lte: now.endOf('week').toDate()
          }
        };
        break;

      case 'month':
        dateFilter = {
          createdAt: {
            $gte: now.startOf('month').toDate(),
            $lte: now.endOf('month').toDate()
          }
        };
        break;

      case 'year':
        dateFilter = {
          createdAt: {
            $gte: now.startOf('year').toDate(),
            $lte: now.endOf('year').toDate()
          }
        };
        break;

      case 'custom':
        if (startDate && endDate) {
          dateFilter = {
            createdAt: {
              $gte: moment(startDate).startOf('day').toDate(),
              $lte: moment(endDate).endOf('day').toDate()
            }
          };
        }
        break;

      case 'all':
      default:
        // No date filter for 'all'
        dateFilter = {};
        break;
    }

    // 1. Total Number of Orders (with timeframe filter)
    const totalOrders = await Checkout.countDocuments(dateFilter);

    // 2. Total Revenue (only from successful payments + timeframe filter)
    let totalRevenue = 0;
    try {
      const revenueResult = await Checkout.aggregate([
        {
          $match: {
            ...dateFilter,
            'paymentDetails.status': { 
              $in: ['captured']
            }
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$orderTotal' }
          }
        }
      ]);

      totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;
    } catch (aggregateError) {
      console.error('Revenue aggregation error:', aggregateError);
      // Fallback: calculate revenue without aggregation
      const orders = await Checkout.find({
        ...dateFilter,
        'paymentDetails.status': { 
          $in: ['Completed', 'Success', 'Paid', 'completed', 'success', 'paid'] 
        }
      }).select('orderTotal');
      
      totalRevenue = orders.reduce((sum, order) => sum + (order.orderTotal || 0), 0);
    }

    // 3. Total Number of Customers (from Firebase Authentication)
    // Note: Firebase doesn't have built-in timeframe filtering for user creation
    // If you need timeframe filtering for customers, consider storing user creation dates in MongoDB
    const listUsersResult = await adminAuth.listUsers();
    let totalCustomers = listUsersResult.users.length;

    // Optional: Filter customers by timeframe if you store userId and createdAt in orders
    if (timeFrame !== 'all') {
      const uniqueCustomers = await Checkout.distinct('userId', dateFilter);
      totalCustomers = uniqueCustomers.length;
    }

    // 4. Number of Delivered Products (with timeframe filter)
    const deliveredProductsResult = await Checkout.aggregate([
      {
        $match: {
          ...dateFilter,
          orderStatus: {
            $in: ['Delivered']
          }
        }
      },
      {
        $unwind: '$cartItems'
      },
      {
        $group: {
          _id: null,
          totalDeliveredProducts: { $sum: '$cartItems.quantity' }
        }
      }
    ]);

    const deliveredProducts = deliveredProductsResult.length > 0 
      ? deliveredProductsResult[0].totalDeliveredProducts 
      : 0;

    // Return dashboard metrics with timeframe info
    return res.status(200).json({
      success: true,
      timeFrame,
      ...(timeFrame === 'custom' && { startDate, endDate }),
      data: {
        totalOrders,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalCustomers,
        deliveredProducts
      }
    });

  } catch (error) {
    console.error('Dashboard API Error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to fetch dashboard data',
      message: error.message 
    });
  }
}