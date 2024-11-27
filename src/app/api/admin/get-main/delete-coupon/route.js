// import connectToMongo from '@/middleware/middleware';
import Coupon from '@/models/Coupon';
import { connectToDatabase } from "@/lib/db";

export async function PUT(request) {
    try {
        await connectToDatabase();
        
        const {id} = request.query;
        const updatedCoupon = await Coupon.findByIdAndUpdate(id, request.body, { new: true });
        if (!updatedCoupon) {
            return new RESPONSE.status(404).json({ error: 'Coupon not found.' });
        }
        RESPONSE.status(200).json(updatedCoupon);
    }
    catch (error) {
        console.error('Error updating coupon:', error);
        return new RESPONSE.status(500).json({ error: 'Failed to update coupon.' });
    }
    }

    
    export async function DELETE(request) {
        try {
           
            await connectToDatabase();
    
           
            // const url = new URL(request.url);
            // const id = url.pathname.split('/').pop(); 
            const id = request
            console.log(id+"id reached here")
    
            if (!id) {
                return new Response(JSON.stringify({ error: 'Coupon ID not provided.' }), { status: 400 });
            }
    
            
            const deletedCoupon = await Coupon.findByIdAndDelete(id);
    
            if (!deletedCoupon) {
                return new Response(JSON.stringify({ error: 'Coupon not found.' }), { status: 404 });
            }
    
            
            return new Response(JSON.stringify({ message: 'Coupon deleted successfully.' }), { status: 200 });
        } catch (error) {
            console.error('Error deleting coupon:', error);
            return new Response(JSON.stringify({ error: 'Failed to delete coupon.' }), { status: 500 });
        }
    }
    

