// /app/api/admin/get-main/product-specific-sales-data/route.js

import { connectToDatabase } from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import SpecificCategoryVariant from '@/models/SpecificCategoryVariant';
import { NextResponse } from 'next/server';
import { Types } from 'mongoose';

/**
 * Helper function to calculate date range based on filter
 */
const getDateRange = (filter) => {
  const today = new Date();
  let startDate = new Date(0); // Epoch
  const endDate = today;

  switch (filter) {
    case 'today':
      startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      break;
    case 'last7Days':
      startDate = new Date();
      startDate.setDate(today.getDate() - 7);
      break;
    case 'last30Days':
      startDate = new Date();
      startDate.setDate(today.getDate() - 30);
      break;
    case 'allTime':
    default:
      startDate = new Date(0);
      break;
  }

  return { startDate, endDate };
}

/**
 * GET Handler
 */
export const GET = async (request) => {
  try {
    // Connect to the database
    await connectToDatabase();

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const dateFilter = searchParams.get('dateFilter') || 'allTime';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc'; // Default to 'desc'
    const limit = parseInt(searchParams.get('limit'), 10) || 20; // Default to 20
    const categoryVariantIds = searchParams.getAll('categoryVariants'); // Array of SpecificCategoryVariant IDs

    // Get date range
    const { startDate, endDate } = getDateRange(dateFilter);

    // Build the initial query
    const query = {
      paymentStatus: { $in: ['paidPartially', 'allPaid', 'allToBePaidCod'] },
      createdAt: { $gte: startDate, $lte: endDate },
    };

    // Convert categoryVariantIds to ObjectId and filter out any invalid IDs
    const validCategoryVariantIds = categoryVariantIds
      .map(id => Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : null)
      .filter(id => id !== null);

    if (categoryVariantIds.length > 0 && validCategoryVariantIds.length === 0) {
      console.warn('No valid categoryVariantIds provided.');
    }

    // Determine sort direction
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    // Aggregate sales data
    const salesData = await Order.aggregate([
      { $match: query },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productDetails",
          pipeline: [
            { $project: { images: 1, specificCategoryVariant: 1, name: 1 } } // Optimize lookup
          ]
        }
      },
      { $unwind: "$productDetails" },
      // Apply category variant filter if provided
      ...(validCategoryVariantIds.length > 0 ? [{
        $match: {
          "productDetails.specificCategoryVariant": { $in: validCategoryVariantIds }
        }
      }] : []),
      {
        $group: {
          _id: "$items.product",
          name: { $first: "$items.name" },
          sku: { $first: "$items.sku" },
          price: { $first: "$items.priceAtPurchase" },
          image: { $first: { $arrayElemAt: ["$productDetails.images", 0] } },
          totalSold: { $sum: "$items.quantity" },
          totalSales: { $sum: { $multiply: ["$items.quantity", "$items.priceAtPurchase"] } },
        }
      },
      { $sort: { totalSold: sortDirection } },
      {
        $facet: {
          top: [{ $limit: limit }],
          all: []
        }
      }
    ]);

    const top = salesData[0].top;
    const allProducts = salesData[0].all;

    return NextResponse.json({ top, allProducts });
  } catch (error) {
    console.error("Error fetching sales data:", error);
    return NextResponse.json({ error: 'Failed to fetch sales data' }, { status: 500 });
  }
};
