"use client";
import { useEffect, useState, useCallback } from 'react';
import {
    Container,
    TextField,
    MenuItem,
    Pagination,
    Chip,
    Stack,
    InputAdornment,
    Typography,
    Box,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import CustomerCard from '@/components/cards/CustomerCard'; // Import the new OrderCard component

const ITEMS_PER_PAGE = 30; // Updated to 30

const Index = () => {
    // Main Orders State
    const [expanded, setExpanded] = useState(null);
    const [searchInput, setSearchInput] = useState('');
    const [searchField, setSearchField] = useState('name');
    const [currentPage, setCurrentPage] = useState(1);
    const [orders, setOrders] = useState([]); // Renamed to orders
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState(dayjs().startOf('day')); // Set to start of today
    const [endDate, setEndDate] = useState(dayjs().endOf('day')); // Set to end of today
    const [showLocalHostOrders, setShowLocalHostOrders] = useState(false); // New state for localhost orders
    const [activeTag, setActiveTag] = useState('today'); // Set default to 'today'
    const [totalOrders, setTotalOrders] = useState(0); // Renamed from totalCustomers

    // Problematic Orders State
    const [selectedProblematicFilter, setSelectedProblematicFilter] = useState(''); // Single selection
    const [problematicOrders, setProblematicOrders] = useState([]); // Renamed to problematicOrders
    const [problematicTotalOrders, setProblematicTotalOrders] = useState(0); // Renamed to problematicTotalOrders
    const [problematicTotalPages, setProblematicTotalPages] = useState(1);
    const [problematicCurrentPage, setProblematicCurrentPage] = useState(1);
    const [problematicLoading, setProblematicLoading] = useState(false);

    // Debounce function to delay the search input changes
    const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func(...args);
            }, delay);
        };
    };

    // applying predefined dates
        const applyDateRange = (days) => {
        let newStartDate, newEndDate;

        if (days === 0) {
            // Today
            newStartDate = dayjs().startOf('day');
            newEndDate = dayjs().endOf('day');
        } else if (days === 1) {
            // Yesterday
            newStartDate = dayjs().subtract(1, 'day').startOf('day');
            newEndDate = dayjs().subtract(1, 'day').endOf('day');
        } else {
            // Last N days
            newEndDate = dayjs();
            newStartDate = newEndDate.subtract(days, 'day').startOf('day');
        }

        setStartDate(newStartDate);
        setEndDate(newEndDate);
        setActiveTag(
            days === 0
                ? 'today'
                : days === 1
                    ? 'yesterday'
                    : days === 6
                        ? 'last7days'
                        : days === 29
                            ? 'last30days'
                            : 'custom'
        );
        setCurrentPage(1); // Reset to first page
        setProblematicCurrentPage(1); // Reset problematic customers to first page

        // Fetch customers and problematic customers again
        fetchOrders();
        if (selectedProblematicFilter) {
            fetchProblematicOrders();
        }
    };

    // Fetch verified orders with the current search input
    const fetchOrders = useCallback(async () => {
        setLoading(true);
        const queryParams = [
            `page=${currentPage}`,
            `limit=${ITEMS_PER_PAGE}`,
            `searchInput=${encodeURIComponent(searchInput)}`,
            `searchField=${searchField}`,
            `showLocalHostOrders=${showLocalHostOrders}`, // Include in query params
            `startDate=${startDate ? dayjs(startDate).toISOString() : ''}`,
            `endDate=${endDate ? dayjs(endDate).toISOString() : ''}`,
        ].filter(param => !param.startsWith('problematicFilter') && param.split('=')[1] !== ''); // Exclude problematicFilter and empty params

        const queryString = queryParams.join('&');

        try {
            const res = await fetch(`/api/showcase/getcustomers?${queryString}`); // Updated endpoint
            const data = await res.json();

            if (res.ok) {
                setOrders(data.orders); // Set orders instead of customers
                setTotalPages(data.totalPages);
                setTotalOrders(data.totalOrders); // Renamed to totalOrders
            } else {
                console.error("Error fetching data:", data);
            }
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchInput, searchField, showLocalHostOrders, startDate, endDate]);

    // Fetch problematic orders based on selected filter
    const fetchProblematicOrders = useCallback(async () => {
        if (!selectedProblematicFilter) {
            setProblematicOrders([]); // Set problematic orders
            setProblematicTotalOrders(0);
            setProblematicTotalPages(1);
            setProblematicCurrentPage(1);
            return;
        }

        setProblematicLoading(true);

        const queryParams = [
            `page=${problematicCurrentPage}`,
            `limit=${ITEMS_PER_PAGE}`,
            `searchInput=${encodeURIComponent(searchInput)}`,
            `searchField=${searchField}`,
            `showLocalHostOrders=${showLocalHostOrders}`,
            `startDate=${startDate ? dayjs(startDate).toISOString() : ''}`,
            `endDate=${endDate ? dayjs(endDate).toISOString() : ''}`,
            `problematicFilter=${selectedProblematicFilter}`, // Single filter
        ].filter(param => param.split('=')[1] !== ''); // Remove empty parameters

        const queryString = queryParams.join('&');

        try {
            const res = await fetch(`/api/showcase/getcustomers?${queryString}`); // Updated endpoint
            const data = await res.json();

            if (res.ok) {
                setProblematicOrders(data.orders); // Set problematic orders
                setProblematicTotalOrders(data.totalOrders); // Renamed to totalOrders
                setProblematicTotalPages(data.totalPages);
            } else {
                console.error("Error fetching problematic data:", data);
            }
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setProblematicLoading(false);
        }
    }, [
        selectedProblematicFilter,
        problematicCurrentPage,
        searchInput,
        searchField,
        showLocalHostOrders,
        startDate,
        endDate,
    ]);

    // Use the debounced version of fetchOrders
    const debouncedFetchOrders = useCallback(debounce(fetchOrders, 300), [fetchOrders]);

    useEffect(() => {
        debouncedFetchOrders();
    }, [debouncedFetchOrders]);

    // Fetch problematic orders when selected filter or page changes
    useEffect(() => {
        fetchProblematicOrders();
    }, [fetchProblematicOrders]);

    const handleChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    const handleSearchFieldChange = (e) => {
        setSearchField(e.target.value);
        setSearchInput(''); // Clear search input when changing fields
        setCurrentPage(1); // Reset to first page
        setProblematicCurrentPage(1); // Reset problematic orders to first page
        fetchOrders();
        if (selectedProblematicFilter) {
            fetchProblematicOrders();
        }
    };
    
    const handleToggleShowLocalHostOrders = () => {
        setShowLocalHostOrders(prev => !prev);
        setCurrentPage(1); // Reset to first page
        setProblematicCurrentPage(1); // Reset problematic customers to first page
        fetchOrders();
        if (selectedProblematicFilter) {
            fetchProblematicOrders();
        }
    };

    const handleTagRemove = (tag) => {
        if (tag === activeTag) {
            setActiveTag('all'); // Reset to 'all' if the active tag is removed
            setStartDate(null);
            setEndDate(null);
            setSearchInput('');
            setCurrentPage(1); // Reset to first page
            setProblematicCurrentPage(1); // Reset problematic customers to first page

            // Reset problematic customers
            setSelectedProblematicFilter('');
            setProblematicOrders([]);
            setProblematicTotalOrders(0);
            setProblematicTotalPages(1);
            setProblematicCurrentPage(1);

            fetchOrders();
        }
    };

    const handleAllTagClick = () => {
        setActiveTag('all');
        setStartDate(null);
        setEndDate(null);
        setSearchInput('');
        setCurrentPage(1); // Reset to first page
        setProblematicCurrentPage(1); // Reset problematic customers to first page

        // Reset problematic customers
        setSelectedProblematicFilter('');
        setProblematicOrders([]);
        setProblematicTotalOrders(0);
        setProblematicTotalPages(1);
        setProblematicCurrentPage(1);

        fetchOrders();
    };

    const handleProblematicFilterChange = (filter) => () => {
        setSelectedProblematicFilter(prev => (prev === filter ? '' : filter)); // Toggle selection
        setProblematicCurrentPage(1); // Reset to first page
    };

    const handleProblematicPaginationChange = (event, value) => {
        setProblematicCurrentPage(value);
    };

    // Apply date range and other filtering functions remain unchanged...

    return (
        <Container maxWidth='lg' style={{ marginBottom: '2rem' }}>
            <Typography
                variant="h4"
                color="primary"
                align="center"
                sx={{ marginTop: '1rem', cursor: 'pointer' }}
                onClick={handleToggleShowLocalHostOrders}
            >
                Orders
            </Typography>

            {/* Chip and filtering UI logic unchanged... */}


             <Box sx={{ display: 'flex', overflowX: 'auto', width: '100%', marginTop:'1rem', marginBottom:'1rem'}}>
                 <Stack direction="row" spacing={1} sx={{ marginBottom: 2, justifyContent: 'left', whiteSpace: 'nowrap' }}>
                     <Chip
                        label="Today"
                        onClick={() => applyDateRange(0)}
                        variant={activeTag === 'today' ? "filled" : "outlined"}
                        color={activeTag === 'today' ? "primary" : "default"}
                        onDelete={activeTag === 'today' ? () => handleTagRemove('today') : undefined}
                    />
                    <Chip
                        label="Yesterday"
                        onClick={() => applyDateRange(1)}
                        variant={activeTag === 'yesterday' ? "filled" : "outlined"}
                        color={activeTag === 'yesterday' ? "primary" : "default"}
                        onDelete={activeTag === 'yesterday' ? () => handleTagRemove('yesterday') : undefined}
                    />
                    <Chip
                        label="Last 7 Days"
                        onClick={() => applyDateRange(6)}
                        variant={activeTag === 'last7days' ? "filled" : "outlined"}
                        color={activeTag === 'last7days' ? "primary" : "default"}
                        onDelete={activeTag === 'last7days' ? () => handleTagRemove('last7days') : undefined}
                    />
                    <Chip
                        label="Last 30 Days"
                        onClick={() => applyDateRange(29)}
                        variant={activeTag === 'last30days' ? "filled" : "outlined"}
                        color={activeTag === 'last30days' ? "primary" : "default"}
                        onDelete={activeTag === 'last30days' ? () => handleTagRemove('last30days') : undefined}
                    />
                    <Chip
                        label="All"
                        onClick={handleAllTagClick}
                        variant={activeTag === 'all' ? "filled" : "outlined"}
                        color={activeTag === 'all' ? "primary" : "default"}
                    />
                </Stack>
            </Box>

             {/* Updated Search and Date Filter Section */}
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                marginBottom="20px"
                flexWrap="wrap"
            >
                <Box display="flex" alignItems="center" gap="10px">
                    <TextField
                        select
                        label='Search by'
                        value={searchField}
                        onChange={handleSearchFieldChange}
                        size='small'
                    >
                        <MenuItem value='name'>Name</MenuItem>
                        <MenuItem value='phoneNumber'>Mobile</MenuItem>
                        {/* <MenuItem value='email'>Email</MenuItem>
                        <MenuItem value='address'>Address</MenuItem>
                        <MenuItem value='orderId'>Order ID</MenuItem> Added Order ID as search option */}
                    </TextField>
                    <TextField
                        variant='outlined'
                        size='small'
                        placeholder='Search'
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <CloseIcon
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => setSearchInput('')}
                                    />
                                </InputAdornment>
                            ),
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>

                <Box display="flex" gap="1rem" marginTop="10px">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label="Start Date"
                            value={startDate}
                            onChange={(newValue) => {
                                setStartDate(newValue);
                                if (newValue && endDate && newValue.isAfter(endDate)) {
                                    setEndDate(newValue); // Ensure end date is at least the start date
                                }
                                setActiveTag('custom');
                                setCurrentPage(1); // Reset to first page
                                setProblematicCurrentPage(1); // Reset problematic customers to first page
                                fetchOrders();
                                if (selectedProblematicFilter) {
                                    fetchProblematicOrders();
                                }
                            }}
                            renderInput={(params) => <TextField {...params} size='small' />}
                        />
                        <DatePicker
                            label="End Date"
                            value={endDate}
                            onChange={(newValue) => {
                                setEndDate(newValue);
                                if (newValue && startDate && newValue.isBefore(startDate)) {
                                    setStartDate(newValue); // Ensure start date is at most the end date
                                }
                                setActiveTag('custom');
                                setCurrentPage(1); // Reset to first page
                                setProblematicCurrentPage(1); // Reset problematic customers to first page
                                fetchOrders();
                                if (selectedProblematicFilter) {
                                    fetchProblematicOrders();
                                }
                            }}
                            renderInput={(params) => <TextField {...params} size='small' />}
                        />
                    </LocalizationProvider>
                </Box>
            </Box>

            {/* Main Orders Section */}
            {loading ? (
                <Typography variant="h6" align="center">Loading...</Typography>
            ) : (
                <>
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Total Orders: {totalOrders} {/* Updated */}
                        </Typography>
                        {orders.length === 0 ? (
                            <Typography variant="body1">No orders found.</Typography>
                        ) : (
                            orders.map(order => (
                                <CustomerCard
                                    key={order._id}
                                    order={order} // Pass order instead of customer
                                    expanded={expanded}
                                    handleChange={handleChange}
                                />
                            ))
                        )}
                    </Box>

                    <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={(event, value) => setCurrentPage(value)}
                        variant="outlined"
                        shape="rounded"
                        sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}
                    />
                </>
            )}

            {/* Problematic Orders Section */}
            {selectedProblematicFilter && (
                <>
                    <Typography variant="subtitle1" gutterBottom>
                        Total Problematic Orders: {problematicTotalOrders}
                    </Typography>

                    {problematicLoading ? (
                        <Typography variant="h6" align="center">Loading...</Typography>
                    ) : (
                        <>
                            <Box>
                                {problematicOrders.length === 0 ? (
                                    <Typography variant="body1">No problematic orders found.</Typography>
                                ) : (
                                    problematicOrders.map(order => (
                                        <CustomerCard
                                            key={order._id}
                                            order={order} // Pass order instead of customer
                                            expanded={expanded}
                                            handleChange={handleChange}
                                        />
                                    ))
                                )}
                            </Box>

                            <Pagination
                                count={problematicTotalPages}
                                page={problematicCurrentPage}
                                onChange={handleProblematicPaginationChange}
                                variant="outlined"
                                shape="rounded"
                                sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}
                            />
                        </>
                    )}
                </>
            )}
        </Container>
    );
};

export default Index;