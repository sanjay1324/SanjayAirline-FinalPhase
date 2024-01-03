import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Snackbar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import axiosInstance from './AxiosInstance';
import { ToastContainer, toast } from 'react-toastify';
import { airlinesapi } from './Constants';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
const BookingDetailsModal = ({ isOpen, onClose, bookingId }) => {
  const [bookingDetails, setBookingDetails] = useState(null);
  const [cancellationMessage, setCancellationMessage] = useState('');
  const [isSnackbarOpen, setSnackbarOpen] = useState(false);
  const [isConfirmationOpen, setConfirmationOpen] = useState(false);
  const [secondApiPath, setSecondApiPath] = useState('');
  const [apiPath, setApiPath] = useState('');
  function getApiPathForAirline(airlineName) {
    const apiPath = airlinesapi[airlineName]?.apiPath || 'default-api-path';
    return apiPath;
  }

  const downloadTicketsPDF = () => {
    if (!bookingDetails || !bookingDetails.tickets) {
      return;
    }

    const pdf = new jsPDF();
    pdf.text('Booking Details', 10, 10);

    // Headers
    const headers = [['Ticket No', 'Booking Type', 'Name', 'Seat No', 'Source City', 'Destination City', 'Gender']];

    // Data
    const data = bookingDetails.tickets.map((ticket) => [
      ticket.ticketNo,
      bookingDetails.booking.bookingType,
      ticket.name,
      ticket.seatNo,
      ticket.sourceCity,
      ticket.destinationCity,
      ticket.gender,
    ]);

    // Add table to PDF
    pdf.autoTable({
      head: headers,
      body: data,
      startY: 20,
    });

    // Save PDF
    pdf.save('BookingDetails.pdf');
  };

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        //        const response = await axios.get(`https://localhost:7285/api/Bookings/booking/${bookingId}`);

        const response = await axiosInstance.get(`Bookings/booking/${bookingId}`);
        const bookingData = response.data;
        console.log(response.data.partnerTickets[0]?.airlineName)
        sessionStorage.setItem('airlineName', response.data.partnerTickets[0]?.airlineName)
        const storedAirlineName = sessionStorage.getItem('airlineName');
        setSecondApiPath(storedAirlineName);
        // Use your constants file to get the corresponding apiPath
        const apiPath = getApiPathForAirline(storedAirlineName);
        setApiPath(apiPath)
        console.log(apiPath)

        // Fetch additional details for each ticket
        const ticketsWithDetails = await Promise.all(
          bookingData.tickets.map(async (ticket) => {
            const scheduleResponse = await axiosInstance.get(`FlightSchedules/${ticket.scheduleId}`);

            const sourceAirportId = scheduleResponse.data.sourceAirportId;
            const destinationAirportId = scheduleResponse.data.destinationAirportId;

            const sourceCityResponse = await axiosInstance.get(`Airports/${sourceAirportId}`);
            const destinationCityResponse = await axiosInstance.get(`Airports/${destinationAirportId}`);

            const sourceCity = sourceCityResponse.data.city;
            const destinationCity = destinationCityResponse.data.city;

            return {
              ...ticket,
              sourceCity,
              destinationCity,
              flightTime: scheduleResponse.data.dateTime.split('T')[1], // Extracting time from dateTime
              flightDate: scheduleResponse.data.dateTime.split('T')[0], // Extracting time from dateTime

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
      console.log("other airline")
      //patch(`https://localhost:7285/api/Bookings/CancelBooking/${bookingId}`)
      const response = await axiosInstance.patch(`Bookings/CancelBooking/${bookingId}`);
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
    console.log("Sanjay working")
    setSnackbarOpen(false);
  };

  const handleCancelTicket = async (ticketNo, passengerName) => {
    try {

      const bookingType = bookingDetails.booking.bookingType
      console.log(bookingType)

      const response = await axiosInstance.patch(`Bookings/CancelTicket/${bookingId}/${ticketNo}/${bookingType}/${passengerName}`)
      console.log(response.data);
      const Check = sessionStorage.getItem('airlineName');
      console.log(Check)

      console.log(passengerName)
      if (Check != 'undefined') {
        const apiPath2 = apiPath;
        console.log(apiPath2)
        const axiosInstanceForApiPath = axios.create({
          baseURL: apiPath2,
        });

        try {
          const token = sessionStorage.getItem('token'); // Retrieve token from sessionStorage

          // Assuming 'bookingId' and 'passengerName' are defined
          const response = await axiosInstanceForApiPath.patch(
            `Integration/cancelticketsinpartnerbooking/${bookingId}`,
            [passengerName],
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
            }
          );

          console.log(response);

          // Display success toast for 2 seconds
          toast.success('Ticket Cancelled Successfully', {
            autoClose: 3000,
          });

          // Reload the page after 2 seconds
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } catch (error) {
          console.error(error);
          toast.error('Error cancelling ticket');
        }
      } else {
        toast.success("Cancel successfully")
      }

    } catch (error) {
      console.log(error)
      console.error('Error Ticket Cancelling booking:', error);
    }


  }

  return (
    <>
      <ToastContainer />
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
                    <TableCell>Destination City</TableCell>                    <TableCell>Flight Date</TableCell> {/* Added Flight Time */}
                    <TableCell>Flight Time</TableCell> {/* Added Flight Time */}

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
                      <TableCell>{ticket.flightDate}</TableCell>
                      <TableCell>{ticket.flightTime}</TableCell>


                      <Button onClick={() => handleCancelTicket(ticket.ticketNo, ticket.name)}>Cancel Ticket</Button>
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
                    <TableCell>Flight Date</TableCell> {/* Added Flight Date for partner tickets */}
                    <TableCell>Flight Time</TableCell>
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
                      <TableCell>{partnerTicket.flightDate}</TableCell> {/* Adjust with actual data for Flight Date */}
                      <TableCell>{partnerTicket.flightTime}</TableCell> {/* Adjust with actual data for Flight Time */}
                      <Button onClick={() => handleCancelTicket(partnerTicket.ticketNo, partnerTicket.name)}>Cancel Ticket</Button>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={downloadTicketsPDF}>Download Tickets</Button>

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
