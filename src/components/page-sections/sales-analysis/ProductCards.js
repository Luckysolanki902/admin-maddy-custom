// src/components/page-sections/sales-analysis/ProductCards.js

import React from 'react';
import {
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  CardActions,
  Button,
} from '@mui/material';
import { styled } from '@mui/system';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: theme.shadows[3],
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[6],
  },
}));

const ProductCards = ({ data }) => {
  const baseCloudfrontUrl = process.env.NEXT_PUBLIC_CLOUDFRONT_BASEURL || '';

  return (
    <Grid container spacing={4}>
      {data.map((product) => (
        <Grid item key={product._id} xs={12} sm={6} md={4} lg={3}>
          <StyledCard>
            <CardMedia
              component="img"
              image={product.image ? `${baseCloudfrontUrl}${product.image}` : '/placeholder.png'}
              alt={product.name}
              height="160"
            />
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography
                gutterBottom
                variant="h6"
                component="div"
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}
              >
                {product.name.length < 30 ? product.name : product.name.substring(0, 20) + '...'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Price: ₹{product.price.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sold: {product.totalSold}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                SKU: {product.sku}
              </Typography>
              {/* <Typography variant="body2" color="text.secondary">
                Total Sales: ₹{product.totalSales.toLocaleString()}
              </Typography> */}
            </CardContent>
            {/* <CardActions>
              <Button size="small" variant="contained" color="primary">
                View Details
              </Button>
            </CardActions> */}
          </StyledCard>
        </Grid>
      ))}
    </Grid>
  );
};

export default ProductCards;
