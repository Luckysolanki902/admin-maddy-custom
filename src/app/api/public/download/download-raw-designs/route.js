// /app/api/public/download/download-raw-designs/route.js
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Product from '@/models/Product';
import Order from '@/models/Order';
import SpecificCategoryVariant from '@/models/SpecificCategoryVariant';
import JSZip from 'jszip';
import dayjs from 'dayjs';
import jwt from 'jsonwebtoken';

const AWS = require('aws-sdk');

const JWT_SECRET = process.env.JWT_SECRET;

// Initialize AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID, // Ensure these are server-side environment variables
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

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
            imageFolderPath: '$specificCategoryVariant.imageFolderPath',
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

    // Initialize JSZip
    const zip = new JSZip();

    // Initialize an array to track unavailable images
    let unavailableImages = [];

    // Function to fetch image from S3 and add to zip
    const fetchAndAddToZip = async (sticker) => {
      const { sku, specificCategoryVariant, imageFolderPath } = sticker._id;
      const { count } = sticker;

      if (!imageFolderPath) {
        console.error(`No imageFolderPath found for SKU ${sku}.`);
        return;
      }

      const imageKey = `${imageFolderPath}/${sku}.jpg`; // Assuming JPEG images

      try {
        const params = {
          Bucket: process.env.AWS_BUCKET,
          Key: imageKey,
        };

        const data = await s3.getObject(params).promise();
        const fileBuffer = data.Body;

        // Sanitize folder and file names
        const sanitizedSKU = sku.replace(/[/\\?%*:|"<>]/g, '-');
        const sanitizedCategoryVariant = specificCategoryVariant.replace(/[/\\?%*:|"<>]/g, '-');

        for (let i = 1; i <= count; i++) {
          const imagePath = `${sanitizedCategoryVariant}/${sanitizedSKU}-${i}.jpg`;
          zip.file(imagePath, fileBuffer);
        }
      } catch (error) {
        console.error(`Error fetching image for SKU ${sku}:`, error);
        unavailableImages.push(sku); // Track unavailable SKU
      }
    };

    // Process all images
    await Promise.all(imagesData.map((sticker) => fetchAndAddToZip(sticker)));

    // Generate zip buffer
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });

    // Format dates for filename
    const formattedStartDate = dayjs(start).format('MMM_DD_YYYY');
    const formattedCurrentDateTime = dayjs().format('MMM_DD_YYYY_At_hh_mm_A');
    const fileName = `Orders_${formattedStartDate}_downloaded_On_${formattedCurrentDateTime}.zip`;

    const headers = {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename=${fileName}`,
      'Content-Length': zipBuffer.length,
    };

    // If there are unavailable images, you might want to notify the user
    if (unavailableImages.length > 0) {
      console.warn(`The following SKUs had unavailable images: ${unavailableImages.join(', ')}`);
      // Optionally, include this information in the response headers or a separate file within the zip
    }

    return new NextResponse(zipBuffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Error creating zip:', error);
    return NextResponse.json({ message: 'Error generating zip file' }, { status: 500 });
  }
}
