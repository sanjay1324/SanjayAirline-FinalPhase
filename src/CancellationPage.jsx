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
  CircularProgress,
  TablePagination,
} from '@mui/material';
import BookingDetailsModal from './CancelationViewPage';
import Navbar from './Navbar';
import axiosInstance from './AxiosInstance';
import GradientBackground from './GradientBackground';

const CancelBookingPage = () => {
  const [userId, setUserId] = useState('');
  const [bookingDetails, setBookingDetails] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [cancellationMessage, setCancellationMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [flightDate, setFlightDate] = useState(''); // Added flightDate state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    const storedUserId = sessionStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    }

    fetchBookings();
  }, [userId, flightDate, page, rowsPerPage]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const userId = sessionStorage.getItem('userId');
      const response = await axiosInstance.get(`Bookings/CancelBooking/${userId}`, {
        params: { flightDate },
      });
      setBookingDetails(response.data);
      setLoading(false);
    } catch (error) {
      console.log('Error fetching bookings:', error);
      setLoading(false);
    }
  };

  const handleViewDetails = (bookingId) => {
    setSelectedBookingId(bookingId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSearch = () => {
    setPage(0);
    fetchBookings();
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <GradientBackground>

    <div style={{ marginTop: 50 }}>
      <h1>Booking Cancellation Page</h1>
      <Navbar />

      <div style={{ marginBottom: 20 }}>
        <input
          type="date" // Use input type 'date' for selecting flightDate
          value={flightDate}
          onChange={(e) => setFlightDate(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

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
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} style={{ textAlign: 'center' }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : bookingDetails.length > 0 ? (
              bookingDetails
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((booking) => (
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
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={bookingDetails.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
      {cancellationMessage && <p>{cancellationMessage}</p>}
      <BookingDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        bookingId={selectedBookingId}
      />
    </div>
    </GradientBackground>

  );
};

export default CancelBookingPage;
