// /app/api/product/get/get-specific-category-variant/[id]/route.js

import { connectToDatabase } from '@/lib/db';
import SpecificCategoryVariant from '@/models/SpecificCategoryVariant';
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

export async function GET(request, { params }) {
  const { id } = await params; // Corrected: Removed 'await'

  // Validate the id
  if (!ObjectId.isValid(id)) {
    return NextResponse.json(
      { error: 'Invalid Specific Category Variant ID provided.' },
      { status: 400 }
    );
  }

  await connectToDatabase();

  try {
    const variant = await SpecificCategoryVariant.findById(id).lean();

    if (!variant) {
      return NextResponse.json(
        { error: 'Specific Category Variant not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json(variant, { status: 200 });
  } catch (error) {
    console.error('Error fetching specific category variant:', error.message);
    return NextResponse.json(
      { error: 'Error fetching specific category variant.' },
      { status: 500 }
    );
  }
}
