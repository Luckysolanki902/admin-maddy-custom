import HappyCustomer from '@/models/HappyCustomers';
import connectToMongo from '@/middleware/middleware';

const handler = async (req, res) => {
  if (req.method === 'POST') {
    try {
      // Extracting the new fields from the request body
      const { name, photo, isGlobal, placements, globalDisplayOrder, isActive } = req.body;

      // Create a new HappyCustomer document based on the new schema
      const newHappyCustomer = new HappyCustomer({
        name,
        photo,
        isGlobal: isGlobal || false,           // Defaults to false if not provided
        placements: placements || [],           // Defaults to empty array if not provided
        globalDisplayOrder: globalDisplayOrder || 0,
        isActive: isActive !== undefined ? isActive : true, // Defaults to true if not provided
      });

      await newHappyCustomer.save();

      res.status(201).json({ message: 'Happy customer added successfully!' });
    } catch (error) {
      console.error('Error adding happy customer:', error.message);
      res.status(500).json({ message: 'Error adding happy customer.' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};

export default connectToMongo(handler);








// import HappyCustomer from '@/models/HappyCustomers';
// import connectToMongo from '@/middleware/middleware';

// const handler = async (req, res) => {
//   if (req.method === 'POST') {
//     try {
//       const { category, imageUrl, customerName, customerReview, homePageOrder } = req.body;

//       const newHappyCustomer = new HappyCustomer({
//         category,
//         imageUrl,
//         customerName,
//         customerReview,
//         homePageOrder,
//       });

//       await newHappyCustomer.save();

//       res.status(201).json({ message: 'Happy customer added successfully!' });
//     } catch (error) {
//       console.error('Error adding happy customer:', error.message);
//       res.status(500).json({ message: 'Error adding happy customer.' });
//     }
//   } else {
//     res.status(405).json({ message: 'Method not allowed' });
//   }
// };

// export default connectToMongo(handler);
