import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Snackbar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import axiosInstance from './AxiosInstance';
import { ToastContainer, toast } from 'react-toastify';

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
      const response = await axios.patch(`https://localhost:7285/api/Bookings/CancelBooking/${bookingId}`);
      // Handle cancellation response as needed
      setCancellationMessage(response.data);
      toast.success("Booking Cancelled Successfully")
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

  const handleCancelTicket = async (ticketNo,passengerName) =>{
    try{
      

      const bookingType = bookingDetails.booking.bookingType
      console.log(bookingType)
    
    const response = await axiosInstance.patch(`Bookings/CancelTicket/${bookingId}/${ticketNo}/${bookingType}/${passengerName}`)
    console.log(response.data);
    toast.success("Ticket Cancelled Sucessfully");
  }catch(error){
    console.log(error)
    console.error('Error Ticket Cancelling booking:',error);
  }


  }

  return (
    <>
    <ToastContainer/>
      <Dialog open={isOpen} onClose={onClose}>
        <DialogTitle>Booking Details</DialogTitle>
        <DialogContent>
          {bookingDetails && bookingDetails.tickets ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Ticket No</TableCell>
                    <TableCell>Booking Type</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Seat No</TableCell>
                    <TableCell>Source City</TableCell>
                    <TableCell>Destination City</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bookingDetails.tickets.map((ticket, index) => (
                    <TableRow key={index}>
                      <TableCell>{ticket.ticketNo}</TableCell>
                      <TableCell>{bookingDetails.booking.bookingType}</TableCell>
                      <TableCell>{ticket.name}</TableCell>
                      <TableCell>{ticket.seatNo}</TableCell>
                      <TableCell>{ticket.sourceCity}</TableCell>
                      <TableCell>{ticket.destinationCity}</TableCell>
                      <TableCell><Button onClick={() => handleCancelTicket(ticket.ticketNo, ticket.name)}>Cancel Ticket</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <p>Loading...</p>
          )}

          {/* Render partner tickets if available */}
          {bookingDetails && bookingDetails.partnerTickets && bookingDetails.partnerTickets.length > 0 && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Ticket No</TableCell>
                    <TableCell>Airline</TableCell>
                    <TableCell>Source Airport</TableCell>
                    <TableCell>Destination Airport</TableCell>
                    <TableCell>Seat No</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bookingDetails.partnerTickets.map((partnerTicket, index) => (
                    <TableRow key={index}>
                      <TableCell>{partnerTicket.ticketNo}</TableCell>
                      <TableCell>{partnerTicket.airlineName}</TableCell>
                      <TableCell>{partnerTicket.sourceAirportId}</TableCell>
                      <TableCell>{partnerTicket.destinationAirportId}</TableCell>
                      <TableCell>{partnerTicket.seatNo}</TableCell>
                      <TableCell>{partnerTicket.name}</TableCell>
                      <TableCell><Button onClick={() => handleCancelTicket(partnerTicket.ticketNo, partnerTicket.name)}>Cancel Ticket</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="secondary" onClick={handleCancelBooking}>
            Cancel Booking
          </Button>
          <Button onClick={onClose}>Close</Button>
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
