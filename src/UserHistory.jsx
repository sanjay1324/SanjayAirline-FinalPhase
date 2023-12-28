import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';
import { IdentificationBadge } from 'phosphor-react';
import Navbar from './Navbar';
import axiosInstance from './AxiosInstance';

const UserHistory = () => {
  const [bookingHistory, setBookingHistory] = useState([]);
  const userId = sessionStorage.getItem('userId');

  useEffect(() => {
    if (userId) {
      fetchBookingHistory(userId);
    }
  }, [userId]);

  // const fetchBookingHistory = async (userId) => {
  //   try {
  //     const response = await axios.get(`https://localhost:7285/api/Bookings/user/${userId}`);
  //     console.log(response.data)
  //     const bookingsWithDetails = await Promise.all(
  //       response.data.map(async (booking) => {
  //         // Fetch additional information for each booking
  //         const scheduleId = booking.tickets[0].scheduleId;
  //         const scheduleResponse = await axios.get(`https://localhost:7285/api/FlightSchedules/${scheduleId}`);
          
  //         const sourceId = scheduleResponse.data.sourceAirportId;
  //         const destinationId = scheduleResponse.data.destinationAirportId;


  //         const sourceCityResponse = await axios.get(`https://localhost:7285/api/Airports/${sourceId}`);
  //         const destinationCityResponse = await axios.get(`https://localhost:7285/api/Airports/${destinationId}`);

  //         const sourceCity = sourceCityResponse.data.city;
  //         const destinationCity = destinationCityResponse.data.city;



  //         return {
  //           booking,
  //           sourceCity,
  //           destinationCity,
  //         };
  //       })
  //     );

  //     setBookingHistory(bookingsWithDetails);
  //     console.log(response.data)
  //   } catch (error) {
  //     console.error('Error fetching booking history:', error);
  //   }
  // };
 
  const fetchBookingHistory = async (userId) => {
    try {
      const response = await axiosInstance.get(`Bookings/user/${userId}`);
      console.log(response.data);
  
      const bookingsWithDetails = await Promise.all(
        response.data.map(async (booking) => {
          let scheduleId = null;
  
          // Try to find a valid scheduleId in the current booking
          for (const ticket of booking.tickets || []) {
            if (ticket.scheduleId) {
              scheduleId = ticket.scheduleId;
              break;
            }
          }
  
          if (!scheduleId) {
            console.error('No valid scheduleId found for booking:', booking);
            return null;
          }
  
          try {
            const scheduleResponse = await axiosInstance.get(`FlightSchedules/${scheduleId}`);
  
            const sourceId = scheduleResponse.data.sourceAirportId;
            const destinationId = scheduleResponse.data.destinationAirportId;
  
            const sourceCityResponse = await axiosInstance.get(`Airports/${sourceId}`);
            const destinationCityResponse = await axiosInstance.get(`Airports/${destinationId}`);
  
            const sourceCity = sourceCityResponse.data.city;
            const destinationCity = destinationCityResponse.data.city;
  
            return {
              booking,
              sourceCity,
              destinationCity,
            };
          } catch (error) {
            console.error('Error fetching additional details for a booking:', error);
            return null; // Handle the error by returning null for this specific booking
          }
        })
      );
  
      // Filter out null values (bookings with errors) before setting the state
      setBookingHistory(bookingsWithDetails.filter((booking) => booking !== null));
    } catch (error) {
      console.error('Error fetching booking history:', error);
    }
  };
  
  return (
    <Container style={{marginTop:100}}>
      <Navbar/>
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
                <TableCell>Source City</TableCell>
                <TableCell>Destination City</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookingHistory.map((bookingDetails) => (
                <TableRow key={bookingDetails.booking.booking.bookingId}>
                  <TableCell>{bookingDetails.booking.booking.bookingId}</TableCell>
                  <TableCell>{bookingDetails.booking.booking.status}</TableCell>
                  <TableCell>{bookingDetails.booking.booking.bookingType}</TableCell>
                  <TableCell>{bookingDetails.booking.tickets ? bookingDetails.booking.tickets.length : 0}</TableCell>
                  
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
