// /app/components/Product/DynamicInput.jsx

'use client';

import React from 'react';
import { Box, TextField, IconButton, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const DynamicInput = ({ label, values, setValues }) => {
  const handleChange = (index, value) => {
    const newValues = [...values];
    newValues[index] = value;
    setValues(newValues);
  };

  const handleAdd = () => {
    setValues([...values, '']);
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="subtitle1" gutterBottom>
        {label}
      </Typography>
      {values.map((value, index) => (
        <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TextField
            value={value}
            onChange={(e) => handleChange(index, e.target.value)}
            fullWidth
            required
          />
          {index === values.length - 1 && (
            <IconButton onClick={handleAdd} color="primary">
              <AddIcon />
            </IconButton>
          )}
        </Box>
      ))}
    </Box>
  );
};

export default DynamicInput;
