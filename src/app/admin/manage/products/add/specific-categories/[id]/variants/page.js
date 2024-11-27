'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Skeleton,
} from '@mui/material';

const SpecificCategoryVariantsPage = () => {
  const { id } = useParams(); // specificCategoryId
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!id) return; // Ensure id is available
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

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Specific Category Variants
      </Typography>
      <List>
        {loading
          ? Array.from(new Array(5)).map((_, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={<Skeleton variant="text" width="60%"  height={60}/>}
                />
              </ListItem>
            ))
          : variants.map((variant) => (
              <ListItem
                sx={{ cursor: 'pointer' }}
                key={variant._id}
                onClick={() =>
                  router.push(`/admin/manage/products/add?variantId=${variant._id}`)
                }
              >
                <ListItemText primary={variant.name} />
              </ListItem>
            ))}
      </List>
    </Box>
  );
};

export default SpecificCategoryVariantsPage;
