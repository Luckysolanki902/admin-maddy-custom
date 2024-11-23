// /components/page-sections/DateRangeChips.js
import React from 'react';
import { Box, Chip, Stack } from '@mui/material';

const DateRangeChips = ({ activeTag, applyDateRange, handleTagRemove, handleAllTagClick }) => {
  return (
    <Box sx={{ display: 'flex', overflowX: 'auto', width: '100%', marginTop: '1rem', marginBottom: '1rem' }}>
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
  );
};

export default DateRangeChips;
