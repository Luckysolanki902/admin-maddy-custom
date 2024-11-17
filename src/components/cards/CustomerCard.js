import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Image from 'next/image';
import Timeline from '@mui/lab/Timeline';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';

const CustomerCard = ({ order, expanded, handleChange }) => {
    return (
        <Accordion
            key={order._id}
            expanded={expanded === order._id}
            onChange={handleChange(order._id)}
            style={{ marginBottom: '10px', padding: '0.2rem', width: '100%' }}
        >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', textAlign: 'left', display: 'flex', gap: '2rem' }}>
                        {/* Display the User's name by populating */}
                        <div>{order.user?.name}</div>
                    </div>
                    {/* Display payment status */}
                    <div style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '0.5rem' }}>
                        Contact no: {order.user?.phoneNumber }
                    </div>
                </div>
            </AccordionSummary>
            <AccordionDetails style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', padding: '10px' }}>
                {/* Payment and shipping status */}
                {order.status && (
                    <div style={{ margin: 0, padding: 0, textAlign: 'left' }}>
                        <Timeline sx={{
                            [`& .${timelineItemClasses.root}:before`]: {
                                flex: 0,
                                padding: 0,
                            },
                        }}>
                            <TimelineItem>
                                <TimelineSeparator>
                                    <TimelineDot color={order.purchaseStatus?.paymentVerified ? 'success' : 'grey'} />
                                </TimelineSeparator>
                                <TimelineContent>
                                    <Typography>Payment Successfull: {order.purchaseStatus?.paymentVerified ? 'Yes' : 'No'}</Typography>
                                </TimelineContent>
                            </TimelineItem>
                        </Timeline>
                    </div>
                )}

                {/* Loop through the items in the order */}
                {order.items.map((item, index) => (
                    
                    <Accordion key={index} style={{ marginBottom: '1rem' }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <strong style={{marginRight:'4px'}} >Product:</strong> <span>{item.product?.name || 'N/A'}</span>
                        <div style={{marginLeft:'10px'}}>
                            <strong>Quantity:</strong> {item.quantity}
                        </div>
                        
                        </AccordionSummary>
                        {/* Display item image */}
                        <AccordionDetails >
                        {item.product?.image && (
                            <Image src={item.product.image} width={1076 / 4} height={683 / 4} alt='Image' />
                        )}
                        <div>
                            <strong>Price at Purchase:</strong> {item.priceAtPurchase}
                        </div>
                        {item.discount > 0 && (
                            <div>
                                <strong>Discount:</strong> {item.discount}
                            </div>
                        )}
                        <div> 
                            <strong>Extra Charges</strong>
                            {item.extraCharges.map((ele) => {
                            console.log(ele); // Log to console
                            return (
                                    <li key={ele.chargesName}><strong style={{marginRight:'10px'}}>{ele.chargesName}:</strong>{ele.chargesAmount}</li> // Render HTML tags
                            );
                            })}                    
                        </div>
                        </AccordionDetails>
                    </Accordion>
                ))}

                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                        <strong>OrderId:</strong> <span onClick={() => navigator.clipboard.writeText(order?._id)} style={{ color: 'yellow', cursor: 'pointer' }}>{order?._id}</span>
                    </div>
                    <div>
                        <strong>Total Amount:</strong> <span style={{ color: '#03d11e' }}>{order.totalAmount}</span>
                    </div>
                    {/* Display Mode of Payment */}
                    <div>
                        <strong>Mode Of Payment:</strong> <span style={{ color: '#03d11e' }}>{order.paymentDetails?.mode?.name || 'COD'}</span>
                    </div>
                    <div>
                        <strong>Payment Status:</strong> <span style={{ color: '#03d11e' }}>{order.status}</span>
                    </div>
                    <div>
                        <strong>Ordered On:</strong> {new Date(order?.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                    </div>
                    <div>
                        <strong >Coupon Applied:</strong><span>{order.couponApplied==null?' None':order.couponApplied}</span>
                    </div>

                    {/* Display User address if available */}
                    <div>
                        <strong>Address:</strong> {order.address?.addressLine1}, {order.address?.city}, {order.address?.state}, {order.address?.pincode}
                    </div>
                </div>
            </AccordionDetails>
        </Accordion>
    );
};

export default CustomerCard;
