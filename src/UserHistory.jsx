import React, { useState, useEffect } from 'react';
import axiosInstance from './AxiosInstance';
import {
  Container, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, CircularProgress, TablePagination, Select, MenuItem
} from '@material-ui/core';
import { IdentificationBadge } from 'phosphor-react';
import Navbar from './Navbar';
import GradientBackground from './GradientBackground';

const UserHistory = () => {
  const [bookingHistory, setBookingHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filter, setFilter] = useState('all');
  const userId = sessionStorage.getItem('userId');

  useEffect(() => {
    if (userId) {
      fetchBookingHistory(userId);
    }
  }, [userId, filter]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const fetchBookingHistory = async (userId) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`Bookings/user/${userId}`);
      const filteredData = filter === 'all' ? response.data : response.data.filter(booking => booking.status === filter);

      const bookingsWithDetails = await Promise.all(filteredData.map(async (booking) => {
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
          const flightDate = new Date(scheduleResponse.data.dateTime).toLocaleDateString();
          const flightTime = new Date(scheduleResponse.data.dateTime).toLocaleTimeString();
  

          return {
            booking,
            sourceCity,
            destinationCity,flightDate,
            flightTime,
          };
        } catch (error) {
          console.error('Error fetching additional details for a booking:', error);
          return null;
        }
      }));

      setBookingHistory(bookingsWithDetails.filter((booking) => booking !== null));
    } catch (error) {
      console.error('Error fetching booking history:', error);
    }
    setLoading(false);
  };

  return (
    <GradientBackground  >

    <Container style={{ marginTop: 100 }}>

      <Navbar />
      <Typography variant="h4" gutterBottom>
        <IdentificationBadge size={32} /> User Booking History
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : bookingHistory.length === 0 ? (
        <Typography>No booking history found.</Typography>
      ) : (
        <>
          {/* <Select
            value={filter}
            onChange={handleFilterChange}
            displayEmpty
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="booked">Booked</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select> */}

          <TableContainer >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Booking ID</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Booking Type</TableCell>
                  <TableCell>Ticket Count</TableCell>
                  <TableCell>Source City</TableCell>
                  <TableCell>Destination City</TableCell>
                  <TableCell>Flight Date</TableCell>
                  <TableCell>Flight Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookingHistory.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((bookingDetails) => (
                  <TableRow key={bookingDetails.booking.booking.bookingId}>
                    <TableCell>{bookingDetails.booking.booking.bookingId}</TableCell>
                    <TableCell>{bookingDetails.booking.booking.status}</TableCell>
                    <TableCell>{bookingDetails.booking.booking.bookingType}</TableCell>
                    <TableCell>{bookingDetails.booking.tickets ? bookingDetails.booking.tickets.length : 0}</TableCell>
                    <TableCell>{bookingDetails.sourceCity}</TableCell>
                    <TableCell>{bookingDetails.destinationCity}</TableCell>
                    <TableCell>{bookingDetails.flightDate}</TableCell>
                    <TableCell>{bookingDetails.flightTime}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
  component="div"
  count={bookingHistory.length}
  page={page}
  rowsPerPage={rowsPerPage}
  onPageChange={handleChangePage}
  onRowsPerPageChange={handleChangeRowsPerPage}
/>

        </>
      )}

    </Container>
    </GradientBackground  >


  );
};

export default UserHistory;
