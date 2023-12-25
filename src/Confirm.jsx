// Import necessary libraries
import React from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axiosInstance from './AxiosInstance';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

const ConfirmationPage = () => {

    const navigate = useNavigate();

  const handleConfirm = async () => {
    const combinedData = {
      booking: {
        bookingType: 'Single',
        userId: sessionStorage.getItem('userId'),
        status: 'Booked',
      },
      flightTickets: [
        ...JSON.parse(Cookies.get('scheduleIdPassengers') || '[]'),
      ].filter((passenger) => passenger.seatNo !== null),
      connectionFlightTickets: [
        ...JSON.parse(Cookies.get('destinationScheduleIdPassengers') || '[]'),
      ].filter((passenger) => passenger.seatNo !== null),
    };

    console.log('Combined Data:', combinedData);

    try {
      const combinedResponse = await axiosInstance.post('HomePage/CreateBooking', combinedData);
      console.log('Combined Response:', combinedResponse);

      const partner = combinedResponse.data.message;
      console.log('Partner:', partner);

      const partnerBookings = combinedResponse.data.ticket;
      console.log(partnerBookings);
      console.log(partnerBookings[0].ticketNo);

      if (partner === 'Partner Booking') {
        const apiPath = sessionStorage.getItem('secondFlightApiPath');
        console.log('API Path:', apiPath);

        const axiosInstanceForApiPath = axios.create({
          baseURL: apiPath,
        });

        const Id = combinedResponse.data.booking.bookingId;
        console.log('Booking ID:', Id);

        const partnerBooking = combinedResponse.data.ticket;

        if (Array.isArray(partnerBooking) && partnerBooking.length > 0) {
          const transformedPassengers = partnerBooking.map((passenger) => ({
            name: passenger.name,
            age: passenger.age,
            gender: passenger.gender,
            seatNo: passenger.seatNo,
            airlineName: 'SanjayAirline',
            flightName: passenger.flightName,
            sourceAirportId: passenger.sourceAirportId,
            destinationAirportId: passenger.destinationAirportId,
            dateTime: passenger.dateTime,
            status: 'Booked',
            bookingId: Id,
            ticketNo: passenger.ticketNo,
          }));

          console.log('Transformed Passengers:', transformedPassengers);

          sessionStorage.setItem('bookingId', Id);

          const url = '/Integration/partnerbooking'; // Add a leading slash if needed
          const secondApiResponse = await axiosInstanceForApiPath.post(
            url,
            transformedPassengers
          );

          console.log('Second API Response:', secondApiResponse);

          toast.success('Booking Successful');

          // Show success toast after a delay
          setTimeout(() => {
            navigate('/ticket');
          }, 3000); // Delay in milliseconds
        }
      }

      console.log('Booking, FlightTicket, and FlightSeat created successfully');
    } catch (error) {
      console.log(error);
      console.error('Combined API Error:', error.response);
      // Handle error as needed
    }
  };

  // Retrieve data from cookies
  const scheduleIdPassengers = JSON.parse(Cookies.get('scheduleIdPassengers') || '[]');
  const destinationScheduleIdPassengers = JSON.parse(
    Cookies.get('destinationScheduleIdPassengers') || '[]'
  );

  return (
    <div className="confirmation-page">
      <Typography variant="h4" component="h1" gutterBottom>
        Confirmation Page
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" component="h2" gutterBottom>
Source to Connecting          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Age</TableCell>
                  <TableCell>Gender</TableCell>
                  <TableCell>Seat No</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {scheduleIdPassengers.map((passenger, index) => (
                  <TableRow key={index}>
                    <TableCell>{passenger.name}</TableCell>
                    <TableCell>{passenger.age}</TableCell>
                    <TableCell>{passenger.gender}</TableCell>
                    <TableCell>{passenger.seatNo}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            Connecting to Destination
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Age</TableCell>
                  <TableCell>Gender</TableCell>
                  <TableCell>Seat No</TableCell>
                  {/* Add more table headers as needed */}
                </TableRow>
              </TableHead>
              <TableBody>
                {destinationScheduleIdPassengers.map((passenger, index) => (
                  <TableRow key={index}>
                    <TableCell>{passenger.name}</TableCell>
                    <TableCell>{passenger.age}</TableCell>
                    <TableCell>{passenger.gender}</TableCell>
                    <TableCell>{passenger.seatNo}</TableCell>
                    {/* Add more table cells as needed */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      <Button variant="contained" onClick={handleConfirm}>
        Confirm Booking
      </Button>
    </div>
  );
};


export default ConfirmationPage;
