import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  CircularProgress,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import 'react-datepicker/dist/react-datepicker.css';

import DatePicker from 'react-datepicker';
import axiosInstance from './AxiosInstance';
import TableComponent from './DisplayFlight';

const Navbar = () => {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [bookingType, setBookingType] = useState(''); // Initial value modified
  const [flightSchedules, setFlightSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleDropdownChange = (value) => {
    sessionStorage.setItem('bookingType',value);
    setBookingType(value);
  };

  const handleBooking = async () => {
    setLoading(true);

    try {
      const response = await axiosInstance.get('HomePage', {
        params: { source, destination, travelDate: selectedDate },
      });

      setFlightSchedules(response.data);

      // Encode and store bookingType in sessionStorage
      
      // Add more conditions for other booking types if needed
    } catch (error) {
      console.error('Error fetching flight schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFlightDuration = (duration) => {
    const hours = parseInt(duration.substring(0, 2));
    const minutes = parseInt(duration.substring(3, 5));
    return `${hours} hours ${minutes} minutes`;
  };

  const formatDate = (dateTime) => {
    const date = new Date(dateTime);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  };

  const formatTime = (dateTime) => {
    const date = new Date(dateTime);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <>
      <AppBar style={{marginTop:8,borderRadius:5}}position="relative">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Flight Scheduler
          </Typography>
          <FormControl>
            <InputLabel id="booking-type-label">Type of Booking</InputLabel>
            <Select
              labelId="booking-type-label"
              id="booking-type"
              value={bookingType}
              onChange={(e) => handleDropdownChange(e.target.value)}
            >
              <MenuItem value="SingleTrip">Single Trip</MenuItem>
              <MenuItem value="RoundTrip">Round Trip</MenuItem>
              {/* Add more booking types if needed */}
            </Select>
          </FormControl>
          <TextField
            label="Source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
          />
          <TextField
            label="Destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
          <DatePicker selected={selectedDate} onChange={handleDateChange} />
          <Button color="inherit" onClick={handleBooking}>
            Get Flights
          </Button>
        </Toolbar>
      </AppBar>

      <Paper elevation={3} style={{ marginTop: '20px', padding: '20px' }}>
        {loading ? (
          <CircularProgress />
        ) : flightSchedules.length > 0 ? (
          <TableComponent
            flightSchedules={flightSchedules}
            formatFlightDuration={formatFlightDuration}
            formatDate={formatDate}
            formatTime={formatTime}
          />
        ) : (
          <Typography>No flights available for the selected criteria.</Typography>
        )}
      </Paper>
    </>
  );
};

export default Navbar;
