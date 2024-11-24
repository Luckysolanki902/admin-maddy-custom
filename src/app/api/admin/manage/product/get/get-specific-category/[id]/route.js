// /app/api/manage/product/get/get-specific-category/[id]/route.js

import { connectToDatabase } from '@/lib/db';
import SpecificCategory from '@/models/SpecificCategory';
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

export async function GET(request, { params }) {
  const { id } = await params; // Corrected: Removed 'await'

  // Validate the id
  if (!ObjectId.isValid(id)) {
    return NextResponse.json(
      { error: 'Invalid Specific Category ID provided.' },
      { status: 400 }
    );
  }

  await connectToDatabase();

  try {
    const category = await SpecificCategory.findById(id).lean();

    if (!category) {
      return NextResponse.json(
        { error: 'Specific Category not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json(category, { status: 200 });
  } catch (error) {
    console.error('Error fetching specific category:', error.message);
    return NextResponse.json(
      { error: 'Error fetching specific category.' },
      { status: 500 }
    );
  }
}
