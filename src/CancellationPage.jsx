// CancelBookingPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from '@mui/material';
import BookingDetailsModal from './CancelationViewPage';
import Navbar from './Navbar';

const CancelBookingPage = () => {
  const [userId, setUserId] = useState('');
  const [bookingIds, setBookingIds] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [cancellationMessage, setCancellationMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Fetch the user ID from sessionStorage
    const storedUserId = sessionStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    }

    const fetchBookingDetails = async () =>{
      try{
        const response = await axios.get(`https://localhost:7285/api/Bookings/booking/${bookingId}`);
        const bookingData = response.data;
        console.log(response.data)

      }catch{

      }
    }
    // Fetch the user's bookings when the component mounts
    const fetchBookings = async () => {
      try {
        const response = await axios.get(
          `https://localhost:7285/api/Bookings/CancelBooking/${userId}`
        );
        setBookingIds(response.data);
        console.log(response.data)
      } catch (error) {
        console.log('Error fetching bookings:', error);
      }
    };

    fetchBookings();
  }, [userId]);

  



  const handleViewDetails = (bookingId) => {
    setSelectedBookingId(bookingId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  

  return (
    <div style={{marginTop:50}}>
      <h1>Booking Cancellation Page</h1>
      
      <Navbar/>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Booking ID</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookingIds ? (
              bookingIds.map((id) => (
                <TableRow key={id}>
                  <TableCell>{id}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleViewDetails(id)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2}>Loading...</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {cancellationMessage && <p>{cancellationMessage}</p>}
      <BookingDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        bookingId={selectedBookingId}
      />
    </div>
  );
};

export default CancelBookingPage;
