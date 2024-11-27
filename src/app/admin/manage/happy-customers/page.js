'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Chip,
  TextField,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Snackbar,
  Typography,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import AllHappyCustomers from '@/components/prod-site-ui-comps/sliders/AllHappyCustomers';

const HappyCustomersPage = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [displayOrder, setDisplayOrder] = useState({});
  const [globalOptions, setGlobalOptions] = useState({
    isGlobal: false,
    globalDisplayOrder: 0,
  });
  const [name, setName] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [showOnHomepage, setShowOnHomepage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successAlert, setSuccessAlert] = useState(false);

  useEffect(() => {
    // Fetch specific categories
    fetch('/api/admin/manage/happycustomers/get-specific-categories')
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
    const fullPath = `assets/happy-customers/${randomPath}.png`;

    try {
      // Convert file to base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(photoFile);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = (error) => reject(error);
      });

      const response = await fetch('/api/admin/aws/upload-to-s3', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file: base64,
          fullPath,
          fileType: photoFile.type,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const data = await response.json();
      return data.path;
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
        showOnHomepage,
        placements: selectedCategories.map((categoryId) => ({
          refType: 'SpecificCategory',
          refId: categoryId,
          displayOrder: displayOrder[categoryId] || 0,
        })),
      };

      const res = await fetch('/api/admin/manage/happycustomers', {
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
        setShowOnHomepage(false);
      } else {
        const errorData = await res.json();
        alert(`Error adding happy customer: ${errorData.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error in submission:', err.message);
      alert(`Submission failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setPhotoFile(acceptedFiles[0]);
      } else {
        alert('Only .jpeg, .jpg, and .png files are allowed!');
      }
    },
  });

  return (
    <Box p={4}>
      <Typography variant="h3" gutterBottom>
        Manage Happy Customers
      </Typography>
      {/* <HappyCustomers /> */}

      <TextField
        label="Customer Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        fullWidth
        sx={{ mb: 4 }}
        required
      />

      <Box
        {...getRootProps()}
        sx={{
          mb: 4,
          border: '1px dashed gray',
          p: 2,
          textAlign: 'center',
          cursor: 'pointer',
        }}
      >
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
        onChange={(e) =>
          setGlobalOptions({ ...globalOptions, globalDisplayOrder: e.target.value })
        }
        fullWidth
        sx={{ mt: 4 }}
      />

      <Box mt={4} display="flex" alignItems="center" gap={2}>
        <FormControlLabel
          control={
            <Checkbox
              checked={globalOptions.isGlobal}
              onChange={(e) =>
                setGlobalOptions({ ...globalOptions, isGlobal: e.target.checked })
              }
            />
          }
          label="Is Global"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={showOnHomepage}
              onChange={(e) => setShowOnHomepage(e.target.checked)}
            />
          }
          label="Show on Homepage"
        />
      </Box>

      <Button
        onClick={handleFormSubmit}
        variant="contained"
        color="primary"
        disabled={loading || !photoFile || !name}
        sx={{ mt: 4 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Save Happy Customer'}
      </Button>
      <AllHappyCustomers />

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
