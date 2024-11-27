// ./src/app/api/admin/manage/coupons/route.js

import Coupon from '@/models/Coupon';
import { connectToDatabase } from "@/lib/db";

// Handle GET and POST requests
export async function GET(request) {
    try {
        await connectToDatabase();
        // Fetch all coupons, sorted by creation date descending
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        return new Response(JSON.stringify(coupons), { status: 200 });
    } catch (error) {
        console.error('Error fetching coupons:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch coupons.' }), { status: 500 });
    }
}

export async function POST(request) {
    try {
        await connectToDatabase();
        const data = await request.json();

        // Validate required fields
        const { code, discountType, discountValue, validFrom, validUntil } = data;
        if (!code || !discountType || !discountValue || !validFrom || !validUntil) {
            return new Response(JSON.stringify({ error: 'Missing required fields.' }), { status: 400 });
        }

        // Create new coupon
        const newCoupon = new Coupon({
            code: code.toUpperCase(),
            discountType,
            discountValue,
            validFrom,
            validUntil,
            maxUses: data.maxUses || 1000000,
            showAsCard: data.showAsCard || false,
            description: data.description || '',
            minimumPurchasePrice: data.minimumPurchasePrice || 0,
            usagePerUser: data.usagePerUser || 1,
            isActive: data.isActive !== undefined ? data.isActive : true,
        });

        await newCoupon.save();
        return new Response(JSON.stringify(newCoupon), { status: 201 });
    } catch (error) {
        console.error('Error creating coupon:', error);
        let errorMessage = 'Failed to create coupon.';
        if (error.code === 11000) { // Duplicate key error
            errorMessage = 'Coupon code must be unique.';
        }
        return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
    }
}
