
import React, { useState } from 'react';
import { TextField, Button, Box, Snackbar, MenuItem, Select, CircularProgress, InputLabel, FormControl, OutlinedInput, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Checkbox } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { uploadToS3 } from '@/utils/aws';
import { Upload, Cancel } from '@mui/icons-material';
import { useRouter } from 'next/router';

const AddHappyCustomerPage = () => {
  const router = useRouter();
  const [loadingButton, setLoadingButton] = useState(false);
  const [successAlert, setSuccessAlert] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');

  const [formData, setFormData] = useState({
    category: '',
    customerName: '',
    customerReview: '',
    homePageOrder: '',
    customerPhoto: '',
    placements: [],
    categoryVariants: [],
    isGlobal: false,
    globalDisplayOrder: '',
    specificCategory: '',
  });

  const categoryOptions = ["flw", "win", "bw", "hell"];

  const handleInputChange = (field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    setImageFile(file);
    handleImageUpload(file);
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: 'image/*',
    maxFiles: 1,
    onDrop,
  });

  const generateRandomString = () => Math.floor(100000 + Math.random() * 900000).toString();

  const handleImageUpload = async (file) => {
    try {
      const fileType = file.type || 'image/jpeg';
      const randomString = generateRandomString();
      const uploadPath = `${formData.category}/${randomString}`;
      const uploadedImageUrl = await uploadToS3(file, uploadPath, 'showcase', fileType);
      setImageUrl(uploadedImageUrl);
    } catch (error) {
      console.error('Error uploading image:', error.message);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImageUrl('');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!imageFile) {
      alert('Please upload an image');
      return;
    }

    try {
      setLoadingButton(true);

      const res = await fetch('/api/admin/manage/add/addhappycustomer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, customerPhoto: imageUrl }),
      });

      if (res.ok) {
        setSuccessAlert(true);
        setFormData({
          category: '',
          customerName: '',
          customerReview: '',
          homePageOrder: '',
          customerPhoto: '',
          placements: [],
          categoryVariants: [],
          isGlobal: false,
          globalDisplayOrder: '',
          specificCategory: '',
        });
        setImageFile(null);
        setImageUrl('');
        setTimeout(() => router.reload(), 3000);
      } else {
        console.error('Error adding happy customer:', res.statusText);
      }
    } catch (error) {
      console.error('Error adding happy customer:', error.message);
    } finally {
      setLoadingButton(false);
    }
  };

  return (
    <div style={{ padding: '2rem', backgroundColor: 'rgb(26, 26, 26)', color: 'white' }}>
      <h1>Add Happy Customer</h1>
      <form onSubmit={handleFormSubmit} style={{ maxWidth: '800px' }}>
        {/* Table Component */}
        <TableContainer sx={{ mb: 2, backgroundColor: '#333', color: 'white' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell style={{ color: 'white' }}>Specific Category</TableCell>
                <TableCell style={{ color: 'white' }}>Category</TableCell>
                <TableCell style={{ color: 'white' }}>Display Order</TableCell>
                <TableCell style={{ color: 'white' }}>Is Global</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>
                  <TextField
                    value={formData.specificCategory}
                    onChange={(e) => handleInputChange('specificCategory', e.target.value)}
                    variant="outlined"
                    fullWidth
                    required
                    InputProps={{ style: { color: 'white' } }}
                  />
                </TableCell>
                <TableCell>
                  <FormControl fullWidth>
                    <InputLabel style={{ color: 'white' }}>Category</InputLabel>
                    <Select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      label="Category"
                      style={{ color: 'white' }}
                    >
                      {categoryOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>
                  <TextField
                    value={formData.globalDisplayOrder}
                    onChange={(e) => handleInputChange('globalDisplayOrder', e.target.value)}
                    type="number"
                    variant="outlined"
                    fullWidth
                    required
                    InputProps={{ style: { color: 'white' } }}
                  />
                </TableCell>
                <TableCell>
                  <Checkbox
                    checked={formData.isGlobal}
                    onChange={(e) => handleInputChange('isGlobal', e.target.checked)}
                    color="primary"
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {/* Other Input Fields */}
        <Box sx={{ mb: 2 }}>
          <TextField
            label="Customer Name"
            value={formData.customerName}
            onChange={(e) => handleInputChange('customerName', e.target.value)}
            variant="standard"
            fullWidth
            required
            InputProps={{ style: { color: 'white' } }}
          />
        </Box>
        <Box sx={{ mb: 2 }}>
          <TextField
            label="Customer Review"
            value={formData.customerReview}
            onChange={(e) => handleInputChange('customerReview', e.target.value)}
            variant="standard"
            fullWidth
            required
          />
        </Box>
        
        {/* Image Upload */}
        <p>Upload or drag the customer's image</p>
        {!imageFile ? (
          <div
            {...getRootProps()}
            style={{
              cursor: 'pointer',
              border: '1px solid white',
              padding: '2rem',
              textAlign: 'center',
              marginBottom: '2rem',
            }}
          >
            <input {...getInputProps()} />
            <p>Drag and drop an image here, or click to select an image</p>
            <Upload fontSize="large" />
          </div>
        ) : (
          <Box mt={2} style={{ position: 'relative' }}>
            <img
              src={URL.createObjectURL(imageFile)}
              alt="Preview"
              style={{ maxWidth: '100%', maxHeight: '200px' }}
            />
            <Button
              variant="text"
              color="error"
              onClick={handleRemoveImage}
              style={{ position: 'absolute', top: '0px', right: '0px' }}
            >
              <Cancel />
            </Button>
          </Box>
        )}
        
        <Button
          type="submit"
          variant="contained"
          sx={{
            mt: 3,
            width: '100%',
            fontSize: '1.2rem',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            color: 'black',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
            },
          }}
        >
          {loadingButton ? <CircularProgress size={24} color="inherit" /> : 'Add Happy Customer'}
        </Button>
      </form>

      <Snackbar
        open={successAlert}
        autoHideDuration={3000}
        onClose={() => setSuccessAlert(false)}
        sx={{ zIndex: 8888 }}
      >
        <div style={{ backgroundColor: 'green', color: 'white', padding: '16px' }}>
          Happy customer added successfully!
        </div>
      </Snackbar>
    </div>
  );
};

export default AddHappyCustomerPage;




// import React, { useState } from 'react';
// import { TextField, Button, Box, Snackbar, MenuItem, Select, CircularProgress, InputLabel, FormControl, OutlinedInput, Chip } from '@mui/material';
// import { useDropzone } from 'react-dropzone';
// import { uploadToS3 } from '@/utils/aws';
// import { Upload } from '@mui/icons-material';
// import { Cancel } from '@mui/icons-material';
// import { useRouter } from 'next/router';

// const AddHappyCustomerPage = () => {
//   const router = useRouter();
//   const [loadingButton, setLoadingButton] = useState(false);
//   const [successAlert, setSuccessAlert] = useState(false);
//   const [imageFile, setImageFile] = useState(null);
//   const [imageUrl, setImageUrl] = useState('');

//   const [formData, setFormData] = useState({
//     category: 'win',
//     customerName: '',
//     customerReview: '',
//     homePageOrder: '',
//     customerPhoto: '',
//     placements: [],
//     categoryVariants: [], // New field for multiple category variants
//   });

//   const categoryOptions = ["flw", "win", "bw", "hell"]; // Add or update the options as needed

//   const handleInputChange = (field, value) => {
//     setFormData((prevData) => ({
//       ...prevData,
//       [field]: value,
//     }));
//   };

//   const handleCategoryVariantChange = (event) => {
//     const { value } = event.target;
//     setFormData((prevData) => ({
//       ...prevData,
//       categoryVariants: typeof value === 'string' ? value.split(',') : value,
//     }));
//   };

//   const onDrop = (acceptedFiles) => {
//     const file = acceptedFiles[0];
//     setImageFile(file);
//     handleImageUpload(file);
//   };

//   const { getRootProps, getInputProps } = useDropzone({
//     accept: 'image/*',
//     maxFiles: 1,
//     onDrop,
//   });

//   const generateRandomString = () => {
//     return Math.floor(100000 + Math.random() * 900000).toString();
//   };

//   const handleImageUpload = async (file) => {
//     try {
//       const fileType = file.type || 'image/jpeg';
//       const randomString = generateRandomString();
//       const uploadPath = `${formData.category}/${randomString}`;

//       const uploadedImageUrl = await uploadToS3(file, uploadPath, 'showcase', fileType);
//       setImageUrl(uploadedImageUrl);
//     } catch (error) {
//       console.error('Error uploading image:', error.message);
//     }
//   };

//   const handleRemoveImage = async () => {
//     setImageFile(null);
//     setImageUrl('');
//   };

//   const handleFormSubmit = async (e) => {
//     e.preventDefault();

//     if (!imageFile) {
//       alert('Please upload an image');
//       return;
//     }

//     try {
//       setLoadingButton(true);

//       const res = await fetch('/api/admin/manage/add/addhappycustomer', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           ...formData,
//           customerPhoto: imageUrl,
//         }),
//       });

//       if (res.ok) {
//         setSuccessAlert(true);

//         // Reset the form after successful submission
//         setFormData({
//           category: 'win',
//           customerName: '',
//           customerReview: '',
//           homePageOrder: '',
//           customerPhoto: '',
//           placements: [],
//           categoryVariants: [],
//         });
//         setImageFile(null);
//         setImageUrl('');

//         setTimeout(() => {
//           router.reload();
//         }, 3000);
//       } else {
//         console.error('Error adding happy customer:', res.statusText);
//       }
//     } catch (error) {
//       console.error('Error adding happy customer:', error.message);
//     } finally {
//       setLoadingButton(false);
//     }
//   };

//   return (
//     <div style={{ padding: '2rem', backgroundColor: 'rgb(26, 26, 26)', color: 'white' }}>
//       <h1>Add Happy Customer</h1>
//       <form onSubmit={handleFormSubmit} style={{ maxWidth: '800px' }}>
//         <Box sx={{ mb: 2 }}>
//           <TextField
//             select
//             label="Category"
//             value={formData.category}
//             onChange={(e) => handleInputChange('category', e.target.value)}
//             variant="standard"
//             fullWidth
//             required
//           >
//             <MenuItem value="win">Win Wraps</MenuItem>
//             <MenuItem value="hel">Helmet Wraps</MenuItem>
//             <MenuItem value="twrapclassic">T Wraps Classic</MenuItem>
//             <MenuItem value="twrapsports">T Wraps Sports</MenuItem>
//             <MenuItem value="bike">Bike Wraps</MenuItem>
//             <MenuItem value="bsw">Bonnet strip Wraps</MenuItem>
//           </TextField>
//         </Box>
        
//         {/* Multi-select for Category Variants */}
//         <Box sx={{ mb: 2 }}>
//           <FormControl fullWidth>
//             <InputLabel>Category Variants</InputLabel>
//             <Select
//               multiple
//               value={formData.categoryVariants}
//               onChange={handleCategoryVariantChange}
//               input={<OutlinedInput label="Category Variants" />}
//               renderValue={(selected) => (
//                 <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
//                   {selected.map((value) => (
//                     <Chip key={value} label={value} />
//                   ))}
//                 </Box>
//               )}
//             >
//               {categoryOptions.map((option) => (
//                 <MenuItem key={option} value={option}>
//                   {option}
//                 </MenuItem>
//               ))}
//             </Select>
//           </FormControl>
//         </Box>

//         <Box sx={{ mb: 2 }}>
//           <TextField
//             label="Customer Name"
//             value={formData.customerName}
//             onChange={(e) => handleInputChange('customerName', e.target.value)}
//             variant="standard"
//             fullWidth
//             required
//           />
//         </Box>
        
//         <Box sx={{ mb: 2 }}>
//           <TextField
//             label="Home Page Order"
//             value={formData.homePageOrder}
//             onChange={(e) => handleInputChange('homePageOrder', e.target.value)}
//             variant="standard"
//             type="number"
//             fullWidth
//             required
//           />
//         </Box>
        
//         <p>Upload or drag the customer's image</p>
//         {!imageFile ? (
//           <div
//             {...getRootProps()}
//             style={{
//               cursor: 'pointer',
//               border: '1px solid white',
//               padding: '2rem',
//               textAlign: 'center',
//               marginBottom: '2rem',
//             }}
//           >
//             <input {...getInputProps()} />
//             <p>Drag and drop an image here, or click to select an image</p>
//             <Upload fontSize="large" />
//           </div>
//         ) : (
//           <Box mt={2} style={{ position: 'relative' }}>
//             <img
//               src={URL.createObjectURL(imageFile)}
//               alt="Preview"
//               style={{ maxWidth: '100%', maxHeight: '200px' }}
//             />
//             <Button
//               variant="text"
//               color="error"
//               onClick={handleRemoveImage}
//               style={{ position: 'absolute', top: '0px', right: '0px' }}
//             >
//               <Cancel />
//             </Button>
//           </Box>
//         )}
//         <Button
//           type="submit"
//           variant="contained"
//           sx={{
//             mt: 3,
//             width: '100%',
//             fontSize: '1.2rem',
//             backgroundColor: 'rgba(255, 255, 255, 0.9)',
//             color: 'black',
//             '&:hover': {
//               backgroundColor: 'rgba(255, 255, 255, 0.9)',
//             },
//           }}
//         >
//           {loadingButton ? <CircularProgress size={24} color="inherit" /> : 'Add Happy Customer'}
//         </Button>
//       </form>

//       <Snackbar
//         open={successAlert}
//         autoHideDuration={3000}
//         onClose={() => setSuccessAlert(false)}
//         sx={{ zIndex: 8888 }}
//       >
//         <div style={{ backgroundColor: 'green', color: 'white', padding: '16px' }}>
//           Happy customer added successfully!
//         </div>
//       </Snackbar>
//     </div>
//   );
// };

// export default AddHappyCustomerPage;
