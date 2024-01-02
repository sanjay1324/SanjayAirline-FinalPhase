// src/App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TextField,
  Button,
  Box,
  Pagination,
} from '@mui/material';
import './App.css';
import Navbar from './Navbar'
const BookingTable = ({ bookings }) => (
  <TableContainer>
    <Navbar/>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Ticket No</TableCell>
          <TableCell>Airline</TableCell>
          <TableCell>Flight</TableCell>
          <TableCell>Source Airport</TableCell>
          <TableCell>Destination Airport</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Seat No</TableCell>
          <TableCell>Name</TableCell>
          <TableCell>Age</TableCell>
          <TableCell>Gender</TableCell>
          <TableCell>Date and Time</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {bookings.map((booking) => (
          <TableRow key={booking.ticketNo}>
            <TableCell>{booking.ticketNo}</TableCell>
            <TableCell>{booking.airlineName}</TableCell>
            <TableCell>{booking.flightName}</TableCell>
            <TableCell>{booking.sourceAirportId}</TableCell>
            <TableCell>{booking.destinationAirportId}</TableCell>
            <TableCell>{booking.status}</TableCell>
            <TableCell>{booking.seatNo}</TableCell>
            <TableCell>{booking.name}</TableCell>
            <TableCell>{booking.age}</TableCell>
            <TableCell>{booking.gender}</TableCell>
            <TableCell>{new Date(booking.dateTime).toLocaleString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

const App = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [airlineFilter, setAirlineFilter] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://192.168.10.54:88/api/PartnerBookings');
        setBookings(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const filtered = bookings.filter((booking) =>
      booking.airlineName.toLowerCase().includes(airlineFilter.toLowerCase())
    );
    setFilteredBookings(filtered);
    setPage(1);
  }, [airlineFilter, bookings]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <Container sx={{ mt: 3 }} style={{marginTop:80}}>
      <TextField
        label="Filter by Airline Name"
        variant="outlined"
        fullWidth
        value={airlineFilter}
        onChange={(e) => setAirlineFilter(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Typography variant="h2" gutterBottom>
        Flight Bookings
      </Typography>
      <BookingTable bookings={filteredBookings.slice((page - 1) * itemsPerPage, page * itemsPerPage)} />
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination
          count={Math.ceil(filteredBookings.length / itemsPerPage)}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
    </Container>
  );
};

export default App;
