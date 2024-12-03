// /app/api/admin/aws/get-presigned-urls/route.js

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import SpecificCategoryVariant from '@/models/SpecificCategoryVariant';
import { getPresignedUrl } from '@/lib/aws';
import jwt from 'jsonwebtoken';
import dayjs from 'dayjs';

const JWT_SECRET = process.env.JWT_SECRET;

export const config = {
  runtime: 'nodejs',
};

export async function GET(request) {
  return handleGetPresignedUrls(request);
}

async function handleGetPresignedUrls(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { message: 'Missing token in query parameters.' },
        { status: 400 }
      );
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      console.error('Invalid or expired token:', err);
      return NextResponse.json(
        { message: 'Invalid or expired token.' },
        { status: 401 }
      );
    }

    const { startDate, endDate } = decoded;

    if (!startDate || !endDate) {
      return NextResponse.json(
        { message: 'Token does not contain startDate or endDate.' },
        { status: 400 }
      );
    }

    const start = dayjs(startDate).toDate();
    const end = dayjs(endDate).toDate();

    if (!dayjs(start).isValid() || !dayjs(end).isValid()) {
      return NextResponse.json(
        { message: 'Invalid date format in token.' },
        { status: 400 }
      );
    }

    // Aggregate Orders to get SKU counts and designTemplate.imageUrl
    const imagesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          'paymentDetails.amountPaidOnline': { $gt: 0 },
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
          from: 'specificcategoryvariants',
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
            specificCategoryVariant: '$specificCategoryVariant.name',
            imageUrl: '$product.designTemplate.imageUrl',
          },
          count: { $sum: '$items.quantity' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    if (!imagesData || imagesData.length === 0) {
      return NextResponse.json(
        { message: 'No images found for the specified date range.' },
        { status: 404 }
      );
    }

    // Generate presigned URLs for each image
    const imagesWithPresignedUrls = await Promise.all(
      imagesData.map(async (item) => {
        const { sku, specificCategoryVariant, imageUrl } = item._id;

        if (!imageUrl) {
          return {
            sku,
            specificCategoryVariant,
            imageUrl: null,
            presignedUrl: null,
            count: item.count,
          };
        }

        try {
          const presignedUrlObj = await getPresignedUrl(
            imageUrl,
            'image/png', // Adjust MIME type if necessary
            'getObject'
          );
          const presignedUrl = presignedUrlObj.presignedUrl;
          const url = presignedUrlObj.url;

          return {
            sku,
            specificCategoryVariant,
            imageUrl,
            presignedUrl,
            count: item.count,
          };
        } catch (error) {
          console.error(`Error generating presigned URL for SKU ${sku}:`, error);
          return {
            sku,
            specificCategoryVariant,
            imageUrl,
            presignedUrl: null,
            count: item.count,
          };
        }
      })
    );

    return NextResponse.json({ images: imagesWithPresignedUrls }, { status: 200 });
  } catch (error) {
    console.error('Error in get-presigned-urls:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
