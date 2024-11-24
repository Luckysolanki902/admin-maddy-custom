// /app/api/get-main/specific-categories/route.js

import { connectToDatabase } from '@/lib/db';
import SpecificCategory from '@/models/SpecificCategory';

export async function GET(request) {
  await connectToDatabase();

  try {
    const specificCategories = await SpecificCategory.find().select('name _id').lean();
    return new Response(JSON.stringify(specificCategories), { status: 200 });
  } catch (error) {
    console.error('Error fetching specific categories:', error.message);
    return new Response('Error fetching specific categories', { status: 500 });
  }
}
