// src/components/page-sections/sales-analysis/Filters.js

import React, { useState, useEffect } from 'react';
import {
  Box,
  Chip,
  Typography,
  Autocomplete,
  TextField,
} from '@mui/material';
import axios from 'axios';

const dateOptions = [
  { label: 'Today', value: 'today' },
  { label: 'Last 7 Days', value: 'last7Days' },
  { label: 'Last 30 Days', value: 'last30Days' },
  { label: 'All Time', value: 'allTime' },
];

const Filters = ({
  dateFilter,
  setDateFilter,
  categoryVariants,
  setCategoryVariants,
}) => {
  const [variantOptions, setVariantOptions] = useState([]);

  // Fetch category variants on mount
  useEffect(() => {
    const fetchVariants = async () => {
      try {
        const response = await axios.get(
          '/api/admin/get-main/get-category-variants'
        );
        setVariantOptions(response.data);
      } catch (error) {
        console.error('Failed to fetch category variants:', error);
      }
    };
    fetchVariants();
  }, []);

  return (
    <Box
      display="flex"
      flexDirection={{ xs: 'column', md: 'row' }}
      gap={2}
      alignItems="center"
    >
      <Box>
        <Typography variant="subtitle1" gutterBottom>
          Date Filter:
        </Typography>
        {dateOptions.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            onClick={() => setDateFilter(option.value)}
            color={dateFilter === option.value ? 'primary' : 'default'}
            sx={{ mr: 1, mb: 1 }}
          />
        ))}
      </Box>

      <Box flexGrow={1}>
        <Typography variant="subtitle1" gutterBottom>
          Category Variants:
        </Typography>
        <Autocomplete
          multiple
          options={variantOptions}
          getOptionLabel={(option) => option.name}
          value={variantOptions.filter((opt) =>
            categoryVariants.includes(opt._id)
          )}
          onChange={(event, newValue) => {
            setCategoryVariants(newValue.map((item) => item._id));
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              placeholder="Select Category Variants"
            />
          )}
        />
      </Box>
    </Box>
  );
};

export default Filters;
