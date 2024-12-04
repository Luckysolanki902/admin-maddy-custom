// src/components/page-sections/sales-analysis/SalesFiltersDrawer.js

import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Autocomplete,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Slider,
  Button,
} from '@mui/material';
import axios from 'axios';

const dateOptions = [
  { label: 'Today', value: 'today' },
  { label: 'Last 7 Days', value: 'last7Days' },
  { label: 'Last 30 Days', value: 'last30Days' },
  { label: 'All Time', value: 'allTime' },
];

const SalesFiltersDrawer = ({
  dateFilter,
  setDateFilter,
  categoryVariants,
  setCategoryVariants,
  sortOrder,
  setSortOrder,
  limit,
  setLimit,
  onClose,
}) => {
  const [variantOptions, setVariantOptions] = React.useState([]);

  // Fetch category variants on mount
  React.useEffect(() => {
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

  const handleReset = () => {
    setDateFilter('allTime');
    setCategoryVariants([]);
    setSortOrder('desc');
    setLimit(20);
  };

  return (
    <Box sx={{ width: 300, p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Filters
      </Typography>

      {/* Date Filter */}
      <Box mb={3}>
        <Typography variant="subtitle1" gutterBottom>
          Date Filter
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

      {/* Category Variants */}
      <Box mb={3}>
        <Typography variant="subtitle1" gutterBottom>
          Category Variants
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

      {/* Sort Order */}
      {/* <Box mb={3}>
        <FormControl component="fieldset">
          <FormLabel component="legend">Sort Order</FormLabel>
          <RadioGroup
            row
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <FormControlLabel
              value="desc"
              control={<Radio />}
              label="Descending"
            />
            <FormControlLabel
              value="asc"
              control={<Radio />}
              label="Ascending"
            />
          </RadioGroup>
        </FormControl>
      </Box> */}

      {/* Limit Slider */}
      <Box mb={3}>
        <Typography variant="subtitle1" gutterBottom>
          Number of Products: {limit}
        </Typography>
        <Slider
          value={limit}
          onChange={(e, newValue) => setLimit(newValue)}
          aria-labelledby="limit-slider"
          valueLabelDisplay="auto"
          step={5}
          marks
          min={5}
          max={100}
        />
      </Box>

      {/* Action Buttons */}
      <Box display="flex" justifyContent="space-between">
        <Button variant="outlined" color="secondary" onClick={handleReset}>
          Reset
        </Button>
        <Button variant="contained" color="primary" onClick={onClose}>
          Apply
        </Button>
      </Box>
    </Box>
  );
};

export default SalesFiltersDrawer;
