// ./src/app/api/admin/manage/coupons/[id].js

import Coupon from '@/models/Coupon';
import { connectToDatabase } from "@/lib/db";
import { ObjectId } from 'mongodb';

// Handle PUT and DELETE requests for a specific coupon
export async function PUT(request, { params }) {
    const { id } = await params;

    try {
        await connectToDatabase();
        const data = await request.json();

        // Ensure the coupon exists
        const coupon = await Coupon.findById(id);
        if (!coupon) {
            return new Response(JSON.stringify({ error: 'Coupon not found.' }), { status: 404 });
        }

        // Update fields
        const updateFields = { ...data };
        if (updateFields.code) {
            updateFields.code = updateFields.code.toUpperCase();
        }

        // Validate validUntil > validFrom if dates are being updated
        if (updateFields.validFrom || updateFields.validUntil) {
            const validFrom = updateFields.validFrom ? new Date(updateFields.validFrom) : coupon.validFrom;
            const validUntil = updateFields.validUntil ? new Date(updateFields.validUntil) : coupon.validUntil;

            if (validUntil <= validFrom) {
                return new Response(JSON.stringify({ error: 'Valid Until date must be after Valid From date.' }), { status: 400 });
            }

            updateFields.validFrom = validFrom;
            updateFields.validUntil = validUntil;
        }

        // Update the coupon
        const updatedCoupon = await Coupon.findByIdAndUpdate(id, updateFields, { new: true, runValidators: true });
        return new Response(JSON.stringify(updatedCoupon), { status: 200 });
    } catch (error) {
        console.error('Error updating coupon:', error);
        let errorMessage = 'Failed to update coupon.';
        if (error.code === 11000) { // Duplicate key error
            errorMessage = 'Coupon code must be unique.';
        }
        return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    const { id } = params;

    try {
        await connectToDatabase();
        const coupon = await Coupon.findById(id);
        if (!coupon) {
            return new Response(JSON.stringify({ error: 'Coupon not found.' }), { status: 404 });
        }

        await Coupon.findByIdAndDelete(id);
        return new Response(JSON.stringify({ message: 'Coupon deleted successfully.' }), { status: 200 });
    } catch (error) {
        console.error('Error deleting coupon:', error);
        return new Response(JSON.stringify({ error: 'Failed to delete coupon.' }), { status: 500 });
    }
}
