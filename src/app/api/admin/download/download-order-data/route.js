
// export default connectToDatabase(handler);
import { NextResponse } from 'next/server';
import { Parser } from 'json2csv';
import { connectToDatabase } from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';
import Product from '@/models/Product';
import SpecificCategory from '@/models/SpecificCategory';

// Ensure database connection
await connectToDatabase();

export async function GET(req) {
    try {
        // Parse query parameters from the request URL
        const { searchParams } = new URL(req.url);
        const queryParam = searchParams.get('query');
        const query1 = JSON.parse(queryParam);
        // console.log('Received Query:', query1);

        // Destructure the query object
        const { paymentStatus, deliveryStatus, createdAt, items } = query1;

        // Initialize the base query
        const query = {};

        // Payment Status Filter
        if (paymentStatus?.$in) {
            query.paymentStatus = { $in: paymentStatus.$in };
        }

        // Delivery Status Filter
        if (deliveryStatus?.$in) {
            query.deliveryStatus = { $in: deliveryStatus.$in };
        }

        // CreatedAt Range Filter
        if (createdAt && Array.isArray(createdAt)) {
            const dateConditions = createdAt
                .map((range) => {
                    if (range.createdAt) {
                        const { $gte, $lte } = range.createdAt;
                        const dateRange = {};
                        if ($gte) dateRange.$gte = new Date($gte);
                        if ($lte) dateRange.$lte = new Date($lte);
                        return { createdAt: dateRange };
                    }
                    return null;
                })
                .filter(Boolean); // Remove null entries

            if (dateConditions.length > 0) {
                query.$or = dateConditions;
            }
        }

        // Items Filter
        if (items && Array.isArray(items)) {
            const specificCategories = await SpecificCategory.find({ name: { $in: items } }).select('_id');
            const specificCategoryIds = specificCategories.map((cat) => cat._id);

            const productIds = await Product.find({ specificCategory: { $in: specificCategoryIds } }).distinct('_id');

            query['items.product'] = { $in: productIds };
        }

        // console.log('Generated MongoDB Query:', query);

        // Fetch orders based on the query
        const orders = await Order.find(query)
            .populate('user')
            .populate('items.product')
            .lean();

        // console.log('Orders:', orders);

        // Extract unique customers
        const uniqueCustomersMap = new Map();
        orders.forEach((order) => {
            const user = order.user;
            if (user && !uniqueCustomersMap.has(user.phoneNumber)) {
                uniqueCustomersMap.set(user.phoneNumber, {
                    Name: user.name,
                    'Mobile Number': `91${user.phoneNumber}`,
                    Tags: 'default',
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

