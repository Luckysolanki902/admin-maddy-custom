// /app/api/showcase/getcustomers/route.js
import { connectToDatabase } from '@/lib/db';
import Order from '@/models/Order';
import dayjs from 'dayjs';
import SpecificCategory from '@/models/SpecificCategory';
import SpecificCategoryVariant from '@/models/SpecificCategoryVariant';
import Product from '@/models/Product';


export async function GET(req) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);

    // Extract query parameters
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '30', 10), 30);
    const searchInput = searchParams.get('searchInput') || '';
    const searchField = searchParams.get('searchField') || 'orderId';
    const showLocalHostOrders = searchParams.get('showLocalHostOrders') === 'true';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    const problematicFilter = searchParams.get('problematicFilter') || '';

    const skip = (page - 1) * limit;

    // Base query to filter paymentStatus
    const baseQuery = {
      paymentStatus: { $nin: ['pending', 'failed'] }, // Include only payment status which are not 'pending' or 'failed'
    };

    // Apply date range filter if provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        baseQuery.createdAt = { $gte: start, $lte: end };
      }
    }

    // Apply search filters
    if (searchInput && searchField) {
      const orderSearchQuery = {};

      if (searchField === 'name') {
        orderSearchQuery['address.receiverName'] = { $regex: new RegExp(searchInput, 'i') };
      } else if (searchField === 'phoneNumber') {
        orderSearchQuery['address.receiverPhoneNumber'] = { $regex: new RegExp(searchInput, 'i') };
      } else if (searchField === 'orderId') {
        if (searchInput.match(/^[0-9a-fA-F]{24}$/)) { // Validate ObjectId
          orderSearchQuery['_id'] = searchInput;
        } else {
          // If invalid ObjectId, return no results
          orderSearchQuery['_id'] = null;
        }
      }

      // Merge search query with base query
      Object.assign(baseQuery, orderSearchQuery);
    }

    let orders;
    let totalOrders;
    let totalPages;

    // Handle problematic filters if any
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
        .limit(limit)
        .populate('user')
        .populate({
          path: 'items.product',
          model: 'Product',
          populate: {
            path: 'specificCategoryVariant',
            model: 'SpecificCategoryVariant',
          },
        })
        .populate('paymentDetails.mode'); // Populate payment mode

      totalPages = Math.ceil(totalOrders / limit);
    } else {
      // Fetch orders without problematic filters
      totalOrders = await Order.countDocuments(baseQuery);
      orders = await Order.find(baseQuery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user')
        .populate({
          path: 'items.product',
          model: 'Product',
          populate: {
            path: 'specificCategoryVariant',
            model: 'SpecificCategoryVariant',
          },
        })
        .populate('paymentDetails.mode'); // Populate payment mode

      totalPages = Math.ceil(totalOrders / limit);
    }

    // Respond with fetched data
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
    console.error("Error in getcustomers API:", error);
    return new Response(
      JSON.stringify({ message: 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
