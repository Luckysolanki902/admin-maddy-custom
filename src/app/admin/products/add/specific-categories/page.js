// /app/products/add/specific-categories/page.jsx

'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, List, ListItem, ListItemText, CircularProgress } from '@mui/material';
import { useRouter } from 'next/navigation';

const SpecificCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/get-main/specific-categories')
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching specific categories:', err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Box p={4} textAlign="center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Specific Categories
      </Typography>
      <List>
        {categories.map((category) => (
          <ListItem
          sx={{cursor: 'pointer'}}
            key={category._id}
            onClick={() => router.push(`/products/add/specific-categories/${category._id}/variants`)}
          >
            <ListItemText primary={category.name} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default SpecificCategoriesPage;
