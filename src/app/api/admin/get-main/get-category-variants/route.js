// /app/api/admin/get-main/get-category-variants/route.js

import { connectToDatabase } from '@/lib/db';
import SpecificCategoryVariant from '@/models/SpecificCategoryVariant';
import { NextResponse } from 'next/server';

export const GET = async () => {
  try {
    await connectToDatabase();

    const variants = await SpecificCategoryVariant.find({ available: true }).select('_id name').exec();

    return NextResponse.json(variants);
  } catch (error) {
    console.error("Error fetching category variants:", error);
    return NextResponse.json({ error: 'Failed to fetch category variants' }, { status: 500 });
  }
};
