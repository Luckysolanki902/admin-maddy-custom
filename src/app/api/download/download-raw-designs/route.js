// /app/api/download/download-raw-designs/route.js

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/middleware/connectToDb';
import Product from '@/models/Product';
import archiver from 'archiver';
import pLimit from 'p-limit';
import getStream from 'get-stream';
import { PassThrough } from 'stream';

export async function POST(request) {
  return handleDownload(request, 'POST');
}

export async function GET(request) {
  return handleDownload(request, 'GET');
}

async function handleDownload(request, method) {
  try {
    await connectToDatabase();

    let stickers = [];

    if (method === 'POST') {
      const body = await request.json();
      stickers = body.stickers;
    } else if (method === 'GET') {
      const { searchParams } = new URL(request.url);
      const stickerIds = searchParams.get('stickerIds');
      const counts = searchParams.get('counts');

      if (!stickerIds || !counts) {
        return NextResponse.json(
          { message: 'Missing stickerIds or counts in query parameters.' },
          { status: 400 }
        );
      }

      const stickerIdArray = stickerIds.split(',').map((id) => decodeURIComponent(id.trim()));
      const countArray = counts.split(',').map((count) => parseInt(count.trim(), 10));

      if (stickerIdArray.length !== countArray.length) {
        return NextResponse.json(
          { message: 'stickerIds and counts must have the same number of elements.' },
          { status: 400 }
        );
      }

      for (let i = 0; i < stickerIdArray.length; i++) {
        const id = stickerIdArray[i];
        const count = countArray[i];

        if (!id || typeof id !== 'string') {
          return NextResponse.json(
            { message: `Invalid stickerId at position ${i + 1}.` },
            { status: 400 }
          );
        }

        if (!count || typeof count !== 'number' || count < 1) {
          return NextResponse.json(
            { message: `Invalid count for stickerId ${id}.` },
            { status: 400 }
          );
        }

        stickers.push({ stickerId: id, count });
      }
    }

    if (!stickers || !Array.isArray(stickers) || stickers.length === 0) {
      return NextResponse.json({ message: 'Invalid stickers data.' }, { status: 400 });
    }

    // Validate stickers
    for (const sticker of stickers) {
      if (
        !sticker.stickerId ||
        typeof sticker.stickerId !== 'string' ||
        !sticker.count ||
        typeof sticker.count !== 'number' ||
        sticker.count < 1
      ) {
        return NextResponse.json({ message: 'Invalid sticker object format.' }, { status: 400 });
      }
    }

    // Initialize archiver
    const archive = archiver('zip', { zlib: { level: 0 } });

    // Collect archive data into buffer
    const bufferStream = new PassThrough();
    archive.pipe(bufferStream);

    // Set up concurrency control
    const limit = pLimit(10);

    // Fetch and append images
    const fetchPromises = stickers.map((sticker) =>
      limit(async () => {
        const { stickerId, count } = sticker;
        const product = await Product.findOne({ sku: stickerId }).lean();

        if (!product) {
          console.error(`Product with SKU ${stickerId} not found.`);
          return;
        }

        const imageUrl = `${process.env.NEXT_PUBLIC_CLOUDFRONT_BASEURL}/${product.designTemplate.imageUrl}`;

        for (let i = 1; i <= count; i++) {
          try {
            const response = await fetch(imageUrl);
            if (!response.ok) {
              console.error(`Failed to fetch image for SKU ${stickerId}: ${response.statusText}`);
              continue;
            }

            // Append image to archive
            const sanitizedSKU = stickerId.replace(/[/\\?%*:|"<>]/g, '-');
            const imagePath = `${sanitizedSKU}/${sanitizedSKU}-${i}.png`;

            archive.append(response.body, { name: imagePath, store: true });
          } catch (error) {
            console.error(`Error fetching image for SKU ${stickerId}:`, error);
          }
        }
      })
    );

    await Promise.all(fetchPromises);

    // Finalize the archive
    archive.finalize();

    // Collect the archive data
    const zipBuffer = await getStream.buffer(bufferStream);

    // Generate filename
    const date = new Date();
    const formattedDate = date
      .toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
      .replace(/ /g, '_')
      .replace(/,/g, '')
      .replace(/:/g, '_')
      .toLowerCase();

    const fileName = `raw_designs_${formattedDate}.zip`;

    // Create response
    const response = new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename=${fileName}`,
      },
    });

    return response;
  } catch (error) {
    console.error('Error creating zip:', error);
    return NextResponse.json({ message: 'Error generating zip file' }, { status: 500 });
  }
}
