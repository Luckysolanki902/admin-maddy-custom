import axios from 'axios';
const SpecificCategoryVariant = require('@/models/SpecificCategoryVariant');

/**
 * Function to get Shiprocket token
 */
export async function getShiprocketToken() {
  try {
    const response = await axios.post('https://apiv2.shiprocket.in/v1/external/auth/login', {
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    });
    return response.data.token;
  } catch (error) {
    console.error('Error fetching Shiprocket token:', error.response ? error.response.data : error.message);
    throw new Error('Failed to retrieve Shiprocket token.');
  }
}

/**
 * Function to create a Shiprocket order
 */
export async function createShiprocketOrder(orderData) {
  try {
    const token = await getShiprocketToken();

    const response = await axios.post('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', orderData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating Shiprocket order:', error.response ? error.response.data : error.message);
    throw new Error('Failed to create Shiprocket order.');
  }
}

/**
 * Function to track a Shiprocket order by order ID
 */
export async function trackShiprocketOrder(orderId) {
  try {
    const token = await getShiprocketToken();

    const response = await axios.get(`https://apiv2.shiprocket.in/v1/external/courier/track`, {
      params: { order_id: orderId },
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error tracking Shiprocket order:', error.response ? error.response.data : error.message);
    throw new Error('Failed to track Shiprocket order.');
  }
}

/**
 * Calculates the total dimensions and weight for the order based on its items' variants.
 * Groups items by the same box ID and calculates the total dimensions and weight.
 *
 * @param {Array} items - Array of order items.
 * @returns {Object} - Total length, breadth, height, and weight.
 */
export const getDimensionsAndWeight = async (items) => {
  const variantIds = items.map(item => {
    if (item.product && item.product.specificCategoryVariant) {
      return item.product.specificCategoryVariant._id;
    }
    console.warn(`Skipping item due to missing Product or SpecificCategoryVariant: ${item._id}`);
    return null;
  }).filter(id => id !== null);

  // Fetch all variants with their packaging details
  const variants = await SpecificCategoryVariant.find({ _id: { $in: variantIds } })
    .populate('packagingDetails.boxId');

  const variantMap = {};
  variants.forEach(variant => {
    const { boxId, productWeight } = variant.packagingDetails || {};
    variantMap[variant._id.toString()] = {
      box: boxId,
      productWeight: productWeight || 0,
    };
  });

  const boxGroupMap = {};

  for (const item of items) {
    const variantId = item.product.specificCategoryVariant._id.toString();
    const variantData = variantMap[variantId];

    if (!variantData) {
      throw new Error(`Variant with ID ${variantId} not found.`);
    }

    const { box, productWeight } = variantData;

    if (!box) {
      throw new Error(`Box details missing for variant ID ${variantId}.`);
    }

    // Group by box ID
    if (!boxGroupMap[box._id]) {
      boxGroupMap[box._id] = {
        box,
        totalQuantity: 0,
        totalWeight: 0,
      };
    }

    // Accumulate quantities and weights for this box group
    boxGroupMap[box._id].totalQuantity += item.quantity;
    boxGroupMap[box._id].totalWeight += productWeight * item.quantity;
  }

  let totalWrapWeight = 0;
  let totalBoxWeight = 0;
  let totalLength = 0;
  let totalBreadth = 0;
  let totalHeight = 0;

  Object.values(boxGroupMap).forEach(({ box, totalQuantity, totalWeight }) => {
    const numberOfBoxes = Math.ceil(totalQuantity / box.capacity);

    // Calculate total box weight
    totalBoxWeight += box.weight * numberOfBoxes;

    // Accumulate dimensions (multiplied by the number of boxes)
    totalLength += box.dimensions.length * numberOfBoxes;
    totalBreadth += box.dimensions.breadth * numberOfBoxes;
    totalHeight += box.dimensions.height * numberOfBoxes;

    // Accumulate wrap weight (product weight)
    totalWrapWeight += totalWeight;
  });

  // Total weight is the sum of wrap weight and box weight
  const totalWeight = totalWrapWeight + totalBoxWeight;

  return {
    length: totalLength,
    breadth: totalBreadth,
    height: totalHeight,
    weight: totalWeight,
  };
};
