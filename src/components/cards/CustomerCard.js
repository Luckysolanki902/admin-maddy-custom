import React, { useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
  Box,
  Popover,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const formatOrderDate = (dateInput) => {
  const utcDate = new Date(dateInput);
  const options = {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };
  const istFormattedDate = new Intl.DateTimeFormat('en-US', options).format(utcDate);

  const today = new Date(new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).format(new Date()));

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const orderDate = new Date(new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).format(utcDate));

  if (orderDate.getTime() === today.getTime()) {
    const timePart = istFormattedDate.match(/\d{1,2}:\d{2} (AM|PM)/)[0];
    return `Today | ${timePart}`;
  }

  if (orderDate.getTime() === yesterday.getTime()) {
    const timePart = istFormattedDate.match(/\d{1,2}:\d{2} (AM|PM)/)[0];
    return `Yesterday | ${timePart}`;
  }

  return istFormattedDate.replace(',', ' |');
};

const CustomerCard = ({ order, expanded, handleChange }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [popoverProducts, setPopoverProducts] = useState([]);

  const handlePopoverOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setPopoverProducts(order.items);
  };

  const handlePopoverClose = (event) => {
    event.stopPropagation();
    setAnchorEl(null);
    setPopoverProducts([]);
  };

  const open = Boolean(anchorEl);
  const id = open ? `popover-${order._id}` : undefined;

  const copyToClipboard = (event) => {
    event.stopPropagation();
    navigator.clipboard.writeText(order._id)
      .then(() => {
        console.log('Order ID copied to clipboard');
      })
      .catch((err) => {
        console.error('Failed to copy Order ID: ', err);
      });
  };

  const getPaymentModeColor = (modeName) => {
    switch (modeName.toLowerCase()) {
      case 'online':
        return '#34C759';
      case 'cod':
        return 'blue';
      default:
        return 'yellow';
    }
  };

  return (
    <Accordion
      key={order._id}
      expanded={expanded === order._id}
      onChange={handleChange(order._id)}
      sx={{
        marginBottom: '10px',
        width: '100%',
        backgroundColor: '#2C2C2C',
        borderRadius: '8px',
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr', // Single column on extra small devices
              sm: '1fr 1fr', // Two columns on small devices
              md: '2fr 2fr 1.5fr 1.5fr', // Original layout on medium and up
            },
            gap: { xs: '8px', sm: '16px' },
            alignItems: 'center',
            width: '100%',
          }}
        >
          {/* Left Section: Order ID and Timestamp */}
          <Box>
            <Typography
              variant="body1"
              sx={{
                color: '#2D7EE8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
              onClick={copyToClipboard}
            >
              {order._id.slice(0, 10)}...
              <ContentCopyIcon fontSize="small" sx={{ marginLeft: '4px' }} />
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'textSecondary', fontSize: { xs: '0.8rem', sm: '1rem' } }}
            >
              {formatOrderDate(order.createdAt)}
            </Typography>
          </Box>

          {/* Customer Information */}
          <Box>
            <Typography
              variant="body2"
              sx={{
                color: 'white',
                fontSize: { xs: '0.9rem', sm: '1rem' },
              }}
            >
              {order.address?.receiverName || 'N/A'}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'textSecondary', fontSize: { xs: '0.8rem', sm: '1rem' } }}
            >
              {order.address?.receiverPhoneNumber || 'N/A'}
            </Typography>
          </Box>

          {/* Delivery Status and Product Count */}
          <Box>
            <Typography
              variant="body2"
              sx={{
                color: 'white',
                fontSize: { xs: '0.8rem', sm: '1rem' },
              }}
            >
              {order.deliveryStatus || 'N/A'}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#2D7EE8',
                cursor: 'pointer',
                fontSize: { xs: '0.8rem', sm: '1rem' },
                width:'fit-content',
              }}
              onClick={handlePopoverOpen}
            >
              {order.items.length} {order.items.length === 1 ? 'Product' : 'Products'}
            </Typography>
            <Popover
              id={id}
              open={open}
              anchorEl={anchorEl}
              onClose={handlePopoverClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
            >
              <Box sx={{ p: 2, maxWidth: '400px' }}>
                <List>
                  {popoverProducts.map((item, index) => (
                    <ListItem key={index} disableGutters>
                      <ListItemText
                        primary={item.product?.specificCategoryVariant?.name || 'N/A'}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="textPrimary">
                              SKU: {item.sku || 'N/A'}
                            </Typography>
                            <br />
                            <Typography component="span" variant="body2" color="textPrimary">
                              QTY: {item.quantity || 'N/A'}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Popover>
          </Box>

          {/* Right Section: Mode of Payment and Total Amount */}
          <Box sx={{ textAlign: { xs: 'left', sm: 'right' }, display:'flex', flexDirection:'column', alignItems:'flex-end', marginRight:'1rem' }}>
            <Typography
              variant="body2"
              sx={{
                color: getPaymentModeColor(order.paymentDetails?.mode?.name || 'cod'),
                fontSize: { xs: '0.8rem', sm: '1rem' },
                backgroundColor:"#5E5E5E",
                padding:'0rem 0.3rem',
                borderRadius:"0.3rem"
              }}
            >
              {(order.paymentDetails?.mode?.name || 'cod').toUpperCase()}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'white',
                fontSize: { xs: '1rem', sm: '1rem' },
                fontWeight:'300'
              }}
            >
              ₹ {order.totalAmount.toFixed(2)}
            </Typography>
          </Box>
        </Box>
      </AccordionSummary>

      <AccordionDetails>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Box>
            <Typography
              variant="subtitle2"
              sx={{  marginBottom: '4px', color: 'white' }}
            >
              Address Details
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}
            >
              {order.address?.addressLine1 || 'N/A'}, {order.address?.city || 'N/A'},{' '}
              {order.address?.state || 'N/A'}, {order.address?.pincode || 'N/A'}
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="subtitle2"
              sx={{  marginBottom: '4px', color: 'white' }}
            >
              Payment Details
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}
            >
              {order.paymentDetails?.mode?.name !== 'online' ? 'Amount Paid Online: ' : 'Amount Paid: '}
              <span style={{ color: '#34C759' }}>
                ₹{order.paymentDetails?.amountPaidOnline || '0'}
              </span>
            </Typography>
            {order.paymentDetails?.mode?.name !== 'online' && (
               <Box>
               {order.paymentDetails?.amountDueOnline > 0 && (
                 <Typography variant="body2">
                   Amount Due Online:
                   <span style={{ color: 'red' }}> ₹{order.paymentDetails?.amountDueOnline}</span>
                 </Typography>
               )}
               {order.paymentDetails?.amountPaidCod === 0 && order.paymentDetails?.amountDueCod > 0 && (
                 <Typography variant="body2">
                   Amount Due COD:
                   <span style={{ color: 'rgb(213, 0, 0)' }}> ₹{order.paymentDetails?.amountDueCod}</span>
                 </Typography>
               )}
               {order.paymentDetails?.amountPaidCod > 0 && (
                 <Typography variant="body2">
                   Amount Paid COD:
                   <span style={{ color: '#34C759' }}>
                      ₹{order.paymentDetails?.amountPaidCod}

                   </span>
                 </Typography>
               )}
             </Box>
            )}
          </Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default CustomerCard;
