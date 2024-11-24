// /app/api/download/download-raw-designs/route.js

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Product from '@/models/Product';
import Order from '@/models/Order';
import SpecificCategoryVariant from '@/models/SpecificCategoryVariant'; // Ensure this model exists
import archiver from 'archiver';
import pLimit from 'p-limit';
import dayjs from 'dayjs';
import { PassThrough } from 'stream';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

// Helper function to verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};

export async function POST(request) {
  return handleDownload(request, 'POST');
}

export async function GET(request) {
  return handleDownload(request, 'GET');
}

async function handleDownload(request, method) {
  try {
    await connectToDatabase();

    let startDate, endDate;

    // Extract startDate and endDate based on the request method
    if (method === 'POST') {
      const body = await request.json();
      if (!body.startDate || !body.endDate) {
        return NextResponse.json(
          { message: 'Missing startDate or endDate in request body.' },
          { status: 400 }
        );
      }

      startDate = dayjs(body.startDate).toDate();
      endDate = dayjs(body.endDate).toDate();

      if (!dayjs(startDate).isValid() || !dayjs(endDate).isValid()) {
        return NextResponse.json({ message: 'Invalid date format.' }, { status: 400 });
      }
    } else if (method === 'GET') {
      const { searchParams } = new URL(request.url);
      const token = searchParams.get('token');

      if (!token) {
        return NextResponse.json(
          { message: 'Missing token in query parameters.' },
          { status: 400 }
        );
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        return NextResponse.json(
          { message: 'Invalid or expired token.' },
          { status: 401 }
        );
      }

      startDate = dayjs(decoded.startDate).toDate();
      endDate = dayjs(decoded.endDate).toDate();

      if (!dayjs(startDate).isValid() || !dayjs(endDate).isValid()) {
        return NextResponse.json({ message: 'Invalid date format in token.' }, { status: 400 });
      }
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

    if (!imagesData || imagesData.length === 0) {
      return NextResponse.json({ message: 'No images found for the specified date range.' }, { status: 404 });
    }

    // Initialize archiver
    const archive = archiver('zip', { zlib: { level: 9 } });

    // Handle archiver errors
    archive.on('error', (err) => {
      console.error('Archiver error:', err);
      throw err;
    });

    // Prepare a PassThrough stream to pipe to response
    const passThrough = new PassThrough();

    // Set response headers
    const formattedDate = dayjs().format('DD_MMM_YYYY_hh_mm_a').toLowerCase();
    const fileName = `raw_designs_${formattedDate}.zip`;

    const response = new NextResponse(passThrough, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename=${fileName}`,
      },
    });

    // Pipe archiver to PassThrough
    archive.pipe(passThrough);

    // Set up concurrency control
    const limit = pLimit(10); // Adjust concurrency as needed

    // Collect fetch promises
    const fetchPromises = imagesData.map((sticker) =>
      limit(async () => {
        const { _id: identifier, count, imageUrl } = sticker;
        const { sku, specificCategoryVariant } = identifier;

        if (!imageUrl) {
          console.error(`No imageUrl found for SKU ${sku}.`);
          return;
        }

        const fullImageUrl = `${process.env.NEXT_PUBLIC_CLOUDFRONT_BASEURL}/${imageUrl}`;

        for (let i = 1; i <= count; i++) {
          try {
            const fetchResponse = await fetch(fullImageUrl);

            if (!fetchResponse.ok) {
              console.error(`Failed to fetch image for SKU ${sku}: ${fetchResponse.status} ${fetchResponse.statusText}`);
              continue; // Skip this image
            }

            // Read response as arrayBuffer and convert to Buffer
            const arrayBuffer = await fetchResponse.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            // Append image to archive in specificCategoryVariant folder
            const sanitizedSKU = sku.replace(/[/\\?%*:|"<>]/g, '-');
            const sanitizedCategoryVariant = specificCategoryVariant.replace(/[/\\?%*:|"<>]/g, '-');
            const imagePath = `${sanitizedCategoryVariant}/${sanitizedSKU}-${i}.png`;

            archive.append(buffer, { name: imagePath });
          } catch (error) {
            console.error(`Error fetching image for SKU ${sku}:`, error);
          }
        }
      })
    );

    await Promise.all(fetchPromises);

    // Finalize the archive
    archive.finalize();

    return response;
  } catch (error) {
    console.error('Error creating zip:', error);
    return NextResponse.json({ message: 'Error generating zip file' }, { status: 500 });
  }
}
