// /app/api/public/download/download-raw-designs/route.js

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Product from '@/models/Product';
import Order from '@/models/Order';
import SpecificCategoryVariant from '@/models/SpecificCategoryVariant';
import archiver from 'archiver';
import pLimit from 'p-limit';
import dayjs from 'dayjs';
import jwt from 'jsonwebtoken';
import stream from 'stream';

const JWT_SECRET = process.env.JWT_SECRET;

// Helper function to verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};

// Specify Node.js runtime
export const config = {
  runtime: 'nodejs',
};

export async function GET(request) {
  return handleDownload(request);
}

async function handleDownload(request) {
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

    const decoded = verifyToken(token);
    if (!decoded) {
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
      return NextResponse.json({ message: 'Invalid date format in token.' }, { status: 400 });
    }

    // Aggregate Orders to get SKU counts, image URLs, and specificCategoryVariant
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
          },
          count: { $sum: '$items.quantity' },
          imageUrl: { $first: '$product.designTemplate.imageUrl' },
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

    // Initialize archiver
    const archive = archiver('zip', { zlib: { level: 9 } });

    // Handle archiver errors
    archive.on('error', (err) => {
      console.error('Archiver error:', err);
      throw err;
    });

    // Prepare a buffer stream
    const bufferStream = new stream.PassThrough();
    archive.pipe(bufferStream);

    // Format dates for filename
    const formattedStartDate = dayjs(start).format('MMM_DD_YYYY');
    const formattedCurrentDateTime = dayjs().format('MMM_DD_YYYY_At_hh_mm_A');
    const fileName = `Orders_${formattedStartDate}_downloaded_On_${formattedCurrentDateTime}.zip`;

    const headers = {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename=${fileName}`,
    };

    // Set up concurrency control
    const limit = pLimit(10); // Adjust concurrency as needed

    // Function to fetch and append multiple images based on count
    const fetchAndAppendImages = async (sticker) => {
      const { sku, specificCategoryVariant } = sticker._id;
      const { count, imageUrl } = sticker;

      if (!imageUrl) {
        console.error(`No imageUrl found for SKU ${sku}.`);
        return;
      }

      const fullImageUrl = `${process.env.NEXT_PUBLIC_CLOUDFRONT_BASEURL}/${imageUrl}`;

      for (let i = 1; i <= count; i++) {
        try {
          const response = await fetch(fullImageUrl);

          if (!response.ok) {
            console.error(
              `Failed to fetch image for SKU ${sku}: ${response.status} ${response.statusText}`
            );
            continue; // Skip this image
          }

          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          // Sanitize folder and file names
          const sanitizedSKU = sku.replace(/[/\\?%*:|"<>]/g, '-');
          const sanitizedCategoryVariant = specificCategoryVariant.replace(/[/\\?%*:|"<>]/g, '-');
          const imagePath = `${sanitizedCategoryVariant}/${sanitizedSKU}-${i}.png`;

          // Append image to archive
          archive.append(buffer, { name: imagePath });
        } catch (error) {
          console.error(`Error fetching image for SKU ${sku}:`, error);
        }
      }
    };

    // Limit concurrency and prepare promises
    const fetchPromises = imagesData.map((sticker) => limit(() => fetchAndAppendImages(sticker)));

    // Execute all fetch operations
    await Promise.all(fetchPromises);

    // Finalize the archive
    archive.finalize();

    // Convert the buffer stream to a readable stream
    const readableStream = bufferStream;

    return new NextResponse(readableStream, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Error creating zip:', error);
    return NextResponse.json({ message: 'Error generating zip file' }, { status: 500 });
  }
}
