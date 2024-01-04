
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
import axiosInstance from './AxiosInstance';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
const TicketGenerator = () => {
  const [bookingDetails, setBookingDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sourceCities, setSourceCities] = useState([]);
  const [destinationCities, setDestinationCities] = useState([]);
  const [flightDates, setFlightDates] = useState([]); // Add state for flight dates
  const [flightTimes, setFlightTimes] = useState([]); // Add state for flight times
  const [partnerSourceCities, setPartnerSourceCities] = useState([]); // Add state for partner source cities
  const [partnerDestinationCities, setPartnerDestinationCities] = useState([]); // Add state for partner destination cities
  const [partnerFlightDates, setPartnerFlightDates] = useState([]); // Add state for partner flight dates
  const [partnerFlightTimes, setPartnerFlightTimes] = useState([]); // Add state for partner flight times
  const navigate = useNavigate();

  useEffect(() => {
    const booked = sessionStorage.getItem('isBooked');

    if (booked === 'true') {
      // Clear the 'isBooked' flag to allow access on the next visit
      sessionStorage.removeItem('isBooked');

      // Replace the current entry in the history stack with '/ticket'
      navigate('/ticket', { replace: true });

      // Prevent going back in browser history
      window.history.pushState(null, '', '/ticket');

      // Listen for changes to the history state and handle the back button
      const handlePopState = () => {
        // Replace the current entry again to block going back
        window.history.pushState(null, '', '/ticket');
      };

      // Attach the event listener
      window.addEventListener('popstate', handlePopState);

      // Clean up the event listener on component unmount
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [navigate]);

  // Use the 'beforeunload' event to prevent going back to the booking page
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      const booked = sessionStorage.getItem('isBooked');

      if (booked === 'true') {
        // Display a warning message
        event.returnValue = "You cannot go back to the previous page.";
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
  useEffect(() => {
    const bookingId = sessionStorage.getItem('bookingId');
  
    const fetchBookingDetails = async () => {
      try {
        const response = await axiosInstance.get(
          `Bookings/getBooking/${bookingId}`
        );
        setBookingDetails(response.data);

        if (response.data.tickets && response.data.tickets.length > 0) {
          const sourceCityPromises = response.data.tickets.map((ticket) =>
            fetchAirportCities(ticket.scheduleId, 'source')
          );

          const destinationCityPromises = response.data.tickets.map((ticket) =>
            fetchAirportCities(ticket.scheduleId, 'destination')
          );

          const dateTimePromises = response.data.tickets.map((ticket) =>
            fetchFlightDetails(ticket.scheduleId)
          );

          Promise.all(sourceCityPromises).then((cities) => setSourceCities(cities));
          Promise.all(destinationCityPromises).then((cities) => setDestinationCities(cities));
          Promise.all(dateTimePromises).then((dateTimes) => {
            const flightDates = dateTimes.map((dateTime) => dateTime.split(' ')[0]);
            const flightTimes = dateTimes.map((dateTime) => dateTime.split(' ')[1]);
            setFlightDates(flightDates);
            setFlightTimes(flightTimes);
          });
        }

        // Handle partner tickets separately
        if (response.data.partnerTickets && response.data.partnerTickets.length > 0) {
          const partnerSourceCityPromises = response.data.partnerTickets.map((partnerTicket) =>
            fetchAirportCities(partnerTicket.scheduleId, 'source')
          );

          const partnerDestinationCityPromises = response.data.partnerTickets.map((partnerTicket) =>
            fetchAirportCities(partnerTicket.scheduleId, 'destination')
          );

          const partnerDateTimePromises = response.data.partnerTickets.map((partnerTicket) =>
            fetchFlightDetails(partnerTicket.scheduleId)
          );

          Promise.all(partnerSourceCityPromises).then((cities) => setPartnerSourceCities(cities));
          Promise.all(partnerDestinationCityPromises).then((cities) => setPartnerDestinationCities(cities));
          Promise.all(partnerDateTimePromises).then((dateTimes) => {
            const flightDates = dateTimes.map((dateTime) => dateTime.split(' ')[0]);
            const flightTimes = dateTimes.map((dateTime) => dateTime.split(' ')[1]);
            setPartnerFlightDates(flightDates);
            setPartnerFlightTimes(flightTimes);
          });
        }
      } catch (error) {
        console.log('Error fetching booking details:', error);
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
      const scheduleResponse = await axiosInstance.get(
        `FlightSchedules/${scheduleId}`
      );

      const airportId = type === 'source' ? scheduleResponse.data.sourceAirportId : scheduleResponse.data.destinationAirportId;

      const airportResponse = await axiosInstance.get(
        `Airports/${airportId}`
      );

      return airportResponse.data.city;
    } catch (error) {
      console.log('Error fetching airport details:', error);
      return '';
    }
  };

  const fetchFlightDetails = async (scheduleId) => {
    try {
      //        `https://localhost:7285/api/FlightSchedules/${scheduleId}`

      const scheduleResponse = await axiosInstance.get(
        `FlightSchedules/${scheduleId}`
      );
      return scheduleResponse.data.dateTime;
    } catch (error) {
      console.log('Error fetching flight details:', error);
      return '';
    }
  };

  const downloadTickets = () => {
    const pdf = new jsPDF();

    const addBoardingPass = (ticket, source, destination, flightDate, flightTime, isPartnerTicket = false) => {
      const offsetY = isPartnerTicket ? 70 : 0;
      const fontSize = isPartnerTicket ? 10 : 12;

      pdf.setFont('Arial', 'normal');
      pdf.setFontSize(fontSize);

      pdf.setDrawColor(0);
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(10, 5 + offsetY, 190, 115, 3, 3, 'FD');

      pdf.text('Boarding Pass', 20, 15 + offsetY);
      pdf.text(`Ticket No: ${ticket.ticketNo}`, 20, 25 + offsetY);
      pdf.text(`Seat No: ${ticket.seatNo}`, 20, 35 + offsetY);
      pdf.text(`Name: ${ticket.name}`, 20, 45 + offsetY);
      pdf.text(`Age: ${ticket.age}`, 20, 55 + offsetY);
      pdf.text(`Gender: ${ticket.gender}`, 20, 65 + offsetY);
      pdf.text(`Source: ${source}`, 20, 75 + offsetY);
      pdf.text(`Destination: ${destination}`, 20, 85 + offsetY);
      pdf.text(`Flight Date: ${flightDate}`, 20, 95 + offsetY);
      pdf.text(`Flight Time: ${flightTime}`, 20, 105 + offsetY);

      pdf.setLineWidth(0.5);
      pdf.line(20, 115 + offsetY, 190, 115 + offsetY);
    };

    if (bookingDetails) {
      // Add boarding pass for each main ticket
      bookingDetails.tickets.forEach((ticket, index) => {
        const source = sourceCities[index] || 'N/A';
        const destination = destinationCities[index] || 'N/A';
        const flightDate = flightDates[index] || 'N/A';
        const flightTime = flightTimes[index] || 'N/A';
        addBoardingPass(ticket, source, destination, flightDate, flightTime);
        pdf.addPage();
      });

      // Check if partnerTickets exist and add boarding pass for each partner ticket
      if (bookingDetails.partnerTickets && bookingDetails.partnerTickets.length > 0) {
        pdf.addPage();
        bookingDetails.partnerTickets.forEach((partnerTicket, index) => {
          const source = partnerSourceCities[index] || 'N/A';
          const destination = partnerDestinationCities[index] || 'N/A';
          const flightDate = partnerFlightDates[index] || 'N/A';
          const flightTime = partnerFlightTimes[index] || 'N/A';
          addBoardingPass(partnerTicket, source, destination, flightDate, flightTime, true);
          pdf.addPage();
        });
      }

      pdf.save('tickets.pdf');
    }
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
