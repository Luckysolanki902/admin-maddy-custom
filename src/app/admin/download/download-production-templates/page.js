// /app/admin/images/page.jsx

'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  TextField,
  Stack,
  Alert,
  CircularProgress,
  Paper,
  Typography,
  Grid,
  Tooltip,
  Snackbar,
} from '@mui/material';
import {
  Download as DownloadIcon,
  ContentCopy as ContentCopyIcon,
  ImageNotSupported as ImageNotSupportedIcon, // Fallback icon
} from '@mui/icons-material';
import dayjs from 'dayjs';
import Image from 'next/image';

const ImagesPage = () => {
  const [dateTag, setDateTag] = useState('today');
  const [imagesData, setImagesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [unavailableImages, setUnavailableImages] = useState(new Set()); // Track unavailable images
  const [snackbarOpen, setSnackbarOpen] = useState(false); // For clipboard feedback

  const CLOUDFRONT_BASEURL = process.env.NEXT_PUBLIC_CLOUDFRONT_BASEURL;
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL; // Ensure this is set in your .env

  // Function to fetch images data
  const fetchImagesData = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/admin/get-main/get-sku-count?dateTag=${dateTag}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error fetching data.');
      }
      const data = await res.json();
      setImagesData(data);
      setUnavailableImages(new Set()); // Reset unavailable images on new fetch
    } catch (error) {
      console.error('Error fetching images:', error);
      setError(error.message || 'Failed to fetch images data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImagesData();
  }, [dateTag]);

  // Function to handle image download
  const handleDownload = async () => {
    // Filter out unavailable images
    const availableImages = imagesData.filter((item) => !unavailableImages.has(item._id));

    if (availableImages.length === 0) {
      setError('No available images to download.');
      return;
    }

    setDownloadLoading(true);
    setError('');
    setSuccess('');

    const startTime = performance.now(); // Start timing

    try {
      // Prepare stickers with their counts
      const stickersWithCounts = availableImages.map((item) => ({
        stickerId: item._id,
        count: item.count,
      }));

      const res = await fetch('/api/admin/download/download-raw-designs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stickers: stickersWithCounts }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to download zip.');
      }

      const blob = await res.blob();
      const date = new Date();
      const formattedDate = date
        .toLocaleString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
        .replace(/ /g, '_')
        .replace(/,/g, '')
        .replace(/:/g, '_')
        .toLowerCase();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `raw_designs_${formattedDate}.zip`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      const endTime = performance.now(); // End timing
      const timeTaken = ((endTime - startTime) / 1000).toFixed(2); // Time in seconds with 2 decimal places

      if (availableImages.length < imagesData.length) {
        const excludedCount = imagesData.length - availableImages.length;
        setSuccess(
          `Download started in ${timeTaken} seconds. ${excludedCount} image${
            excludedCount > 1 ? 's were' : ' was'
          } excluded due to unavailability.`
        );
      } else {
        setSuccess(`Download started in ${timeTaken} seconds.`);
      }
    } catch (error) {
      console.error('Error downloading zip:', error);
      setError(error.message || 'Failed to download zip.');
    } finally {
      setDownloadLoading(false);
    }
  };

  // Function to handle copying download link to clipboard
  const handleCopyDownloadLink = () => {
    // Filter out unavailable images
    const availableImages = imagesData.filter((item) => !unavailableImages.has(item._id));

    if (availableImages.length === 0) {
      setError('No available images to generate download link.');
      return;
    }

    // Construct stickerIds and counts
    const stickerIds = availableImages.map((item) => item._id).join(',');
    const counts = availableImages.map((item) => item.count).join(',');

    // Construct the download link
    const downloadLink = `${SITE_URL}/api/admin/download-raw-designs?stickerIds=${encodeURIComponent(
      stickerIds
    )}&counts=${encodeURIComponent(counts)}`;

    // Copy to clipboard
    navigator.clipboard
      .writeText(downloadLink)
      .then(() => {
        setSuccess('Download link copied to clipboard!');
        setSnackbarOpen(true);
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
        setError('Failed to copy download link.');
      });
  };

  // Function to handle Snackbar close
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Calculate total orders
  const totalOrders = imagesData.reduce((acc, item) => acc + item.count, 0);

  // Calculate unavailable count based on failed image loads
  const unavailableCount = unavailableImages.size;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Raw Design Images
      </Typography>

      {/* Feedback Messages */}
      <Stack spacing={2} sx={{ mb: 2 }}>
        {error && (
          <Alert severity="error" onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}
      </Stack>

      {/* Date Selection Buttons */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Select Date
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Button
              onClick={() => setDateTag('today')}
              variant={dateTag === 'today' ? 'contained' : 'outlined'}
              color="primary"
              fullWidth
            >
              Today
            </Button>
          </Grid>
          <Grid item>
            <Button
              onClick={() => setDateTag('yesterday')}
              variant={dateTag === 'yesterday' ? 'contained' : 'outlined'}
              color="primary"
              fullWidth
            >
              Yesterday
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Custom Date"
              type="date"
              value={dateTag !== 'today' && dateTag !== 'yesterday' ? dateTag : ''}
              onChange={(e) => setDateTag(dayjs(e.target.value).format('YYYY-MM-DD'))}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              variant="outlined"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Warning for unavailable files */}
      {unavailableCount > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {`${unavailableCount} file${unavailableCount > 1 ? 's are' : ' is'} unavailable in the AWS bucket`}
        </Alert>
      )}

      {/* Action Buttons */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Actions
        </Typography>
        <Grid container spacing={2} alignItems="center">
          {/* Download Images Button */}
          <Grid item xs={12} sm={4}>
            <Tooltip title="Download all available images as a zip file">
              <Button
                variant="contained"
                color="primary"
                startIcon={<DownloadIcon />}
                onClick={handleDownload}
                disabled={downloadLoading || imagesData.length === 0}
                fullWidth
                size="large"
              >
                {downloadLoading ? <CircularProgress size={24} color="inherit" /> : 'Download Images'}
              </Button>
            </Tooltip>
          </Grid>

          {/* Copy Download Link Button */}
          <Grid item xs={12} sm={4}>
            <Tooltip title="Copy the download link to clipboard">
              <Button
                variant="contained"
                color="secondary"
                startIcon={<ContentCopyIcon />}
                onClick={handleCopyDownloadLink}
                disabled={imagesData.length === 0}
                fullWidth
                size="large"
              >
                Copy Download Link
              </Button>
            </Tooltip>
          </Grid>
        </Grid>
      </Paper>

      {/* Images Data Table */}
      <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" gutterBottom>
            Sticker Orders
          </Typography>
          <Typography variant="subtitle1">Total Orders: {totalOrders}</Typography>
        </Stack>
        {loading ? (
          <Stack alignItems="center" sx={{ py: 4 }}>
            <CircularProgress />
          </Stack>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>SKU</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>Order Count</strong>
                </TableCell>
                <TableCell align="center">
                  <strong>Image</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {imagesData.length > 0 ? (
                imagesData.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>{item._id}</TableCell>
                    <TableCell align="right">{item.count}</TableCell>
                    <TableCell align="center">
                      {item.imageUrl && !unavailableImages.has(item._id) ? (
                        <Image
                          src={`${CLOUDFRONT_BASEURL}/${item.imageUrl}`}
                          width={50}
                          height={50}
                          style={{ width: '50px', height: 'auto' }}
                          alt={`Sticker ${item._id}`}
                          onError={() => {
                            setUnavailableImages((prev) => new Set(prev).add(item._id));
                          }}
                        />
                      ) : (
                        <Tooltip title="Image unavailable">
                          <ImageNotSupportedIcon color="error" />
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    No data available.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* Snackbar for Clipboard Feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message="Download link copied to clipboard!"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Container>
  );
};

export default ImagesPage;
