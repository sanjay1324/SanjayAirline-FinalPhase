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
import axiosInstance from './AxiosInstance';

const CancelBookingPage = () => {
  const [userId, setUserId] = useState('');
  const [bookingDetails, setBookingDetails] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [cancellationMessage, setCancellationMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const storedUserId = sessionStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    }

    const fetchBookings = async () => {
      try {
        const userId = sessionStorage.getItem('userId');
        //          `https://localhost:7285/api/Bookings/CancelBooking/${userId}`,

        const response = await axiosInstance.get(
          `Bookings/CancelBooking/${userId}`
          
        );
        setBookingDetails(response.data);
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
    <div style={{ marginTop: 50 }}>
      <h1>Booking Cancellation Page</h1>

      <Navbar />
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Booking ID</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Booking Type</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookingDetails.length > 0 ? (
              bookingDetails.map((booking) => (
                <TableRow key={booking.bookingId}>
                  <TableCell>{booking.bookingId}</TableCell>
                  <TableCell>{booking.status}</TableCell>
                  <TableCell>{booking.bookingType}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleViewDetails(booking.bookingId)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4}>No bookings found.</TableCell>
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
