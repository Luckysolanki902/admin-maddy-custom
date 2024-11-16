import { connectToDatabase } from '@/lib/db'
import SpecificCategory from '@/models/SpecificCategory';

export async function GET(req) {
  await connectToDatabase();
  
  try {
    const variants = await SpecificCategory.find().select('name _id').lean();
    return new Response(JSON.stringify(variants), { status: 200 });
    
  } catch (error) {
    console.error('Error fetching specific category variants:', error.message);
    return new Response('Error fetching specific category variants', { status: 500 });
  }
}
