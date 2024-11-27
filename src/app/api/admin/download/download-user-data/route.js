import { NextResponse } from 'next/server';
import { Parser } from 'json2csv';
import { connectToDatabase } from '@/lib/db';
import Order from '@/models/Order';
import SpecificCategory from '@/models/SpecificCategory';
import Product from '@/models/Product';
import User from '@/models/User';

// Ensure database connection
await connectToDatabase();

export async function GET(req) {
    try {
        // Parse query parameters from the request URL
        const { searchParams } = new URL(req.url);
        const queryParam = searchParams.get('query');
        if (!queryParam) {
            return NextResponse.json({ message: 'No query parameters provided.' }, { status: 400 });
        }

        const query1 = JSON.parse(queryParam);
        // Destructure the query object
        const { paymentStatus, createdAt, items, tags } = query1;

        // Initialize the base query
        const query = {};

        // Payment Status Filter
        if (paymentStatus?.$in && Array.isArray(paymentStatus.$in)) {
            query.paymentStatus = { $in: paymentStatus.$in };
        }

        // CreatedAt Range Filter
        if (createdAt && typeof createdAt === 'object' && Array.isArray(createdAt.$or)) {
            // Convert string dates to Date objects
            query.$or = createdAt.$or.map(cond => ({
                createdAt: {
                    $gte: new Date(cond.createdAt.$gte),
                    $lte: new Date(cond.createdAt.$lte),
                }
            }));
        }

        // Items Filter
        if (items && Array.isArray(items)) {
            // Fetch specific category IDs based on item names
            const specificCategories = await SpecificCategory.find({ name: { $in: items } }).select('_id');
            const specificCategoryIds = specificCategories.map(cat => cat._id);

            // Fetch product IDs associated with these categories
            const productIds = await Product.find({ specificCategory: { $in: specificCategoryIds } }).distinct('_id');

            query['items.product'] = { $in: productIds };
        }

        // Fetch orders based on the query
        const orders = await Order.find(query)
            .populate('user')
            .populate('items.product')
            .lean();

        // Extract unique customers
        const uniqueCustomersMap = new Map();
        orders.forEach((order) => {
            const user = order.user;
            if (user && !uniqueCustomersMap.has(user.phoneNumber)) {
                uniqueCustomersMap.set(user.phoneNumber, {
                    Name: user.name,
                    'Mobile Number': `91${user.phoneNumber}`,
                    Tags: tags || 'default', // Include the Tags field
                });
            }
        });

        const uniqueCustomers = Array.from(uniqueCustomersMap.values());

        // Handle no matching customers
        if (!uniqueCustomers.length) {
            return NextResponse.json({ message: 'No matching customers found.' }, { status: 404 });
        }

        // Convert data to CSV format
        const json2csvParser = new Parser({ fields: ['Name', 'Mobile Number', 'Tags'] });
        const csv = json2csvParser.parse(uniqueCustomers);

        // Set response headers for CSV download
        return new NextResponse(csv, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': 'attachment; filename=customers_data.csv',
            },
        });
    } catch (error) {
        console.error('Error generating CSV:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
