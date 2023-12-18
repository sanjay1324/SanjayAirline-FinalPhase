import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Snackbar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const BookingDetailsModal = ({ isOpen, onClose, bookingId }) => {
  const [bookingDetails, setBookingDetails] = useState(null);
  const [cancellationMessage, setCancellationMessage] = useState('');
  const [isSnackbarOpen, setSnackbarOpen] = useState(false);
  const [isConfirmationOpen, setConfirmationOpen] = useState(false);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const response = await axios.get(`https://localhost:7285/api/Bookings/booking/${bookingId}`);
        const bookingData = response.data;
        console.log(response.data)

        // Fetch additional details for each ticket
        const ticketsWithDetails = await Promise.all(
          bookingData.tickets.map(async (ticket) => {
            const scheduleResponse = await axios.get(`https://localhost:7285/api/FlightSchedules/${ticket.scheduleId}`);

            const sourceAirportId = scheduleResponse.data.sourceAirportId;
            const destinationAirportId = scheduleResponse.data.destinationAirportId;

            const sourceCityResponse = await axios.get(`https://localhost:7285/api/Airports/${sourceAirportId}`);
            const destinationCityResponse = await axios.get(`https://localhost:7285/api/Airports/${destinationAirportId}`);

            const sourceCity = sourceCityResponse.data.city;
            const destinationCity = destinationCityResponse.data.city;

            return {
              ...ticket,
              sourceCity,
              destinationCity,
            };
          })
        );

        setBookingDetails({
          ...bookingData,
          tickets: ticketsWithDetails,
        });
      } catch (error) {
        console.error('Error fetching booking details:', error);
      }
    };

    if (isOpen) {
      fetchBookingDetails();
    }
  }, [isOpen, bookingId]);

  const handleCancelBooking = async () => {
    setConfirmationOpen(true);
  };

  const handleConfirmCancel = async () => {
    try {
      const response = await axios.delete(`https://localhost:7285/api/Bookings/CancelBooking/${bookingId}`);
      // Handle cancellation response as needed
      setCancellationMessage(response.data);
      setSnackbarOpen(true);
      onClose();
    } catch (error) {
      console.error('Error cancelling booking:', error);
    } finally {
      setConfirmationOpen(false);
    }
  };

  const handleCancelConfirmation = () => {
    setConfirmationOpen(false);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <>
      <Dialog open={isOpen} onClose={onClose}>
        <DialogTitle>Booking Details</DialogTitle>
        <DialogContent>
          {bookingDetails && bookingDetails.tickets ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Ticket No</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Seat No</TableCell>
                    <TableCell>RouteNo.</TableCell>
                    <TableCell>Source City</TableCell>
                    <TableCell>Destination City</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bookingDetails.tickets.map((ticket, index) => (
                    <TableRow key={index}>
                      <TableCell>{ticket.ticketNo}</TableCell>
                      <TableCell>{ticket.name}</TableCell>
                      <TableCell>{ticket.seatNo}</TableCell>
                      <TableCell>{ticket.scheduleId}</TableCell>
                      <TableCell>{ticket.sourceCity}</TableCell>
                      <TableCell>{ticket.destinationCity}</TableCell>
                      <TableCell><Button>Cancel Ticket</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <p>Loading...</p>
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="secondary" onClick={handleCancelBooking}>
            Cancel Booking
          </Button>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isConfirmationOpen} onClose={handleCancelConfirmation}>
        <DialogTitle>Confirmation</DialogTitle>
        <DialogContent>
          <p>Are you sure you want to cancel this booking?</p>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="secondary" onClick={handleConfirmCancel}>
            Yes
          </Button>
          <Button onClick={handleCancelConfirmation}>
            No
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={isSnackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message={cancellationMessage}
      />
    </>
  );
};

export default BookingDetailsModal;
