// TableComponent.jsx
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const TableComponent = ({ flightSchedules, formatFlightDuration, formatDate, formatTime }) => {
  const navigate = useNavigate();

  const handleBooking = (scheduleId) => {
    const bookingType = sessionStorage.getItem('bookingType');
    sessionStorage.setItem('scheduleId',scheduleId)
      // Navigate to different pages based on bookingType
      if (bookingType === 'SingleTrip') {
        navigate('/booking');
    } else if (bookingType === 'RoundTrip') {
        navigate('/round-trip-booking');
      }
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Flight Name</TableCell>
            <TableCell>Source Airport</TableCell>
            <TableCell>Destination Airport</TableCell>
            <TableCell>Flight Duration</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Time</TableCell>
            <TableCell>Actions</TableCell>
            {/* Add other table headers if needed */}
          </TableRow>
        </TableHead>
        <TableBody>
          {flightSchedules.map((schedule) => (
            <TableRow key={schedule.scheduleId}>
              <TableCell>{schedule.flightName}</TableCell>
              <TableCell>{schedule.sourceAirportId}</TableCell>
              <TableCell>{schedule.destinationAirportId}</TableCell>
              <TableCell>{formatFlightDuration(schedule.flightDuration)}</TableCell>
              <TableCell>{formatDate(schedule.dateTime)}</TableCell>
              <TableCell>{formatTime(schedule.dateTime)}</TableCell>
              <TableCell>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleBooking(schedule.scheduleId)}
                >
                  Book
                </Button>
              </TableCell>
              {/* Add other table cells if needed */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TableComponent;
