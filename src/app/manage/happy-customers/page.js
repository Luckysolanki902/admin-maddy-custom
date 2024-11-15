'use client';

import React, { useState, useEffect } from 'react';
import { Box, Chip, TextField, Button, CircularProgress, Table, TableBody, TableCell, TableHead, TableRow, Snackbar, Typography } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { uploadToS3 } from '@/lib/aws';

const HappyCustomersPage = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [displayOrder, setDisplayOrder] = useState({});
  const [globalOptions, setGlobalOptions] = useState({ isGlobal: false, globalDisplayOrder: 0 });
  const [name, setName] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successAlert, setSuccessAlert] = useState(false);

  useEffect(() => {
    // Fetch specific categories
    fetch('/api/showcase/happycustomers/get-specific-categories')
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error('Error fetching categories:', err.message));
  }, []);

  const handleChipToggle = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
    );
  };

  const handleDisplayOrderChange = (categoryId, value) => {
    setDisplayOrder((prev) => ({
      ...prev,
      [categoryId]: value,
    }));
  };

  const handlePhotoUpload = async () => {
    if (!photoFile) return null;

    const randomPath = Math.random().toString(36).substring(2, 15);
    const fullPath = `assets/happy-customers/${randomPath}`;

    try {
      const relativePath = await uploadToS3(photoFile, fullPath, photoFile.type);
      const baseUrl = process.env.NEXT_PUBLIC_CLOUDFRONT_BASEURL;
      return `${baseUrl}/${relativePath}`;
    } catch (error) {
      console.error('Error uploading photo:', error.message);
      throw new Error('Photo upload failed');
    }
  };

  const handleFormSubmit = async () => {
    setLoading(true);

    try {
      const photoUrl = await handlePhotoUpload();
      const data = {
        name,
        photo: photoUrl,
        isGlobal: globalOptions.isGlobal,
        globalDisplayOrder: globalOptions.globalDisplayOrder,
        placements: selectedCategories.map((categoryId) => ({
          refType: 'SpecificCategory',
          refId: categoryId,
          displayOrder: displayOrder[categoryId] || 0,
        })),
      };

      const res = await fetch('/api/showcase/happycustomers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setSuccessAlert(true);
        setName('');
        setPhotoFile(null);
        setSelectedCategories([]);
        setDisplayOrder({});
        setGlobalOptions({ isGlobal: false, globalDisplayOrder: 0 });
      } else {
        alert('Error adding happy customer');
      }
    } catch (err) {
      console.error('Error in submission:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/jpeg': ['.jpg'] // Only allow .jpg files
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setPhotoFile(acceptedFiles[0]);
      } else {
        alert('Only .jpg files are allowed!');
      }
    },
  });
  

  return (
    <Box p={4}>
      <Typography variant="h3" gutterBottom>Manage Happy Customers</Typography>

      <TextField
        label="Customer Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        fullWidth
        sx={{ mb: 4 }}
        required
      />

      <Box {...getRootProps()} sx={{ mb: 4, border: '1px dashed gray', p: 2, textAlign: 'center', cursor: 'pointer' }}>
        <input {...getInputProps()} />
        {!photoFile ? <p>Drag & drop a photo here, or click to select</p> : <p>{photoFile.name}</p>}
      </Box>

      <Box mb={4}>
        {categories.map((category) => (
          <Chip
            key={category._id}
            label={category.name}
            onClick={() => handleChipToggle(category._id)}
            color={selectedCategories.includes(category._id) ? 'primary' : 'default'}
            style={{ margin: 4 }}
          />
        ))}
      </Box>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Category Name</TableCell>
            <TableCell>Display Order</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {selectedCategories.map((categoryId) => {
            const category = categories.find((c) => c._id === categoryId);
            return (
              <TableRow key={categoryId}>
                <TableCell>{category?.name}</TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    value={displayOrder[categoryId] || ''}
                    onChange={(e) => handleDisplayOrderChange(categoryId, e.target.value)}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <TextField
        label="Global Display Order"
        type="number"
        value={globalOptions.globalDisplayOrder}
        onChange={(e) => setGlobalOptions({ ...globalOptions, globalDisplayOrder: e.target.value })}
        fullWidth
        sx={{ mt: 4 }}
      />

      <Button
        onClick={handleFormSubmit}
        variant="contained"
        color="primary"
        disabled={loading || !photoFile || !name}
        sx={{ mt: 4 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Save Happy Customer'}
      </Button>

      <Snackbar
        open={successAlert}
        autoHideDuration={3000}
        onClose={() => setSuccessAlert(false)}
        message="Happy customer added successfully!"
      />
    </Box>
  );
};

export default HappyCustomersPage;
