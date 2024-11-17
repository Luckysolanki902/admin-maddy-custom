import SpecificCategory from "@/models/SpecificCategory";
import Product from "@/models/Product";
import SpecificCategoryVariant from "@/models/SpecificCategoryVariant";
import { connectToDatabase } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  await connectToDatabase();

  try {
    await SpecificCategory.deleteMany({});
    await Product.deleteMany({});
    await SpecificCategoryVariant.deleteMany({});

    return NextResponse.json({ message: 'All specific categories deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting specific categories:', error.message);
    return NextResponse.json({ message: 'Error deleting specific categories' }, { status: 500 });
  }
}

