// /app/api/admin/download/download-raw-designs/route.js

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Order from '@/models/Order';
import dayjs from 'dayjs';
import archiver from 'archiver';
import pLimit from 'p-limit';
import { Buffer } from 'buffer';

export const config = {
  runtime: 'nodejs',
};

export async function POST(request) {
  return handleDownload(request);
}

async function handleDownload(request) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { startDate, endDate } = body;

    if (!startDate || !endDate) {
      return NextResponse.json(
        { message: 'Missing startDate or endDate in request body.' },
        { status: 400 }
      );
    }

    // Validate dates
    const start = dayjs(startDate).toDate();
    const end = dayjs(endDate).toDate();

    if (!dayjs(start).isValid() || !dayjs(end).isValid()) {
      return NextResponse.json({ message: 'Invalid date format.' }, { status: 400 });
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

    // Buffer to collect the zip data
    const buffers = [];
    const bufferPromise = new Promise((resolve, reject) => {
      archive.on('data', (data) => buffers.push(data));
      archive.on('end', () => resolve());
      archive.on('error', (err) => reject(err));
    });

    // Format dates for filename
    const formattedStartDate = dayjs(start).format('MMM_DD_YYYY');
    const formattedCurrentDateTime = dayjs().format('MMM_DD_YYYY_At_hh_mm_A');
    const fileName = `Orders_${formattedStartDate}_downloaded_On_${formattedCurrentDateTime}.zip`;

    // Function to fetch and append multiple images based on count
    const fetchAndAppendImages = async (sticker) => {
      const sku = sticker._id.sku;
      const specificCategoryVariant = sticker._id.specificCategoryVariant;
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

    // Set up concurrency control
    const limit = pLimit(10); // Adjust concurrency as needed

    // Prepare promises with limited concurrency
    const fetchPromises = imagesData.map((sticker) => limit(() => fetchAndAppendImages(sticker)));

    // Execute all fetch operations
    await Promise.all(fetchPromises);

    // Finalize the archive
    archive.finalize();

    // Wait for the archive to finish
    await bufferPromise;

    // Combine all buffer chunks into one buffer
    const zipBuffer = Buffer.concat(buffers);

    const headers = {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename=${fileName}`,
    };

    return new NextResponse(zipBuffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Error creating zip:', error);
    return NextResponse.json({ message: 'Error generating zip file' }, { status: 500 });
  }
}
