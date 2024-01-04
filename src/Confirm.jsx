// Import necessary libraries
import React,{useEffect} from 'react';
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
import NavBar from './Navbar'
import GradientBackground from './GradientBackground';
const ConfirmationPage = () => {

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

  const handleConfirm = async () => {
    const combinedData = {
      booking: {
        bookingType: 'Oneway',
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
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
          },
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

          sessionStorage.setItem("isBooked",true);
          // Show success toast after a delay
          setTimeout(() => {
            navigate('/ticket');
          }, 3000); // Delay in milliseconds
        }
      }

      console.log('Booking, FlightTicket, and FlightSeat created successfully');

      Cookies.remove('scheduleIdPassengers');
      Cookies.remove('destinationScheduleIdPassengers');
      clearSessionStorage();

      
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

  const clearSessionStorage = () => {
    // Items to retain
    const retainItems = ['userId', 'token', 'Email', 'username', 'role','bookingId'];
  
    // Iterate through sessionStorage and remove items not in the retainItems list
    for (let key in sessionStorage) {
      if (!retainItems.includes(key)) {
        sessionStorage.removeItem(key);
      }
    }
  };

  const apiPath = sessionStorage.getItem('secondFlightApiPath');
  console.log(apiPath);
  const partnerScheduleId = sessionStorage.getItem('desinationScheduleId');




  const handleCancel = async () => {
     navigate('/connecting-flight-seat');
    //  await ChangeSeatStatus2(apiPath, partnerScheduleId, 'Available', seatNumber);

  };

  const ChangeSeatStatus2 = async (apiPath, scheduleId, status, seatNumbers) => {
    try {
      const axiosInstanceForApiPath = axios.create({
        baseURL: apiPath, // baseURL is the root URL of your API
      });
      const response = await axiosInstanceForApiPath.patch(
        `Integration/changeseatstatus/${scheduleId}/${status}`,
        JSON.stringify(seatNumbers),
        {
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`, // Get the token from localStorage

          },
        }
      );
      console.log(response);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };
  return (
    <GradientBackground  >
    <div>
      
      <NavBar/>
     


      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography variant="h4" component="h1" gutterBottom style={{marginTop:100}}>
        Confirmation Page
      </Typography>
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

      <Button variant="contained" onClick={handleCancel}>
        Cancel
      </Button>
    </div>
    </GradientBackground>

  );
};


export default ConfirmationPage;


