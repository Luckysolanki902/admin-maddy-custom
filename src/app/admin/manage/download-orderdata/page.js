"use client"
import { useState } from 'react';
import {
    Container,
    TextField,
    MenuItem,
    Chip,
    Stack,
    Button,
    Typography,
    Box,
    FormControl,
    FormLabel,
    FormGroup,
    FormControlLabel,
    Checkbox
} from '@mui/material';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import * as FileSaver from 'file-saver';
import { indigo } from '@mui/material/colors';
import dayjs from 'dayjs';

const DownloadCustomersData = () => {
    const [paymentDeliveryFilters, setPaymentDeliveryFilters] = useState([]); // ['paymentSuccessful', 'shiprocketSuccess']
    const [dateRange, setDateRange] = useState([]); // e.g., ['today', 'lastWeek']
    const [items, setItems] = useState([]); // Selected items
    const [customStartDate, setCustomStartDate] = useState(null);
    const [customEndDate, setCustomEndDate] = useState(null);

    const availableItems = ['Graphic Helmets','Full Bike Wraps','Tank Wraps','Bonnet Wraps','Window Pillar Wraps'];
   
    

    const handlePaymentDeliveryFilterChange = (filter) => {
        if (filter === 'both') {
            if (paymentDeliveryFilters.includes('paymentSuccessful') && paymentDeliveryFilters.includes('shiprocketSuccess')) {
                setPaymentDeliveryFilters([]);
            } else {
                setPaymentDeliveryFilters(['paymentSuccessful', 'shiprocketSuccess']);
            }
        } else {
            setPaymentDeliveryFilters((prev) => {
                
                if (prev.includes(filter)) {
                    return prev.filter((f) => f !== filter);

                } else {
                    return [...prev, filter];
                }
                
            });
        }
    };

    const handleDateRangeFilterChange = (filter) => {
        setDateRange((prev) => {
            if (prev.includes(filter)) {
                return prev.filter((f) => f !== filter);
            } else {
                return [...prev, filter];
            }
        });
    };



    const handleDownloadCSV = async () => {
        const query = {};
    
        // Payment & Delivery Status Filters
        if (paymentDeliveryFilters.length > 0) {
            const paymentStatusConditions = [];
            const deliveryStatusConditions = [];
    
            if (paymentDeliveryFilters.includes('paymentSuccessful')) {
                paymentStatusConditions.push("allPaid", "paidPartially");
            }
    
            if (paymentDeliveryFilters.includes('shiprocketSuccess')) {
                deliveryStatusConditions.push("shipped", "delivered");
            }
    
            if (paymentStatusConditions.length > 0) {
                query.paymentStatus = { $in: paymentStatusConditions };
            }
    
            if (deliveryStatusConditions.length > 0) {
                query.deliveryStatus = { $in: deliveryStatusConditions };
            }
        }
    
        // Date Range Filter
        if (dateRange.length > 0) {
            const dateConditions = [];
    
            const today = dayjs().startOf('day');
            dateRange.forEach((range) => {
                switch (range) {
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
                        // No date filter
                        break;
                    default:
                        break;
                }
            });
            console.log(dateConditions)
    
            if (dateConditions.length > 0) {
                query.createdAt = dateConditions;
            }
        }
    
        // Item Filter
        if (items.length > 0) {
            query.items = items;
        }
    
        try {
            // Serialize the query object to a JSON string
            const serializedQuery = JSON.stringify(query);
    
            // Pass serialized query as part of the fetch request
            const res = await fetch(`/api/admin/download/download-order-data?query=${encodeURIComponent(serializedQuery)}`);
            console.log(res);
            if (!res.ok) {
                const errorData = await res.json();
                console.log(errorData)
            }
            const blob = await res.blob(); // Expecting a CSV blob
            FileSaver.saveAs(blob, 'orders_data.csv');
        } catch (error) {
            console.error('Download error:', error);
            alert(`${error.message}`);
        }
    };
    

    return (
        <Container maxWidth='md'>
            <Typography variant="h4" align="center" sx={{ margin: '2rem 0' }}>
                Download Order Data
            </Typography>

            <Stack spacing={3} sx={{ marginBottom: 4 }}>
                {/* Payment & Delivery Status Filter */}
                <Box>
                    <FormLabel component="legend">
                        <Chip label="Payment & Delivery Status" variant="outlined" />
                    </FormLabel>
                    <Stack direction="row" spacing={1} sx={{ marginTop: 1 }}>
                        <Chip
                            label="Payment Successful"
                            clickable
                            color={paymentDeliveryFilters.includes('paymentSuccessful') ? 'success' : 'default'}
                            onClick={() => handlePaymentDeliveryFilterChange('paymentSuccessful')}
                        />
                        <Chip
                            label="Shiprocket Success"
                            clickable
                            color={paymentDeliveryFilters.includes('shiprocketSuccess') ? 'success' : 'default'}
                            onClick={() => handlePaymentDeliveryFilterChange('shiprocketSuccess')}
                        />
                        <Chip
                            label="Both"
                            clickable
                            color={
                                paymentDeliveryFilters.includes('paymentSuccessful') &&
                                paymentDeliveryFilters.includes('shiprocketSuccess')
                                    ? 'success'
                                    : 'default'
                            }
                            onClick={() => handlePaymentDeliveryFilterChange('both')}
                        />
                    </Stack>
                </Box>

                {/* Date Range Filter */}
                <Box>
                    <FormLabel component="legend">
                        <Chip label="Date Range" variant="outlined" />
                    </FormLabel>
                    <Stack direction="row" spacing={1} sx={{ marginTop: 1 }}>
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
                                color={dateRange.includes(range) ? 'success' : 'default'}
                                onClick={() => handleDateRangeFilterChange(range)}
                            />
                        ))}
                    </Stack>

                    {dateRange.includes('custom') && (
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
                </Box>
                {/* Item Filter */}
                <Box>
                    <FormLabel component="legend">
                        <Chip label="Item Filter" variant="outlined" />
                    </FormLabel>
                    <Stack direction="row" spacing={1} sx={{ marginTop: 1 }}>
                        {availableItems.map((item) => (
                            <Chip
                                key={item}
                                label={item}
                                clickable
                                color={items.includes(item) ? 'success' : 'default'}
                                onClick={() => {
                                    setItems((prev) =>
                                        prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
                                    );
                                }}
                            />
                        ))}
                    </Stack>
                </Box>

                {/* Download Button */}
                <Button variant="contained" color="primary" onClick={handleDownloadCSV}>
                    Download CSV
                </Button>
            </Stack>
        </Container>
    );
};

export default DownloadCustomersData;