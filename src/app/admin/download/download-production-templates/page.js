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
  const [selectedDateTag, setSelectedDateTag] = useState('today');
  const [customDate, setCustomDate] = useState('');
  const [startDate, setStartDate] = useState(dayjs().startOf('day').toISOString());
  const [endDate, setEndDate] = useState(dayjs().endOf('day').toISOString());
  const [imagesData, setImagesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [unavailableImages, setUnavailableImages] = useState(new Set()); // Track unavailable images
  const [snackbarOpen, setSnackbarOpen] = useState(false); // For clipboard feedback

  const CLOUDFRONT_BASEURL = process.env.NEXT_PUBLIC_CLOUDFRONT_BASEURL;
  const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  // Function to compute startDate and endDate based on selectedDateTag
  const computeDateRange = (dateTag, customDateValue) => {
    let start, end;
    const now = dayjs();

    if (dateTag === 'today') {
      start = now.startOf('day').toISOString();
      end = now.endOf('day').toISOString();
    } else if (dateTag === 'yesterday') {
      const yesterday = now.subtract(1, 'day');
      start = yesterday.startOf('day').toISOString();
      end = yesterday.endOf('day').toISOString();
    } else if (dateTag === 'custom') {
      const specificDate = dayjs(customDateValue, 'YYYY-MM-DD');
      if (!specificDate.isValid()) {
        return { start: null, end: null };
      }
      start = specificDate.startOf('day').toISOString();
      end = specificDate.endOf('day').toISOString();
    }

    return { start, end };
  };

  // Update startDate and endDate when selectedDateTag or customDate changes
  useEffect(() => {
    const { start, end } = computeDateRange(selectedDateTag, customDate);
    if (start && end) {
      setStartDate(start);
      setEndDate(end);
    }
  }, [selectedDateTag, customDate]);

  // Function to fetch images data
  const fetchImagesData = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(
        `/api/admin/get-main/get-sku-count?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
      );
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
  }, [startDate, endDate]);

  // Function to handle image download via POST
  const handleDownload = async () => {
    if (imagesData.length === 0) {
      setError('No available images to download.');
      return;
    }

    setDownloadLoading(true);
    setError('');
    setSuccess('');

    const startTime = performance.now(); // Start timing

    try {
      const res = await fetch('/api/admin/download/download-raw-designs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate, endDate }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to download zip.');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      const formattedDate = dayjs().format('DD_MMM_YYYY_hh_mm_a').toLowerCase();
      const fileName = `raw_designs_${formattedDate}.zip`;
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      const endTime = performance.now(); // End timing
      const timeTaken = ((endTime - startTime) / 1000).toFixed(2); // Time in seconds with 2 decimal places

      setSuccess(`Download started in ${timeTaken} seconds.`);
    } catch (error) {
      console.error('Error downloading zip:', error);
      setError(error.message || 'Failed to download zip.');
    } finally {
      setDownloadLoading(false);
    }
  };

  // Function to handle copying download link to clipboard
  const handleCopyDownloadLink = async () => {
    try {
      // Generate JWT token with startDate and endDate
      const tokenRes = await fetch('/api/authentication/tokens/generate-download-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate, endDate }),
      });

      if (!tokenRes.ok) {
        const errorData = await tokenRes.json();
        throw new Error(errorData.message || 'Failed to generate download token.');
      }

      const { token } = await tokenRes.json();

      const downloadLink = `${SITE_URL}/api/public/download/download-raw-designs?token=${encodeURIComponent(token)}`;

      // Copy to clipboard
      await navigator.clipboard.writeText(downloadLink);
      setSuccess('Download link copied to clipboard!');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Failed to copy: ', err);
      setError('Failed to copy download link.');
    }
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
              onClick={() => {
                setSelectedDateTag('today');
                setCustomDate('');
              }}
              variant={selectedDateTag === 'today' ? 'contained' : 'outlined'}
              color="primary"
              fullWidth
            >
              Today
            </Button>
          </Grid>
          <Grid item>
            <Button
              onClick={() => {
                setSelectedDateTag('yesterday');
                setCustomDate('');
              }}
              variant={selectedDateTag === 'yesterday' ? 'contained' : 'outlined'}
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
              value={selectedDateTag === 'custom' ? customDate : ''}
              onChange={(e) => {
                setSelectedDateTag('custom');
                setCustomDate(e.target.value);
              }}
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
              {/* Wrap the Button in a span to fix MUI Tooltip issue when disabled */}
              <span style={{ display: 'inline-block', width: '100%' }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownload}
                  disabled={downloadLoading || imagesData.length === 0}
                  fullWidth
                  size="large"
                  style={{ pointerEvents: 'auto' }} // Ensure tooltip works
                >
                  {downloadLoading ? <CircularProgress size={24} color="inherit" /> : 'Download Images'}
                </Button>
              </span>
            </Tooltip>
          </Grid>

          {/* Copy Download Link Button */}
          <Grid item xs={12} sm={4}>
            <Tooltip title="Copy the download link to clipboard">
              {/* Wrap the Button in a span to fix MUI Tooltip issue when disabled */}
              <span style={{ display: 'inline-block', width: '100%' }}>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<ContentCopyIcon />}
                  onClick={handleCopyDownloadLink}
                  disabled={imagesData.length === 0}
                  fullWidth
                  size="large"
                  style={{ pointerEvents: 'auto' }} // Ensure tooltip works
                >
                  Copy Download Link
                </Button>
              </span>
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
                <TableCell align="left">
                  <strong>Specific Category Variant</strong>
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
                    <TableCell align="left">{item.specificCategoryVariant}</TableCell>
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
                  <TableCell colSpan={4} align="center">
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
