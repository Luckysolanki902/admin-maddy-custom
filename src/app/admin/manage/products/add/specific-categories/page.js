'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Skeleton,
  Grid,
} from '@mui/material';
import { useRouter } from 'next/navigation';

const SpecificCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin/get-main/specific-categories')
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

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Specific Categories
      </Typography>
      <List>
        {loading
          ? Array.from(new Array(5)).map((_, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={<Skeleton variant="text" width="60%" height={60}/>}
                />
              </ListItem>
            ))
          : categories.map((category) => (
              <ListItem
                sx={{ cursor: 'pointer' }}
                key={category._id}
                onClick={() =>
                  router.push(
                    `/admin/manage/products/add/specific-categories/${category._id}/variants`
                  )
                }
              >
                <ListItemText primary={category.name} />
              </ListItem>
            ))}
      </List>
    </Box>
  );
};

export default SpecificCategoriesPage;
