"use client";
import { useState } from 'react';
import {
    Container,
    TextField,
    Chip,
    Stack,
    Button,
    Typography,
    Box,
    FormControl,
    FormControlLabel,
    Checkbox,
} from '@mui/material';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import * as FileSaver from 'file-saver';
import dayjs from 'dayjs';

const DownloadCustomersData = () => {
    // Payment Filters State
    const [applyPaymentFilter, setApplyPaymentFilter] = useState(false);
    const [paymentFilters, setPaymentFilters] = useState([]); // ['successful', 'pending', 'failed']

    // Date Filter State
    const [applyDateFilter, setApplyDateFilter] = useState(false);
    const [dateRange, setDateRange] = useState('all'); // Single select

    // Custom Date Range State
    const [customStartDate, setCustomStartDate] = useState(null);
    const [customEndDate, setCustomEndDate] = useState(null);

    // Item Filters State
    const [applyItemFilter, setApplyItemFilter] = useState(false);
    const [items, setItems] = useState([]); // Selected items

    // Tags State
    const [tags, setTags] = useState(''); // Custom Tags

    const availableItems = ['Graphic Helmets','Full Bike Wraps','Tank Wraps','Bonnet Wraps','Window Pillar Wraps'];

    // Handle Payment Filters
    const handlePaymentFilterChange = (filter) => {
        setPaymentFilters((prev) => {
            if (prev.includes(filter)) {
                return prev.filter((f) => f !== filter);
            } else {
                return [...prev, filter];
            }
        });
    };

    // Handle Date Range Selection
    const handleDateRangeChange = (range) => {
        setDateRange(range);
    };

    // Handle Download CSV
    const handleDownloadCSV = async () => {
        const query = {};

        // Apply Payment Filters
        if (applyPaymentFilter && paymentFilters.length > 0) {
            const paymentStatusConditions = [];
            if (paymentFilters.includes('successful')) {
                paymentStatusConditions.push("allPaid", "paidPartially");
            }
            if (paymentFilters.includes('pending')) {
                paymentStatusConditions.push("pending");
            }
            if (paymentFilters.includes('failed')) {
                paymentStatusConditions.push("failed");
            }
            if (paymentStatusConditions.length > 0) {
                query.paymentStatus = { $in: paymentStatusConditions };
            }
        }

        // Apply Date Filter
        if (applyDateFilter) {
            const dateConditions = [];

            const today = dayjs().startOf('day');
            switch (dateRange) {
                case 'today':
                    dateConditions.push({
                        createdAt: {
                            $gte: today.toDate(),
                            $lte: today.endOf('day').toDate(),
                        },
                    });
                    break;
                case 'yesterday':
                    const yesterday = dayjs().subtract(1, 'day').startOf('day');
                    dateConditions.push({
                        createdAt: {
                            $gte: yesterday.toDate(),
                            $lte: yesterday.endOf('day').toDate(),
                        },
                    });
                    break;
                case 'lastWeek':
                    const lastWeek = dayjs().subtract(7, 'day').startOf('day');
                    dateConditions.push({
                        createdAt: {
                            $gte: lastWeek.toDate(),
                        },
                    });
                    break;
                case 'thisMonth':
                    const startOfMonth = dayjs().startOf('month').toDate();
                    dateConditions.push({
                        createdAt: {
                            $gte: startOfMonth,
                        },
                    });
                    break;
                case 'custom':
                    if (customStartDate && customEndDate) {
                        dateConditions.push({
                            createdAt: {
                                $gte: dayjs(customStartDate).startOf('day').toDate(),
                                $lte: dayjs(customEndDate).endOf('day').toDate(),
                            },
                        });
                    } else if (customStartDate) {
                        dateConditions.push({
                            createdAt: {
                                $gte: dayjs(customStartDate).startOf('day').toDate(),
                            },
                        });
                    } else if (customEndDate) {
                        dateConditions.push({
                            createdAt: {
                                $lte: dayjs(customEndDate).endOf('day').toDate(),
                            },
                        });
                    }
                    break;
                case 'all':
                default:
                    // No date filter
                    break;
            }

            if (dateConditions.length > 0) {
                query.createdAt = { $or: dateConditions };
            }
        }

        // Apply Item Filters
        if (applyItemFilter && items.length > 0) {
            query.items = items;
        }

        try {
            // Serialize the query object to a JSON string, including tags
            const serializedQuery = JSON.stringify({
                ...query,
                tags: tags.trim() !== '' ? tags.trim() : undefined, // Include tags if provided
            });

            // Fetch the CSV from the API
            const res = await fetch(`/api/admin/download/download-user-data?query=${encodeURIComponent(serializedQuery)}`);
            if (!res.ok) {
                const errorData = await res.json();
                console.error('Error:', errorData.message);
                alert(`Error: ${errorData.message}`);
                return;
            }
            const blob = await res.blob(); // Expecting a CSV blob
            FileSaver.saveAs(blob, 'customers_data.csv');
        } catch (error) {
            console.error('Download error:', error);
            alert(`Download failed: ${error.message}`);
        }
    };

    return (
        <Container maxWidth='md' sx={{ padding: '2rem 0' }}>
            <Typography variant="h4" align="center" gutterBottom>
                Download Customer Data
            </Typography>

            <Stack spacing={4}>
                {/* Payment Status Filter */}
                <Box>
                    <FormControl component="fieldset">
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={applyPaymentFilter}
                                    onChange={(e) => setApplyPaymentFilter(e.target.checked)}
                                    color="primary"
                                />
                            }
                            label="Apply Payment Status Filter"
                        />
                        {applyPaymentFilter && (
                            <Stack direction="row" spacing={1} sx={{ marginTop: 1 }}>
                                {['successful', 'pending', 'failed'].map((filter) => (
                                    <Chip
                                        key={filter}
                                        label={
                                            filter === 'successful'
                                                ? 'Successful'
                                                : filter === 'pending'
                                                ? 'Pending'
                                                : 'Failed'
                                        }
                                        clickable
                                        onClick={() => handlePaymentFilterChange(filter)}
                                        sx={{
                                            backgroundColor: paymentFilters.includes(filter) ? 'white' : 'rgb(50,50,50)',
                                            color: paymentFilters.includes(filter) ? 'black' : 'white',
                                        }}
                                    />
                                ))}
                            </Stack>
                        )}
                    </FormControl>
                </Box>

                {/* Date Range Filter */}
                <Box>
                    <FormControl component="fieldset">
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={applyDateFilter}
                                    onChange={(e) => setApplyDateFilter(e.target.checked)}
                                    color="primary"
                                />
                            }
                            label="Apply Date Range Filter"
                        />
                        {applyDateFilter && (
                            <Stack direction="row" spacing={1} sx={{ marginTop: 1, flexWrap: 'wrap' }}>
                                {['today', 'yesterday', 'lastWeek', 'thisMonth', 'custom', 'all'].map((range) => (
                                    <Chip
                                        key={range}
                                        label={
                                            range === 'today'
                                                ? 'Today'
                                                : range === 'yesterday'
                                                ? 'Yesterday'
                                                : range === 'lastWeek'
                                                ? 'Last Week'
                                                : range === 'thisMonth'
                                                ? 'This Month'
                                                : range === 'custom'
                                                ? 'Custom'
                                                : 'All Time'
                                        }
                                        clickable
                                        onClick={() => handleDateRangeChange(range)}
                                        sx={{
                                            backgroundColor: dateRange === range ? 'white' : 'rgb(50,50,50)',
                                            color: dateRange === range ? 'black' : 'white',
                                        }}
                                    />
                                ))}
                            </Stack>
                        )}

                        {applyDateFilter && dateRange === 'custom' && (
                            <Box sx={{ display: 'flex', gap: 2, marginTop: 2 }}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label="Start Date"
                                        value={customStartDate}
                                        onChange={(newValue) => setCustomStartDate(newValue)}
                                        renderInput={(params) => <TextField {...params} size='small' />}
                                    />
                                    <DatePicker
                                        label="End Date"
                                        value={customEndDate}
                                        onChange={(newValue) => setCustomEndDate(newValue)}
                                        renderInput={(params) => <TextField {...params} size='small' />}
                                    />
                                </LocalizationProvider>
                            </Box>
                        )}
                    </FormControl>
                </Box>

                {/* Item Filter */}
                <Box>
                    <FormControl component="fieldset">
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={applyItemFilter}
                                    onChange={(e) => setApplyItemFilter(e.target.checked)}
                                    color="primary"
                                />
                            }
                            label="Apply Item Filter"
                        />
                        {applyItemFilter && (
                            <Stack direction="row" spacing={1} sx={{ marginTop: 1, flexWrap: 'wrap' }}>
                                {availableItems.map((item) => (
                                    <Chip
                                        key={item}
                                        label={item}
                                        clickable
                                        onClick={() => {
                                            setItems((prev) =>
                                                prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
                                            );
                                        }}
                                        sx={{
                                            backgroundColor: items.includes(item) ? 'white' : 'rgb(50,50,50)',
                                            color: items.includes(item) ? 'black' : 'white',
                                        }}
                                    />
                                ))}
                            </Stack>
                        )}
                    </FormControl>
                </Box>

                {/* Tags Input */}
                <Box>
                    <TextField
                        label="Tags"
                        variant="outlined"
                        fullWidth
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="Enter tags for the CSV (optional)"
                    />
                </Box>

                {/* Download Button */}
                <Box textAlign="center">
                    <Button variant="contained" color="primary" onClick={handleDownloadCSV}>
                        Download CSV
                    </Button>
                </Box>
            </Stack>
        </Container>
    );
};

export default DownloadCustomersData;
