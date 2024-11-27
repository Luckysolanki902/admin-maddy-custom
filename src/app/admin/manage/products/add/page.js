// /app/admin/manage/products/add/page.js

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Snackbar,
  IconButton,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import slugify from 'slugify';
import ImageUpload from '@/components/utils/ImageUpload';

const AddProductPage = () => {
  const searchParams = useSearchParams();
  const variantId = searchParams.get('variantId');
  const router = useRouter();

  const [specificCategoryVariant, setSpecificCategoryVariant] = useState(null);
  const [specificCategory, setSpecificCategory] = useState(null);
  const [skuSerial, setSkuSerial] = useState(1);

  const [name, setName] = useState('');
  const [pageSlug, setPageSlug] = useState('');
  const [title, setTitle] = useState('');
  const [mainTag, setMainTag] = useState('');
  const [price, setPrice] = useState(0);
  const [displayOrder, setDisplayOrder] = useState(0);

  // Fields not shown in UI but managed internally
  const [hiddenFields, setHiddenFields] = useState({
    category: '',
    subCategory: '',
    deliveryCost: 100,
    stock: 1000,
    available: true,
    showInSearch: true,
    freebies: { available: false, description: '', image: '' },
  });

  const [uniqueMainTags, setUniqueMainTags] = useState([]);

  const [productImage, setProductImage] = useState(null);
  const [productionTemplateImage, setProductionTemplateImage] = useState(null);

  const [loading, setLoading] = useState(false);
  const [successAlert, setSuccessAlert] = useState(false);
  const [errorAlert, setErrorAlert] = useState('');

  // State for Dialog to create a new tag
  const [openDialog, setOpenDialog] = useState(false);
  const [newTag, setNewTag] = useState('');

  // Function to fetch unique main tags
  const fetchUniqueMainTags = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/manage/product/get/unique-tags');
      const data = await res.json();
      if (res.ok) {
        setUniqueMainTags(data.uniqueMainTags);
      } else {
        console.error('Error fetching unique main tags:', data.error);
      }
    } catch (err) {
      console.error('Error fetching unique main tags:', err.message);
    }
  }, []);

  // Function to fetch specific category variant and category
  const fetchSpecificCategoryData = useCallback(async () => {
    if (!variantId) {
      alert('No variant selected.');
      router.push('/admin/manage/products/add/specific-categories');
      return;
    }

    // Reset form fields when variantId changes
    setName('');
    setPageSlug('');
    setTitle('');
    setMainTag('');
    setPrice(0);
    setDisplayOrder(0);
    setHiddenFields({
      category: '',
      subCategory: '',
      deliveryCost: 100,
      stock: 1000,
      available: true,
      showInSearch: true,
      freebies: { available: false, description: '', image: '' },
    });
    setProductImage(null);
    setProductionTemplateImage(null);
    setSkuSerial(1);
    setErrorAlert('');

    try {
      // Fetch specific category variant details
      const resVariant = await fetch(
        `/api/admin/manage/product/get/get-specific-category-variant/${variantId}`
      );
      if (!resVariant.ok) {
        throw new Error('Failed to fetch specific category variant.');
      }
      const variantData = await resVariant.json();
      setSpecificCategoryVariant(variantData);

      // Fetch specific category details
      const resCategory = await fetch(
        `/api/admin/manage/product/get/get-specific-category/${variantData.specificCategory}`
      );
      if (!resCategory.ok) {
        throw new Error('Failed to fetch specific category.');
      }
      const categoryData = await resCategory.json();
      setSpecificCategory(categoryData);

      // Update hidden fields with category and subCategory
      setHiddenFields((prevFields) => ({
        ...prevFields,
        category: categoryData.category,
        subCategory: categoryData.subCategory,
      }));
    } catch (err) {
      console.error('Error fetching variant or category:', err.message);
      alert('Error fetching variant or category details.');
    }
  }, [variantId, router]);

  // Function to fetch the latest product and prefill fields
  const fetchLatestProduct = useCallback(async () => {
    if (specificCategoryVariant) {
      try {
        const res = await fetch(
          `/api/admin/manage/product/get/get-reference?variantCode=${specificCategoryVariant.variantCode}`
        );
        if (!res.ok) {
          // If no reference product is found, set SKU serial to 1 and return
          setSkuSerial(1);
          return;
        }

        const latestProduct = await res.json();

        // Prefill fields based on the latest product
        setPrice(latestProduct.price || 0);
        setMainTag(latestProduct.mainTags?.[0] || '');
        setDisplayOrder(latestProduct.displayOrder || 0);

        // Update hidden fields
        setHiddenFields({
          category: latestProduct.category || '',
          subCategory: latestProduct.subCategory || '',
          deliveryCost: latestProduct.deliveryCost || 100,
          stock: latestProduct.stock || 1000,
          available:
            latestProduct.available !== undefined ? latestProduct.available : true,
          showInSearch:
            latestProduct.showInSearch !== undefined
              ? latestProduct.showInSearch
              : true,
          freebies:
            latestProduct.freebies || { available: false, description: '', image: '' },
        });

        // Determine the next serial number for SKU
        const serial = parseInt(
          latestProduct.sku.replace(specificCategoryVariant.variantCode, ''),
          10
        );
        setSkuSerial(isNaN(serial) ? 1 : serial + 1);
      } catch (err) {
        console.error('Error fetching reference product:', err.message);
        alert('Error fetching reference product.');
      }
    }
  }, [specificCategoryVariant]);

  // Fetch unique main tags on component mount
  useEffect(() => {
    fetchUniqueMainTags();
  }, [fetchUniqueMainTags]);

  // Fetch specific category data when variantId changes
  useEffect(() => {
    fetchSpecificCategoryData();
  }, [fetchSpecificCategoryData]);

  // Fetch latest product when specificCategoryVariant changes or after resetting
  useEffect(() => {
    fetchLatestProduct();
  }, [fetchLatestProduct]);

  // Update Title and Page Slug based on Name and Specific Category
  useEffect(() => {
    if (specificCategory && name && specificCategoryVariant) {
      const constructedTitle = `${name} ${
        specificCategory.name.endsWith('s')
          ? specificCategory.name.slice(0, -1)
          : specificCategory.name
      }`;
      setTitle(constructedTitle);

      const slugifiedName = slugify(name, { lower: true, strict: true });
      const generatedSlug = `${specificCategoryVariant.pageSlug}/${slugifiedName}`;
      setPageSlug(generatedSlug);
    }
  }, [name, specificCategory, specificCategoryVariant]);

  const handleFormSubmit = async () => {
    if (!name || !productImage || !productionTemplateImage || !mainTag) {
      alert('Please fill all required fields.');
      return;
    }

    setLoading(true);

    try {
      // Construct SKU
      const sku = `${specificCategoryVariant.variantCode}${skuSerial}`;

      // Construct Image Path
      const imagePath = `products/${hiddenFields.category
        .toLowerCase()
        .replace(/\s+/g, '-')}/${hiddenFields.subCategory
        .toLowerCase()
        .replace(/\s+/g, '-')}/${specificCategory.name
        .toLowerCase()
        .replace(/\s+/g, '-')}/${specificCategoryVariant.variantCode
        .toLowerCase()
        .replace(/\s+/g, '-')}/${sku}.jpg`;

      // Construct Design Template Path
      const designTemplatePath = `${specificCategoryVariant.designTemplateFolderPath}/${sku}.png`;

      // Use API endpoint to upload images
      const uploadImage = async (file, fullPath, fileType) => {
        const base64Data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.onerror = (error) => reject(error);
        });

        const res = await fetch('/api/admin/aws/upload-to-s3', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            file: base64Data,
            fullPath,
            fileType,
          }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Failed to upload image');
        }

        const { path } = await res.json();
        return path;
      };

      const uploadedProductImagePath = await uploadImage(
        productImage,
        imagePath,
        'image/jpeg'
      );

      const uploadedDesignTemplatePath = await uploadImage(
        productionTemplateImage,
        designTemplatePath,
        'image/png'
      );

      // Construct Design Template Object
      const designTemplateObj = {
        designCode: sku,
        imageUrl: `${uploadedDesignTemplatePath}`,
      };

      // Prepare dynamic fields based on reference product
      const productData = {
        name,
        pageSlug,
        title,
        mainTags: [mainTag],
        price,
        displayOrder,
        specificCategory: specificCategory._id,
        specificCategoryVariant: specificCategoryVariant._id,
        ...hiddenFields,
        sku,
        designTemplate: designTemplateObj,
        images: [`${uploadedProductImagePath}`],
      };

      // Send data to API
      const res = await fetch('/api/admin/manage/product/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      if (res.ok) {
        setSuccessAlert(true);
        // Reset form fields
        setName('');
        setPageSlug('');
        setTitle('');
        setMainTag('');
        setPrice(0);
        setDisplayOrder(0);
        setHiddenFields({
          category: '',
          subCategory: '',
          deliveryCost: 100,
          stock: 1000,
          available: true,
          showInSearch: true,
          freebies: { available: false, description: '', image: '' },
        });
        setProductImage(null);
        setProductionTemplateImage(null);
        setSkuSerial(skuSerial + 1);
        setErrorAlert('');

        // Re-fetch the latest product to update SKU serial and other fields
        await fetchLatestProduct();
      } else {
        const errorText = await res.json();
        setErrorAlert(errorText.error || 'Error adding product');
      }
    } catch (error) {
      console.error('Error adding product:', error.message);
      setErrorAlert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle opening and closing of the new tag dialog
  const handleOpenDialog = () => {
    setOpenDialog(true);
    setNewTag('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewTag('');
  };

  const handleAddNewTag = () => {
    if (newTag.trim() === '') {
      alert('Tag name cannot be empty.');
      return;
    }

    // Check if the tag already exists
    if (uniqueMainTags.includes(newTag)) {
      alert('Tag already exists.');
      setMainTag(newTag);
      handleCloseDialog();
      return;
    }

    // Add the new tag to the mainTag state
    setMainTag(newTag);
    // Update the uniqueMainTags state to include the new tag
    setUniqueMainTags((prevTags) => [...prevTags, newTag]);
    handleCloseDialog();
  };

  if (!specificCategoryVariant || !specificCategory) {
    return (
      <Box p={4} textAlign="center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={4} maxWidth="900px" margin="0 auto">
      <Typography variant="h4" gutterBottom align="center">
        Add New Product
      </Typography>

      <Grid container spacing={4}>
        {/* Image Uploads */}
        <Grid item xs={12} md={6}>
          <ImageUpload
            label="Product Image (JPG)"
            accept="image/jpeg"
            onFileSelected={setProductImage}
            file={productImage}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <ImageUpload
            label="Production Template Image (PNG)"
            accept="image/png"
            onFileSelected={setProductionTemplateImage}
            file={productionTemplateImage}
          />
        </Grid>

        {/* Product Name */}
        <Grid item xs={12}>
          <TextField
            label="Product Name"
            value={name}
            onChange={(e) => {
              const value = e.target.value.replace(/[-?]/g, '');
              setName(value);
            }}
            fullWidth
            required
            inputProps={{ maxLength: 200 }}
          />
        </Grid>

        {/* Main Tag Select */}
        <Grid item xs={12}>
          <FormControl fullWidth required>
            <InputLabel id="main-tag-label">Main Tag</InputLabel>
            <Select
              labelId="main-tag-label"
              id="main-tag-select"
              value={mainTag}
              label="Main Tag"
              onChange={(e) => {
                if (e.target.value === '__create_new__') {
                  handleOpenDialog();
                } else {
                  setMainTag(e.target.value);
                }
              }}
            >
              {uniqueMainTags.map((tag) => (
                <MenuItem key={tag} value={tag}>
                  {tag}
                </MenuItem>
              ))}
              {/* Option to create a new tag */}
              <MenuItem value="__create_new__" sx={{ fontStyle: 'italic' }}>
                Add New Tag
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Price */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="Price"
            type="number"
            value={price}
            onChange={(e) => setPrice(parseFloat(e.target.value))}
            fullWidth
            required
            inputProps={{ min: 0, step: '0.01' }}
          />
        </Grid>

        {/* Display Order */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="Display Order"
            type="number"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10))}
            fullWidth
            required
            inputProps={{ min: 0 }}
          />
        </Grid>

        {/* Submit Button */}
        <Grid item xs={12}>
          <Box textAlign="center">
            <Button
              variant="contained"
              color="primary"
              onClick={handleFormSubmit}
              disabled={loading}
              size="large"
            >
              {loading ? <CircularProgress size={24} /> : 'Add Product'}
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Success Snackbar */}
      <Snackbar
        open={successAlert}
        autoHideDuration={3000}
        onClose={() => setSuccessAlert(false)}
        message="Product added successfully!"
        action={
          <IconButton size="small" color="inherit" onClick={() => setSuccessAlert(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />

      {/* Error Snackbar */}
      <Snackbar
        open={!!errorAlert}
        autoHideDuration={3000}
        onClose={() => setErrorAlert('')}
        message={errorAlert}
        action={
          <IconButton size="small" color="inherit" onClick={() => setErrorAlert('')}>
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />

      {/* Dialog for Adding New Tag */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Add New Tag</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="New Tag Name"
            type="text"
            fullWidth
            variant="standard"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleAddNewTag}>Add</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AddProductPage;
