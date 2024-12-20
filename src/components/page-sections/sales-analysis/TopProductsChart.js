// src/components/page-sections/sales-analysis/TopProductsChart.js

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Typography, Box, useTheme } from '@mui/material';
import { styled } from '@mui/system';
import Image from 'next/image';


// Custom Scrollable Container with hidden vertical scrollbar and styled horizontal scrollbar
const ScrollableContainer = styled(Box)(({ theme }) => ({
  overflowX: 'auto',
  overflowY: 'hidden',
  '&::-webkit-scrollbar': {
    height: '8px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: theme.palette.primary.light,
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    backgroundColor: theme.palette.primary.main,
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: theme.palette.background.default,
  },
}));

const CustomTooltip = ({ active, payload }) => {
  const baseCloudfrontUrl = process.env.NEXT_PUBLIC_CLOUDFRONT_BASEURL || '';
  if (active && payload && payload.length) {
    // Access the correct data from the payload
    const product = payload[0].payload;

    return (
      <Box
        sx={{
          backgroundColor: 'white',
          border: '1px solid #ccc',
          padding: '10px',
          borderRadius: '4px',
          display: 'flex',
          color: 'black',
          alignItems: 'center',
          boxShadow: 3,
        }}
      >
        <Image
          width={50}
          height={50}
          src={`${baseCloudfrontUrl}${product.image}` || '/placeholder.png'}
          alt={product.name}
          style={{
            width: '50px',
            height: '50px',
            marginRight: '10px',
            objectFit: 'cover',
            borderRadius: '4px',
          }}
        />
        <Box>
          <Typography sx={{textTransform:'capitalize'}} variant="subtitle2">{product.name.length < 30 ? product.name : product.name.substring(0, 20) + '...'}</Typography>
          <Typography variant="body2">SKU: {product.sku}</Typography>
          <Typography variant="body2">Sold: {product.sales}</Typography>
          {/* <Typography variant="body2">
            Total Sales: ₹{product.totalSales.toLocaleString()}
          </Typography> */}
        </Box>
      </Box>
    );
  }

  return null;
};

const TopProductsChart = ({ data, limit }) => {
  const theme = useTheme();

  // Prepare data for the chart
  const chartData = data.map(item => ({
    name: item.name,
    sales: item.totalSold, // Match this key with the Bar's dataKey
    image: item.image,
    totalSales: item.totalSales,
    sku: item.sku,
  }));

  // Calculate dynamic width based on data length
  const dynamicWidth = Math.max(800, chartData.length * 100); // Adjust the multiplier as needed

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {`Top ${limit} Products by Sales`}
      </Typography>
      <ScrollableContainer>
        <ResponsiveContainer style={{ marginBottom: '-5rem' }} width={dynamicWidth} height={400}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 150 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              interval={0}
              height={150}
              tick={{ fontSize: 12 }}
            />
            <YAxis />
            {/* Ensure Tooltip uses the correct key */}
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="sales" fill={theme.palette.primary.main} />
          </BarChart>
        </ResponsiveContainer>
      </ScrollableContainer>
    </Box>
  );
};

export default TopProductsChart;
