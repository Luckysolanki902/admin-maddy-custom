import connectToMongo from '@/middleware/middleware';
import Coupon from '@/models/Coupon';

const handler = async (req, res) => {
    const { id } = req.query;

    if (req.method === 'PUT') {
        try {
            const updatedCoupon = await Coupon.findByIdAndUpdate(id, req.body, { new: true });

            if (!updatedCoupon) {
                return res.status(404).json({ error: 'Coupon not found.' });
            }

            res.status(200).json(updatedCoupon);
        } catch (error) {
            console.error('Error updating coupon:', error);
            res.status(500).json({ error: 'Failed to update coupon.' });
        }
    } else if (req.method === 'DELETE') {
        try {
            const deletedCoupon = await Coupon.findByIdAndDelete(id);

            if (!deletedCoupon) {
                return res.status(404).json({ error: 'Coupon not found.' });
            }

            res.status(200).json({ message: 'Coupon deleted successfully.' });
        } catch (error) {
            console.error('Error deleting coupon:', error);
            res.status(500).json({ error: 'Failed to delete coupon.' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
};

export default connectToMongo(handler);
