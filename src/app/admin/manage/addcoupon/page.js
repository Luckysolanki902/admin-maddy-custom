// ./src/app/admin/manage/addcoupon/page.js

"use client"; // Ensure this is the first line if using client-side hooks

import { useState, useEffect } from 'react';
import {
    Container,
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    Snackbar,
    Checkbox,
    FormControlLabel,
    Stack,
    Typography
} from '@mui/material';
import { Add, Edit, Delete, AddCircle, RemoveCircle } from '@mui/icons-material';
import { format } from 'date-fns';

const CouponPage = () => {
    const [coupons, setCoupons] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [currentCoupon, setCurrentCoupon] = useState({
        code: '',
        discountType: 'percentage',
        discountValue: 0,
        validFrom: '',
        validUntil: '',
        maxUses: 100,
        usedCount: 0,
        isActive: true,
        showAsCard: false,
        captions: [''],
        description: '',
        minimumPurchasePrice: 0,
        usagePerUser: 1,
    });
    const [snackbarMessage, setSnackbarMessage] = useState('');

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const res = await fetch('/api/admin/get-main/get-all-coupon');
            if (!res.ok) {
                throw new Error('Failed to fetch coupons.');
            }
            const data = await res.json();
            setCoupons(data);
        } catch (error) {
            console.error(error);
            setSnackbarMessage('Error fetching coupons.');
        }
    };

    const handleDialogOpen = (coupon = null) => {
        if (coupon) {
            setCurrentCoupon({
                ...coupon,
                validFrom: format(new Date(coupon.validFrom), 'yyyy-MM-dd'),
                validUntil: format(new Date(coupon.validUntil), 'yyyy-MM-dd'),
                captions: coupon.captions.length > 0 ? coupon.captions : [''],
            });
        } else {
            setCurrentCoupon({
                code: '',
                discountType: 'percentage',
                discountValue: 0,
                validFrom: '',
                validUntil: '',
                maxUses: 100,
                usedCount: 0,
                isActive: true,
                showAsCard: false,
                captions: [''],
                description: '',
                minimumPurchasePrice: 0,
                usagePerUser: 1,
            });
        }
        setOpenDialog(true);
    };

    const handleDialogClose = () => {
        setCurrentCoupon({
            code: '',
            discountType: 'percentage',
            discountValue: 0,
            validFrom: '',
            validUntil: '',
            maxUses: 100,
            usedCount: 0,
            isActive: true,
            showAsCard: false,
            captions: [''],
            description: '',
            minimumPurchasePrice: 0,
            usagePerUser: 1,
        });
        setOpenDialog(false);
    };

    const handleSaveCoupon = async () => {
        // Basic validation
        if (!currentCoupon.code || !currentCoupon.validFrom || !currentCoupon.validUntil) {
            setSnackbarMessage('Please fill all required fields.');
            return;
        }

        // Ensure validUntil is after validFrom
        if (new Date(currentCoupon.validUntil) <= new Date(currentCoupon.validFrom)) {
            setSnackbarMessage('Valid Until date must be after Valid From date.');
            return;
        }

        const method = currentCoupon._id ? 'PUT' : 'POST';
        const endpoint = currentCoupon._id
            ? `/api/admin/get-main/get-all-coupon/${currentCoupon._id}`
            : '/api/admin/get-main/get-all-coupon';

        try {
            const res = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentCoupon),
            });

            if (res.ok) {
                setSnackbarMessage(`Coupon ${currentCoupon._id ? 'updated' : 'created'} successfully!`);
                fetchCoupons();
                handleDialogClose();
            } else {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Error saving coupon.');
            }
        } catch (error) {
            console.error('Save Coupon Error:', error);
            setSnackbarMessage(`Error: ${error.message}`);
        }
    };

    const handleDeleteCoupon = async (id) => {
        if (confirm('Are you sure you want to delete this coupon?')) {
            try {
                const res = await fetch(`/api/admin/get-main/get-all-coupon/${id}`, { method: 'DELETE' });
                if (res.ok) {
                    setSnackbarMessage('Coupon deleted successfully!');
                    fetchCoupons();
                } else {
                    const errorData = await res.json();
                    throw new Error(errorData.message || 'Error deleting coupon.');
                }
            } catch (error) {
                console.error('Delete Coupon Error:', error);
                setSnackbarMessage(`Error: ${error.message}`);
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCurrentCoupon((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleCaptionChange = (index, value) => {
        const newCaptions = [...currentCoupon.captions];
        newCaptions[index] = value;
        setCurrentCoupon((prev) => ({ ...prev, captions: newCaptions }));
    };

    const addCaption = () => {
        setCurrentCoupon((prev) => ({ ...prev, captions: [...prev.captions, ''] }));
    };

    const removeCaption = (index) => {
        const newCaptions = [...currentCoupon.captions];
        newCaptions.splice(index, 1);
        setCurrentCoupon((prev) => ({ ...prev, captions: newCaptions }));
    };

    const generateRandomCode = () => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        setCurrentCoupon((prev) => ({ ...prev, code }));
    };

    return (
        <Container style={{ marginTop: '20px', color: 'white' }}>
            <Typography variant="h4" align="center" gutterBottom>
                Manage Coupons
            </Typography>
            <Button
                variant="contained"
                color="primary"
                startIcon={<Add />}
                onClick={() => handleDialogOpen()}
                style={{ marginBottom: '20px' }}
            >
                Add Coupon
            </Button>
            <TableContainer component={Paper} sx={{ backgroundColor: '#333' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Code</TableCell>
                            <TableCell>Discount Type</TableCell>
                            <TableCell>Discount Value</TableCell>
                            <TableCell>Valid From</TableCell>
                            <TableCell>Valid Until</TableCell>
                            <TableCell>Max Uses</TableCell>
                            <TableCell>Used Count</TableCell>
                            <TableCell>Show as Card</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {coupons.map((coupon) => (
                            <TableRow key={coupon._id}>
                                <TableCell>{coupon.code}</TableCell>
                                <TableCell>{coupon.discountType.charAt(0).toUpperCase() + coupon.discountType.slice(1)}</TableCell>
                                <TableCell>
                                    {coupon.discountType === 'percentage'
                                        ? `${coupon.discountValue}%`
                                        : `₹${coupon.discountValue}`}
                                </TableCell>
                                <TableCell>{format(new Date(coupon.validFrom), 'yyyy-MM-dd')}</TableCell>
                                <TableCell>{format(new Date(coupon.validUntil), 'yyyy-MM-dd')}</TableCell>
                                <TableCell>{coupon.maxUses}</TableCell>
                                <TableCell>{coupon.usageCount}</TableCell>
                                <TableCell>
                                    <Checkbox checked={coupon.showAsCard} disabled />
                                </TableCell>
                                <TableCell>
                                    <IconButton color="primary" onClick={() => handleDialogOpen(coupon)}>
                                        <Edit />
                                    </IconButton>
                                    <IconButton color="secondary" onClick={() => handleDeleteCoupon(coupon._id)}>
                                        <Delete />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Add/Edit Coupon Dialog */}
            <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="sm" fullWidth>
                <DialogTitle>{currentCoupon._id ? 'Edit Coupon' : 'Add Coupon'}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ marginTop: 1 }}>
                        {/* Code and Generate Button */}
                        <Stack direction="row" spacing={1} alignItems="center">
                            <TextField
                                name="code"
                                label="Code"
                                variant="outlined"
                                value={currentCoupon.code}
                                onChange={handleInputChange}
                                fullWidth
                                required
                            />
                            <Button onClick={generateRandomCode} variant="outlined" color="primary">
                                Generate
                            </Button>
                        </Stack>

                        {/* Show as Card */}
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={currentCoupon.showAsCard}
                                    onChange={handleInputChange}
                                    name="showAsCard"
                                    color="primary"
                                />
                            }
                            label="Show as Card"
                        />

                        {/* Captions */}
                        <Typography variant="subtitle1">Captions</Typography>
                        {currentCoupon.captions.map((caption, index) => (
                            <Stack direction="row" spacing={1} alignItems="center" key={index}>
                                <TextField
                                    label={`Caption ${index + 1}`}
                                    variant="outlined"
                                    value={caption}
                                    onChange={(e) => handleCaptionChange(index, e.target.value)}
                                    fullWidth
                                />
                                <IconButton
                                    color="secondary"
                                    onClick={() => removeCaption(index)}
                                    disabled={currentCoupon.captions.length === 1}
                                >
                                    <RemoveCircle />
                                </IconButton>
                            </Stack>
                        ))}
                        <Button
                            startIcon={<AddCircle />}
                            onClick={addCaption}
                            variant="outlined"
                            color="primary"
                        >
                            Add Caption
                        </Button>

                        {/* Description */}
                        <TextField
                            name="description"
                            label="Description"
                            variant="outlined"
                            value={currentCoupon.description}
                            onChange={handleInputChange}
                            fullWidth
                            multiline
                            rows={3}
                        />

                        {/* Discount Type */}
                        <TextField
                            select
                            name="discountType"
                            label="Discount Type"
                            variant="outlined"
                            value={currentCoupon.discountType}
                            onChange={handleInputChange}
                            fullWidth
                            required
                        >
                            <MenuItem value="percentage">Percentage</MenuItem>
                            <MenuItem value="fixed">Fixed</MenuItem>
                        </TextField>

                        {/* Discount Value */}
                        <TextField
                            name="discountValue"
                            label="Discount Value"
                            type="number"
                            variant="outlined"
                            value={currentCoupon.discountValue}
                            onChange={handleInputChange}
                            fullWidth
                            required
                            inputProps={{ min: 0 }}
                        />

                        {/* Minimum Purchase Price */}
                        <TextField
                            name="minimumPurchasePrice"
                            label="Minimum Purchase Price (₹)"
                            type="number"
                            variant="outlined"
                            value={currentCoupon.minimumPurchasePrice}
                            onChange={handleInputChange}
                            fullWidth
                            inputProps={{ min: 0 }}
                        />

                        {/* Usage Per User */}
                        <TextField
                            name="usagePerUser"
                            label="Usage Per User"
                            type="number"
                            variant="outlined"
                            value={currentCoupon.usagePerUser}
                            onChange={handleInputChange}
                            fullWidth
                            inputProps={{ min: 1 }}
                        />

                        {/* Valid From */}
                        <TextField
                            name="validFrom"
                            label="Valid From"
                            type="date"
                            variant="outlined"
                            value={currentCoupon.validFrom}
                            onChange={handleInputChange}
                            fullWidth
                            InputLabelProps={{
                                shrink: true,
                            }}
                            required
                        />

                        {/* Valid Until */}
                        <TextField
                            name="validUntil"
                            label="Valid Until"
                            type="date"
                            variant="outlined"
                            value={currentCoupon.validUntil}
                            onChange={handleInputChange}
                            fullWidth
                            InputLabelProps={{
                                shrink: true,
                            }}
                            required
                        />

                        {/* Max Uses */}
                        <TextField
                            name="maxUses"
                            label="Max Uses"
                            type="number"
                            variant="outlined"
                            value={currentCoupon.maxUses}
                            onChange={handleInputChange}
                            fullWidth
                            inputProps={{ min: 0 }}
                        />

                        {/* Used Count */}
                        <TextField
                            name="usedCount"
                            label="Used Count"
                            type="number"
                            variant="outlined"
                            value={currentCoupon.usedCount}
                            onChange={handleInputChange}
                            fullWidth
                            disabled
                        />

                        {/* Active Status */}
                        <TextField
                            select
                            name="isActive"
                            label="Active"
                            variant="outlined"
                            value={currentCoupon.isActive}
                            onChange={handleInputChange}
                            fullWidth
                        >
                            <MenuItem value={true}>Active</MenuItem>
                            <MenuItem value={false}>Inactive</MenuItem>
                        </TextField>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleSaveCoupon} color="primary" variant="contained">
                        {currentCoupon._id ? 'Update' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for Notifications */}
            <Snackbar
                open={!!snackbarMessage}
                autoHideDuration={3000}
                message={snackbarMessage}
                onClose={() => setSnackbarMessage('')}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            />
        </Container>
    );
};

export default CouponPage;
