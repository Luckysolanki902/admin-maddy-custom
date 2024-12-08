// /app/api/product/add/route.js

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Product from '@/models/Product';
import SpecificCategoryVariant from '@/models/SpecificCategoryVariant';
import SpecificCategory from '@/models/SpecificCategory';
import { ObjectId } from 'mongodb';

export async function POST(req) {
  await connectToDatabase();

  const data = await req.json();

  try {
    const {
      name,
      mainTags,
      searchKeywords,
      price,
      displayOrder,
      pageSlug,
      title,
      category,
      subCategory,
      specificCategory,
      specificCategoryVariant,
      deliveryCost,
      available,
      showInSearch,
      stock,
      freebies,
      sku,
      designTemplate,
      images,
    } = data;

    // Validate required fields
    const requiredFields = [
      'name',
      'mainTags',
      'price',
      'displayOrder',
      'pageSlug',
      'title',
      'category',
      'subCategory',
      'specificCategory',
      'specificCategoryVariant',
      'deliveryCost',
      'available',
      'showInSearch',
      'stock',
      'freebies',
      'sku',
      'designTemplate',
      'images',
    ];

    for (const field of requiredFields) {
      if (data[field] === undefined || data[field] === null || data[field] === '') {
        return NextResponse.json(
          { error: `Field '${field}' is required.` },
          { status: 400 }
        );
      }
    }

    // Fetch specific category and variant from database to ensure they exist
    if (!ObjectId.isValid(specificCategory) || !ObjectId.isValid(specificCategoryVariant)) {
      return NextResponse.json(
        { error: 'Invalid specificCategory or specificCategoryVariant ID.' },
        { status: 400 }
      );
    }

    const specificCategoryDoc = await SpecificCategory.findById(specificCategory).lean();
    const specificCategoryVariantDoc = await SpecificCategoryVariant.findById(specificCategoryVariant).lean();

    if (!specificCategoryDoc || !specificCategoryVariantDoc) {
      return NextResponse.json({ error: 'Specific Category or Variant not found.' }, { status: 400 });
    }

    // Check if SKU already exists
    const existingProduct = await Product.findOne({ sku }).lean();
    if (existingProduct) {
      return NextResponse.json({ error: 'SKU already exists.' }, { status: 400 });
    }

    // Construct Title
    const constructedTitle = `${name} ${
      specificCategoryDoc.name.endsWith('s') ? specificCategoryDoc.name.slice(0, -1) : specificCategoryDoc.name
    }`;

    // Create a new product
    const newProduct = new Product({
      name,
      images: images.map((image) => (image.startsWith('/') ? image : `/${image}`)),
      title: constructedTitle,
      mainTags,
      price,
      displayOrder,
      pageSlug,
      category,
      subCategory,
      specificCategory,
      specificCategoryVariant,
      deliveryCost,
      available,
      showInSearch,
      stock,
      freebies,
      sku,
      designTemplate,
    });

    await newProduct.save();

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('Error adding product:', error.message);
    return NextResponse.json({ error: 'Error adding product.' }, { status: 500 });
  }
}
