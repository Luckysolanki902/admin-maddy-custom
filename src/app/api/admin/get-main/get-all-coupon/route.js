// /src/app/api/admin/get-main/get-all-coupon/route.js

import Coupon from '@/models/Coupon';
import { connectToDatabase } from "@/lib/db";

// Handle POST requests to add a new coupon
export async function POST(request) {
    try {
        await connectToDatabase();
        const {
            code,
            discountType,
            discountValue,
            validFrom,
            validUntil,
            maxUses = 100, // Default to 100 if not provided
            showAsCard = false, // Default to false
            captions = [], // Default to empty array
            description = '', // Default to empty string
            minimumPurchasePrice = 0, // Default to 0
            usagePerUser = 100, // Default to 100
        } = await request.json();

        // **Validation**

        // Check required fields
        if (!code || !discountType || discountValue === undefined || !validFrom || !validUntil) {
            return new Response(JSON.stringify({ error: 'Missing required fields: code, discountType, discountValue, validFrom, validUntil.' }), { status: 400 });
        }

        // Validate discountType
        if (!['fixed', 'percentage'].includes(discountType)) {
            return new Response(JSON.stringify({ error: 'Invalid discountType. Must be either "fixed" or "percentage".' }), { status: 400 });
        }

        // Validate validUntil is after validFrom
        const startDate = new Date(validFrom);
        const endDate = new Date(validUntil);
        if (endDate <= startDate) {
            return new Response(JSON.stringify({ error: 'validUntil must be after validFrom.' }), { status: 400 });
        }

        // Validate captions
        if (!Array.isArray(captions)) {
            return new Response(JSON.stringify({ error: 'Captions must be an array of strings.' }), { status: 400 });
        }
        for (let caption of captions) {
            if (typeof caption !== 'string' || caption.length > 200) {
                return new Response(JSON.stringify({ error: 'Each caption must be a string with a maximum length of 200 characters.' }), { status: 400 });
            }
        }

        // Validate description length
        if (description.length > 1000) {
            return new Response(JSON.stringify({ error: 'Description cannot exceed 1000 characters.' }), { status: 400 });
        }

        // Validate minimumPurchasePrice
        if (typeof minimumPurchasePrice !== 'number' || minimumPurchasePrice < 0) {
            return new Response(JSON.stringify({ error: 'minimumPurchasePrice must be a non-negative number.' }), { status: 400 });
        }

        // Validate usagePerUser
        if (typeof usagePerUser !== 'number' || usagePerUser < 1) {
            return new Response(JSON.stringify({ error: 'usagePerUser must be a number greater than or equal to 1.' }), { status: 400 });
        }

        // **Create New Coupon**

        const newCoupon = new Coupon({
            code: code.toUpperCase(), // Ensure code is uppercase
            discountType,
            discountValue,
            validFrom: startDate,
            validUntil: endDate,
            maxUses,
            usedCount: 0,
            isActive: true,
            showAsCard,
            captions,
            description,
            minimumPurchasePrice,
            usagePerUser,
        });

        const savedCoupon = await newCoupon.save();
        return new Response(JSON.stringify(savedCoupon), { status: 201 });
    } catch (error) {
        console.error('Error creating coupon:', error);
        if (error.code === 11000) { // Duplicate key error (unique code)
            return new Response(JSON.stringify({ error: 'Coupon code must be unique.' }), { status: 400 });
        } else if (error.name === 'ValidationError') { // Mongoose validation error
            return new Response(JSON.stringify({ error: error.message }), { status: 400 });
        } else {
            return new Response(JSON.stringify({ error: 'Failed to create coupon.' }), { status: 500 });
        }
    }
}

// Handle GET requests to fetch all coupons
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
