// /app/api/get-main/get-sku-count/route.js

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Order from '@/models/Order';
import dayjs from 'dayjs';

export async function GET(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    if (!startDateParam || !endDateParam) {
      return NextResponse.json(
        { message: 'Missing startDate or endDate in query parameters.' },
        { status: 400 }
      );
    }

    const startDate = dayjs(startDateParam).toDate();
    const endDate = dayjs(endDateParam).toDate();

    if (!dayjs(startDate).isValid() || !dayjs(endDate).isValid()) {
      return NextResponse.json({ message: 'Invalid date format.' }, { status: 400 });
    }

    // Aggregate Orders to get SKU counts, image URLs, and specificCategoryVariant
    const imagesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          'paymentDetails.amountPaidOnline': { $gt: 0 }, // Assuming paymentVerified is when amountPaidOnline > 0
          // Add additional filters if necessary (e.g., exclude test orders)
        },
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $lookup: {
          from: 'specificcategoryvariants', // Ensure the collection name matches
          localField: 'product.specificCategoryVariant',
          foreignField: '_id',
          as: 'specificCategoryVariant',
        },
      },
      { $unwind: '$specificCategoryVariant' },
      {
        $group: {
          _id: {
            sku: '$product.sku',
            specificCategoryVariant: '$specificCategoryVariant.name', // Assuming 'name' field exists
          },
          count: { $sum: '$items.quantity' },
          imageUrl: { $first: '$product.designTemplate.imageUrl' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const response = imagesData.map((item) => ({
      sku: item._id.sku,
      specificCategoryVariant: item._id.specificCategoryVariant,
      count: item.count,
      imageUrl: item.imageUrl,
    }));

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching SKU counts:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
