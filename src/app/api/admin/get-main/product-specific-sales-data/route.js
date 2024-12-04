// /app/api/admin/get-main/product-specific-sales-data/route.js

import { connectToDatabase } from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import SpecificCategoryVariant from '@/models/SpecificCategoryVariant';
import { NextResponse } from 'next/server';
import { Types } from 'mongoose'; // Correctly import Types

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
    const categoryVariantIds = searchParams.getAll('categoryVariants'); // Array of SpecificCategoryVariant IDs

    console.log({ categoryVariantIds });

    // Get date range
    const { startDate, endDate } = getDateRange(dateFilter);

    // Build the initial query
    const query = {
      paymentStatus: { $in: ['paidPartially', 'allPaid', 'allToBePaidCod'] },
      createdAt: { $gte: startDate, $lte: endDate },
    };

    console.log('Initial Query:', JSON.stringify(query));

    // Convert categoryVariantIds to ObjectId and filter out any invalid IDs
    const validCategoryVariantIds = categoryVariantIds
      .map(id => Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : null)
      .filter(id => id !== null);

    console.log('Valid Category Variant ObjectIds:', validCategoryVariantIds);

    if (categoryVariantIds.length > 0 && validCategoryVariantIds.length === 0) {
      console.warn('No valid categoryVariantIds provided.');
    }

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
      { $sort: { totalSold: -1 } },
      {
        $facet: {
          top20: [{ $limit: 20 }],
          all: []
        }
      }
    ]);

    console.log('Aggregated Sales Data:', JSON.stringify(salesData, null, 2));

    const top20 = salesData[0].top20;
    const allProducts = salesData[0].all;

    return NextResponse.json({ top20, allProducts });
  } catch (error) {
    console.error("Error fetching sales data:", error);
    return NextResponse.json({ error: 'Failed to fetch sales data' }, { status: 500 });
  }
};
