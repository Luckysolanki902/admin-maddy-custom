// /app/api/get-main/get-sku-count/route.js

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import dayjs from 'dayjs';

export async function GET(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const dateTag = searchParams.get('dateTag') || 'today';

    let startDate, endDate;

    if (dateTag === 'today') {
      const now = dayjs();
      startDate = now.startOf('day').toDate();
      endDate = now.endOf('day').toDate();
    } else if (dateTag === 'yesterday') {
      const yesterday = dayjs().subtract(1, 'day');
      startDate = yesterday.startOf('day').toDate();
      endDate = yesterday.endOf('day').toDate();
    } else {
      const specificDate = dayjs(dateTag, 'YYYY-MM-DD');
      if (!specificDate.isValid()) {
        return NextResponse.json({ message: 'Invalid date format' }, { status: 400 });
      }
      startDate = specificDate.startOf('day').toDate();
      endDate = specificDate.endOf('day').toDate();
    }

    // Aggregate Orders to get SKU counts and image URLs
    const imagesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          'purchaseStatus.paymentVerified': true,
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
        $group: {
          _id: '$product.sku',
          count: { $sum: '$items.quantity' },
          imageUrl: { $first: '$product.designTemplate.imageUrl' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const response = imagesData.map((item) => ({
      _id: item._id,
      count: item.count,
      imageUrl: item.imageUrl,
    }));

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching SKU counts:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
