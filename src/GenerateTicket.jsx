
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
  Box,
} from '@mui/material';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import Navbar from './Navbar';
import login from './assets/Ticket.gif';

const TicketGenerator = () => {
  const [bookingDetails, setBookingDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sourceCities, setSourceCities] = useState([]);
  const [destinationCities, setDestinationCities] = useState([]);

  useEffect(() => {
    // Fetch the BookingId from sessionStorage
    const bookingId = sessionStorage.getItem('bookingId');

    // Fetch booking details based on the BookingId
    const fetchBookingDetails = async () => {
      try {
        const response = await axios.get(
          `https://localhost:7285/api/Bookings/getBooking/${bookingId}`
        );
        setBookingDetails(response.data);

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
        sourceCities[ticket.ticketNo], // Assuming ticketNo starts from 113
        destinationCities[ticket.ticketNo], // Assuming ticketNo starts from 113
        ticket.seatNo,
        ticket.name,
        ticket.age,
        ticket.gender,
      ]),
    });

    // Check if partnerTickets exist and add them to the PDF
    if (bookingDetails.partnerTickets && bookingDetails.partnerTickets.length > 0) {
      pdf.addPage(); // Add a new page for partner tickets
      pdf.text('Partner Tickets', 20, 10);
      pdf.autoTable({
        head: [['Ticket No', 'Flight Name', 'Source City', 'Destination City', 'Seat No', 'Name', 'Age', 'Gender', 'Airline Name', 'Date and Time']],
        body: bookingDetails.partnerTickets.map((partnerTicket) => [
          partnerTicket.ticketNo,
          partnerTicket.flightName,
          // Fetch source and destination city for partner tickets
          // You can modify this part based on your actual API endpoints
          partnerTicket.sourceAirportId,
          partnerTicket.destinationAirportId,
          partnerTicket.seatNo,
          partnerTicket.name,
          partnerTicket.age,
          partnerTicket.gender,
          partnerTicket.airlineName,
          partnerTicket.dateTime,
        ]),
      });
    }

    pdf.save('tickets.pdf');
  };

  return (
    <Container>
      <Navbar />
      <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: '350px' ,marginTop:'100px'}}>
          <img src={login} alt="SanjayAirline Logo" style={{ marginLeft: 55, height: '300px', width: '300px' }} />
        </Box>


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
                            <TableCell>{sourceCities[index]}</TableCell>
                            <TableCell>{destinationCities[index]}</TableCell>
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

          {/* Display partnerTickets if they exist */}
          {bookingDetails.partnerTickets && bookingDetails.partnerTickets.length > 0 && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h5" component="div">
                    Partner Tickets
                  </Typography>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Ticket No</TableCell>
                          <TableCell>Flight Name</TableCell>
                          <TableCell>Source City</TableCell>
                          <TableCell>Destination City</TableCell>
                          <TableCell>Seat No</TableCell>
                          <TableCell>Name</TableCell>
                          <TableCell>Age</TableCell>
                          <TableCell>Gender</TableCell>
                          <TableCell>Airline Name</TableCell>
                          <TableCell>Date and Time</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {bookingDetails.partnerTickets.map((partnerTicket, index) => (
                          <TableRow key={index}>
                            <TableCell>{partnerTicket.ticketNo}</TableCell>
                            <TableCell>{partnerTicket.flightName}</TableCell>
                            {/* Fetch source and destination city for partner tickets */}
                            {/* You can modify this part based on your actual API endpoints */}
                            <TableCell>{partnerTicket.sourceAirportId}</TableCell>
                            <TableCell>{partnerTicket.destinationAirportId}</TableCell>
                            <TableCell>{partnerTicket.seatNo}</TableCell>
                            <TableCell>{partnerTicket.name}</TableCell>
                            <TableCell>{partnerTicket.age}</TableCell>
                            <TableCell>{partnerTicket.gender}</TableCell>
                            <TableCell>{partnerTicket.airlineName}</TableCell>
                            <TableCell>{partnerTicket.dateTime}</TableCell>
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
