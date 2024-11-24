// /app/products/add/specific-categories/[id]/variants/page.jsx

'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, Typography, List, ListItem, ListItemText, CircularProgress } from '@mui/material';

const SpecificCategoryVariantsPage = () => {
  const { id } = useParams(); // specificCategoryId
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/admin/get-main/specific-category-variants/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setVariants(data);
        setLoading(false);
      })


      .catch((err) => {
        console.error('Error fetching specific category variants:', err.message);
        setLoading(false);
      });
  }, [id]);

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
        Specific Category Variants
      </Typography>
      <List>
        {variants.map((variant) => (
          <ListItem sx={{cursor: 'pointer'}} key={variant._id}  onClick={() => router.push(`/admin/products/add?variantId=${variant._id}`)}>
            <ListItemText primary={variant.name} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default SpecificCategoryVariantsPage;
