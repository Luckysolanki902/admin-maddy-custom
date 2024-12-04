// /app/admin/manage/data-analysis/sales/product-based/page.js

'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import Filters from '@/components/page-sections/sales-analysis/Filters';
import TopProductsChart from '@/components/page-sections/sales-analysis/TopProductsChart';
import ProductCards from '@/components/page-sections/sales-analysis/ProductCards';
import axios from 'axios';

const Dashboard = () => {
  const [dateFilter, setDateFilter] = useState('allTime');
  const [categoryVariants, setCategoryVariants] = useState([]);
  const [salesData, setSalesData] = useState({ top20: [], allProducts: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSalesData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('dateFilter', dateFilter);
      categoryVariants.forEach((variant) =>
        params.append('categoryVariants', variant)
      );

      const response = await axios.get(
        `/api/admin/get-main/product-specific-sales-data?${params.toString()}`
      );
      setSalesData(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load sales data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, [dateFilter, categoryVariants]);

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Product-Specific Sales Dashboard
      </Typography>

      <Filters
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        categoryVariants={categoryVariants}
        setCategoryVariants={setCategoryVariants}
      />

      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          mt={4}
        >
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      ) : (
        <>
          <Box mt={4}>
            <TopProductsChart data={salesData.top20} />
          </Box>
          <Box mt={4}>
            <ProductCards data={salesData.top20} />
          </Box>
          {/* Add more graphs and data as needed */}
        </>
      )}
    </Container>
  );
};

export default Dashboard;
