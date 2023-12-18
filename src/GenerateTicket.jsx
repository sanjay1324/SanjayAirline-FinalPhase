import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Card,
  CardContent,
  Typography,
  Container,
  Grid,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from '@mui/material';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const TicketGenerator = () => {
  const [bookingDetails, setBookingDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sourceCities, setSourceCities] = useState([]);
  const [destinationCities, setDestinationCities] = useState([]);

  useEffect(() => {
    // Fetch the BookingId from sessionStorage
    const bookingId = sessionStorage.getItem('bookingId');
console.log(sourceCities);
console.log(destinationCities)
    // Fetch booking details based on the BookingId
    const fetchBookingDetails = async () => {
      try {
        const response = await axios.get(
          `https://localhost:7285/api/Bookings/getBooking/${bookingId}`
        );
        setBookingDetails(response.data);
        console.log(response.data)

        // Fetch source and destination city using each scheduleId
        if (response.data.tickets && response.data.tickets.length > 0) {
          const sourceCityPromises = response.data.tickets.map((ticket) =>
            fetchAirportCities(ticket.scheduleId, 'source')
          );

          const destinationCityPromises = response.data.tickets.map((ticket) =>
            fetchAirportCities(ticket.scheduleId, 'destination')
          );

          Promise.all(sourceCityPromises).then((cities) => setSourceCities(cities));
          Promise.all(destinationCityPromises).then((cities) => setDestinationCities(cities));
        }
      } catch (error) {
        console.error('Error fetching booking details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchBookingDetails();
    }
  }, []);

  const fetchAirportCities = async (scheduleId, type) => {
    try {
      const scheduleResponse = await axios.get(
        `https://localhost:7285/api/FlightSchedules/${scheduleId}`
      );

      const airportId = type === 'source' ? scheduleResponse.data.sourceAirportId : scheduleResponse.data.destinationAirportId;

      const airportResponse = await axios.get(
        `https://localhost:7285/api/Airports/${airportId}`
      );

      return airportResponse.data.city;
    } catch (error) {
      console.error('Error fetching airport details:', error);
      return '';
    }
  };

  const downloadTickets = () => {
    const pdf = new jsPDF();
    pdf.text('Booking Details', 20, 10);
    pdf.autoTable({
      head: [['Ticket No', 'Schedule ID', 'Source City', 'Destination City', 'Seat No', 'Name', 'Age', 'Gender']],
      body: bookingDetails.tickets.map((ticket) => [
        ticket.ticketNo,
        ticket.scheduleId,
        sourceCities[ticket.ticketNo - 113], // Assuming ticketNo starts from 113
        destinationCities[ticket.ticketNo - 113], // Assuming ticketNo starts from 113
        ticket.seatNo,
        ticket.name,
        ticket.age,
        ticket.gender,
      ]),
    });
    pdf.save('tickets.pdf');
  };

  return (
    <Container>
      {loading && <CircularProgress />}

      {bookingDetails && (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="div">
                  Booking Details
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  Booking ID: {bookingDetails.booking.bookingId}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  Status: {bookingDetails.booking.status}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  User ID: {bookingDetails.booking.userId}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  Booking Type: {bookingDetails.booking.bookingType}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {bookingDetails.tickets && bookingDetails.tickets.length > 0 && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h5" component="div">
                    Tickets
                  </Typography>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Ticket No</TableCell>
                          <TableCell>Schedule ID</TableCell>
                          <TableCell>Source City</TableCell>
                          <TableCell>Destination City</TableCell>
                          <TableCell>Seat No</TableCell>
                          <TableCell>Name</TableCell>
                          <TableCell>Age</TableCell>
                          <TableCell>Gender</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {bookingDetails.tickets.map((ticket, index) => (
                          <TableRow key={index}>
                            <TableCell>{ticket.ticketNo}</TableCell>
                            <TableCell>{ticket.scheduleId}</TableCell>
                            <TableCell>{sourceCities}</TableCell>
                            <TableCell>{destinationCities}</TableCell>
                            <TableCell>{ticket.seatNo}</TableCell>
                            <TableCell>{ticket.name}</TableCell>
                            <TableCell>{ticket.age}</TableCell>
                            <TableCell>{ticket.gender}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          )}

          <Grid item xs={12}>
            <Button variant="contained" color="primary" onClick={downloadTickets}>
              Download Tickets
            </Button>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default TicketGenerator;
