// /app/api/product/get/unique-tags/route.js

import { connectToDatabase } from '@/lib/db';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';

export async function GET(request) {
  await connectToDatabase();

  try {
    // Fetch distinct main tags from the Product collection
    const uniqueMainTags = await Product.distinct('mainTags');

    return NextResponse.json({ uniqueMainTags }, { status: 200 });
  } catch (error) {
    console.error('Error fetching unique main tags:', error.message);
    return NextResponse.json(
      { error: 'Error fetching unique main tags.' },
      { status: 500 }
    );
  }
}
