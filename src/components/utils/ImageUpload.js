// /app/components/utils/ImageUpload.jsx

'use client';

import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography } from '@mui/material';

const ImageUpload = ({ label, accept, onFileSelected, file }) => {
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      [accept]: [],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        onFileSelected(acceptedFiles[0]);
      } else {
        alert(`Only ${accept} files are allowed!`);
      }
    },
  });

  return (
    <Box
      {...getRootProps()}
      sx={{
        border: '2px dashed #ccc',
        borderRadius: '8px',
        p: 2,
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'border 0.3s',
        '&:hover': {
          borderColor: '#aaa',
        },
      }}
    >
      <input {...getInputProps()} />
      {!file ? (
        <Typography variant="body1" color="textSecondary">
          {label}
        </Typography>
      ) : (
        <Typography variant="body1" color="textPrimary">
          {file.name}
        </Typography>
      )}
    </Box>
  );
};

export default ImageUpload;
