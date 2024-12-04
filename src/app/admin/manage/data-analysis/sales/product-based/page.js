// /app/admin/manage/data-analysis/sales/product-based/page.js

'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Drawer,
  Button,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SalesFiltersDrawer from '@/components/page-sections/sales-analysis/SalesFiltersDrawer';
import TopProductsChart from '@/components/page-sections/sales-analysis/TopProductsChart';
import ProductCards from '@/components/page-sections/sales-analysis/ProductCards';
import axios from 'axios';
import FilterListIcon from '@mui/icons-material/FilterList';

const Dashboard = () => {
  const [dateFilter, setDateFilter] = useState('allTime');
  const [categoryVariants, setCategoryVariants] = useState([]);
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
  const [limit, setLimit] = useState(20); // Number of products to display
  const [salesData, setSalesData] = useState({ top: [], allProducts: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State for Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchSalesData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('dateFilter', dateFilter);
      params.append('sortOrder', sortOrder);
      params.append('limit', limit);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFilter, categoryVariants, sortOrder, limit]);

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" gutterBottom>
          Product-Specific Sales Dashboard
        </Typography>
        <IconButton
          color="primary"
          onClick={() => setDrawerOpen(true)}
          aria-label="open filters"
        >
          <FilterListIcon />
        </IconButton>
      </Box>

      {/* Drawer for Filters */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <SalesFiltersDrawer
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          categoryVariants={categoryVariants}
          setCategoryVariants={setCategoryVariants}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          limit={limit}
          setLimit={setLimit}
          onClose={() => setDrawerOpen(false)}
        />
      </Drawer>

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
            <TopProductsChart data={salesData.top} limit={limit} />
            {limit > 20 && <p style={{marginTop:'1rem'}}>Note: This graph does not show the products with 0 sales</p>}
          </Box>
          <Box mt={4}>
            <ProductCards data={salesData.top} />
          </Box>
          {/* Add more graphs and data as needed */}
        </>
      )}
    </Container>
  );
};

export default Dashboard;
