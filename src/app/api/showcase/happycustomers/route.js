import { connectToDatabase } from '@/lib/db';
import HappyCustomer from '@/models/HappyCustomer';
import SpecificCategory from '@/models/SpecificCategory';

export async function GET(req) {
  await connectToDatabase();

  try {
    // Fetch all happy customers with placements populated
    const happyCustomers = await HappyCustomer.find()
      .populate('placements.refId', 'name') // Populate the name of SpecificCategory
      .exec();

    return new Response(JSON.stringify(happyCustomers), { status: 200 });
  } catch (error) {
    console.error('Error fetching happy customers:', error.message);
    return new Response('Error fetching happy customers', { status: 500 });
  }
}

export async function POST(req) {
  await connectToDatabase();

  const data = await req.json();

  try {
    if (data._id) {
      // Update existing happy customer
      const updatedCustomer = await HappyCustomer.findByIdAndUpdate(data._id, data, { new: true }).exec();
      return new Response(JSON.stringify(updatedCustomer), { status: 200 });
    }

    // Add a new happy customer
    const newCustomer = await HappyCustomer.create(data);
    return new Response(JSON.stringify(newCustomer), { status: 201 });
  } catch (error) {
    console.error('Error adding/updating happy customer:', error.message);
    return new Response('Error adding/updating happy customer', { status: 500 });
  }
}

export async function DELETE(req) {
  await connectToDatabase();

  const { id } = req.query;

  try {
    // Delete a happy customer by ID
    await HappyCustomer.findByIdAndDelete(id).exec();
    return new Response('Happy customer deleted successfully!', { status: 200 });
  } catch (error) {
    console.error('Error deleting happy customer:', error.message);
    return new Response('Error deleting happy customer', { status: 500 });
  }
}
