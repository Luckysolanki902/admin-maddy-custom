
import { connectToDatabase } from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';
import dayjs from 'dayjs';
import Product from '@/models/Product'

// This handler is now written for Next.js 15+ using App Router's API conventions
export async function GET(req) {
  try {
    const {
      searchParams
    } = new URL(req.url);

    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '30', 10), 30);
    const searchInput = searchParams.get('searchInput') || '';
    const searchField = searchParams.get('searchField') || 'name';
    const showLocalHostOrders = searchParams.get('showLocalHostOrders') || 'false';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    const problematicFilter = searchParams.get('problematicFilter') || '';

    const skip = (page - 1) * limit;

    // Base query for Orders
    const baseQuery = {};

    // Date range filter
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        baseQuery.createdAt = { $gte: start, $lte: end };
      }
    }

    // Search filter for User name or phone number
    if (searchInput && searchField) {
      const userSearchQuery = {};
      userSearchQuery[searchField] = { $regex: new RegExp(searchInput, 'i') };

      const users = await User.find(userSearchQuery).select('_id');
      baseQuery.user = { $in: users.map((user) => user._id) };
    }

    let orders;
    let totalOrders;
    let totalPages;

    if (problematicFilter) {
      let problematicCondition = {};

      switch (problematicFilter) {
        case 'paymentNotVerified':
          problematicCondition = { 'paymentDetails.paymentVerified': false };
          break;
        case 'shiprocketNotCreated':
          problematicCondition = { 'purchaseStatus.shiprocketOrderCreated': false };
          break;
        case 'both':
          problematicCondition = {
            'paymentDetails.paymentVerified': false,
            'purchaseStatus.shiprocketOrderCreated': false,
          };
          break;
        default:
          return new Response(
            JSON.stringify({ message: 'Invalid problematic filter provided.' }),
            { status: 400 }
          );
      }

      const problematicQuery = { ...baseQuery, ...problematicCondition };

      totalOrders = await Order.countDocuments(problematicQuery);
      orders = await Order.find(problematicQuery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      totalPages = Math.ceil(totalOrders / limit);
    } else {
      totalOrders = await Order.countDocuments(baseQuery);
      orders = await Order.find(baseQuery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user') // Populate user details
        .populate({
          path: 'items.product',
          model: 'Product',
        });

      totalPages = Math.ceil(totalOrders / limit);
    }

    return new Response(
      JSON.stringify({
        orders,
        totalOrders,
        totalPages,
        currentPage: page,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in getorders API:", error);
    return new Response(
      JSON.stringify({ message: 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export const config = {
  runtime: 'edge', // Optional: Enables Edge Runtime for better performance
};
