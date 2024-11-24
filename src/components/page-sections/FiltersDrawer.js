// /components/page-sections/FiltersDrawer.js

import React, { useState } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import SyncIcon from '@mui/icons-material/Sync';

const FiltersDrawer = ({
  shiprocketFilter,
  setShiprocketFilter,
  paymentStatusFilter,
  setPaymentStatusFilter,
  applyFilters,
  handleSyncShiprocketOrders, // New prop
}) => {
  const [openDialog, setOpenDialog] = useState(false);

  // Determine if the sync button should be visible
  const isSyncButtonVisible =
    paymentStatusFilter === 'successful' && shiprocketFilter === 'pending' && totalCount > 0;

  return (
    <Box sx={{ width: 300, padding: '1rem' }}>
      <Typography variant="h6" gutterBottom>
        Additional Filters
      </Typography>

      {/* Payment Status Filter */}
      <FormControl fullWidth sx={{ marginBottom: '1rem' }}>
        <InputLabel id="payment-status-filter-label">Payment Status</InputLabel>
        <Select
          labelId="payment-status-filter-label"
          value={paymentStatusFilter}
          label="Payment Status"
          onChange={(e) => setPaymentStatusFilter(e.target.value)}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          <MenuItem value="successful">Successful (Paid / Partially Paid)</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="failed">Failed</MenuItem>
        </Select>
      </FormControl>

      {/* Delivery Status (Shiprocket) Filter */}
      <FormControl fullWidth sx={{ marginBottom: '1rem' }}>
        <InputLabel id="shiprocket-filter-label">Shiprocket Order Status</InputLabel>
        <Select
          labelId="shiprocket-filter-label"
          value={shiprocketFilter}
          label="Shiprocket Order Status"
          onChange={(e) => setShiprocketFilter(e.target.value)}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="orderCreated">Order Created</MenuItem>
          {/* Future options can be uncommented and used as needed */}
          {/* <MenuItem value="processing">Processing</MenuItem>
          <MenuItem value="shipped">Shipped</MenuItem>
          <MenuItem value="delivered">Delivered</MenuItem>
          <MenuItem value="cancelled">Cancelled</MenuItem> */}
        </Select>
      </FormControl>

      {/* Sync Button (Conditionally Rendered) */}
      {isSyncButtonVisible && (
        <Button
          variant="contained"
          color="secondary"
          fullWidth
          startIcon={<SyncIcon />}
          onClick={() => setOpenDialog(true)}
          sx={{ marginBottom: '1rem' }}
        >
          Create Shiprocket Orders
        </Button>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        aria-labelledby="sync-dialog-title"
        aria-describedby="sync-dialog-description"
      >
        <DialogTitle id="sync-dialog-title">Confirm Sync</DialogTitle>
        <DialogContent>
          <DialogContentText id="sync-dialog-description">
            Are you sure you want to create Shiprocket orders for all verified payments within the selected date range?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleSyncShiprocketOrders();
              setOpenDialog(false);
            }}
            color="secondary"
            autoFocus
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Button variant="contained" color="primary" fullWidth onClick={applyFilters}>
        Apply Filters
      </Button>
    </Box>
  );
};

export default FiltersDrawer;
