import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';
import { IdentificationBadge } from 'phosphor-react';

const UserHistory = () => {
  const [bookingHistory, setBookingHistory] = useState([]);
  const userId = sessionStorage.getItem('userId');

  useEffect(() => {
    if (userId) {
      fetchBookingHistory(userId);
    }
  }, [userId]);

  const fetchBookingHistory = async (userId) => {
    try {
      const response = await axios.get(`https://localhost:7285/api/Bookings/user/${userId}`);
      const bookingsWithDetails = await Promise.all(
        response.data.map(async (booking) => {
          // Fetch additional information for each booking
          const scheduleId = booking.tickets[0].scheduleId;
          console.log(scheduleId)
          const scheduleResponse = await axios.get(`https://localhost:7285/api/FlightSchedules/${scheduleId}`);
          
          const sourceId = scheduleResponse.data.sourceAirportId;
          const destinationId = scheduleResponse.data.destinationAirportId;

          console.log(sourceId)
          console.log(destinationId)

          const sourceCityResponse = await axios.get(`https://localhost:7285/api/Airports/${sourceId}`);
          const destinationCityResponse = await axios.get(`https://localhost:7285/api/Airports/${destinationId}`);

          console.log(sourceCityResponse)
console.log(destinationCityResponse)
          const sourceCity = sourceCityResponse.data.city;
          const destinationCity = destinationCityResponse.data.city;

          console.log(sourceCity)
          console.log(destinationCity)

          return {
            booking,
            sourceCity,
            destinationCity,
          };
        })
      );

      setBookingHistory(bookingsWithDetails);
    } catch (error) {
      console.error('Error fetching booking history:', error);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        <IdentificationBadge size={32} /> User Booking History
      </Typography>
      {bookingHistory.length === 0 ? (
        <Typography>No booking history found.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Booking ID</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Booking Type</TableCell>
                <TableCell>Ticket Count</TableCell>
                <TableCell>Canceled Bookings</TableCell>
                <TableCell>Source City</TableCell>
                <TableCell>Destination City</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookingHistory.map((bookingDetails) => (
                <TableRow key={bookingDetails.booking.bookingId}>
                  <TableCell>{bookingDetails.booking.bookingId}</TableCell>
                  <TableCell>{bookingDetails.booking.status}</TableCell>
                  <TableCell>{bookingDetails.booking.bookingType}</TableCell>
                  <TableCell>{bookingDetails.booking.tickets ? bookingDetails.booking.tickets.length : 0}</TableCell>
                  <TableCell>
                    {bookingDetails.booking.tickets && Array.isArray(bookingDetails.booking.tickets)
                      ? bookingDetails.booking.tickets.filter((ticket) => ticket.status === 'Cancelled').length
                      : 0
                    }
                  </TableCell>
                  <TableCell>{bookingDetails.sourceCity}</TableCell>
                  <TableCell>{bookingDetails.destinationCity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default UserHistory;
