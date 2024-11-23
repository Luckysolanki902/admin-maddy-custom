import React from 'react';
import { Box, Typography } from '@mui/material';
import CustomerCard from '@/components/cards/CustomerCard';
import Skeleton from '@mui/material/Skeleton';

const OrdersList = ({ orders, loading, expanded, handleChange, totalOrders, ITEMS_PER_PAGE }) => {
  return (
    <Box>
      {loading ? (
        <Skeleton
          variant="text"
          width={250}
          height={70}
          sx={{ marginBottom: '0.5rem' }}
        />
      ) : (
        <Typography variant="h6" gutterBottom>
          Total Orders: {totalOrders}
        </Typography>
      )}
      {loading ? (
        // Display Skeletons while loading
        Array.from(new Array(ITEMS_PER_PAGE)).map((_, index) => (
          <Skeleton key={index} variant="rectangular" height={80} sx={{ marginBottom: '1rem' }} />
        ))
      ) : orders.length === 0 ? (
        <Typography variant="body1">No orders found.</Typography>
      ) : (
        orders.map(order => (
          <CustomerCard
            key={order._id}
            order={order}
            expanded={expanded}
            handleChange={handleChange}
          />
        ))
      )}
    </Box>
  );
};

export default OrdersList;
