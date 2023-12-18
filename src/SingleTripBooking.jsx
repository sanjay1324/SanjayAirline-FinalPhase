import React, { useState } from 'react';
import {
  Container,
  Card,
  Button,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@material-ui/core';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import Paper from '@mui/material/Paper';
import Navbar from './Navbar'

import 'bootstrap/dist/css/bootstrap.min.css';

const Booking = () => {
  const navigate = useNavigate();
  const [bookingType, setBookingType] = useState('Single Trip');
  const [passengers, setPassengers] = useState([{ name: '', age: '', gender: '' }]);
  const [ticketCount, setTicketCount] = useState(1); // Initialize with one ticket
  const MAX_TICKETS = 5;

  const firstAirlineName = sessionStorage.getItem('firstFlightAirlineName');
  const secondAirlineName = sessionStorage.getItem('secondFlightAirlineName');
  const source = sessionStorage.getItem('sourceAirportId');
  const destination = sessionStorage.getItem('destinationAiportId');
  const flightName = sessionStorage.getItem('flightName');
  const dateTime = sessionStorage.getItem('dateTime');


  console.log(firstAirlineName,secondAirlineName)


  const handleAddPassenger = () => {
    if (passengers.length < MAX_TICKETS && ticketCount < MAX_TICKETS) {
      setPassengers([...passengers, { name: '', age: '', gender: '' }]);
      setTicketCount(ticketCount + 1);
    }
  };
  sessionStorage.setItem('ticketCount',ticketCount);

  const handleDeletePassenger = (index) => {
    const updatedPassengers = [...passengers];
    updatedPassengers.splice(index, 1);
    setPassengers(updatedPassengers);
    setTicketCount(ticketCount - 1);
  };

  const handlePassengerChange = (index, field, value) => {
    const updatedPassengers = [...passengers];
    updatedPassengers[index][field] = value;
    setPassengers(updatedPassengers);
  };

  const handleSubmit = () => {
    const scheduleId = sessionStorage.getItem('scheduleId');
    const destinationScheduleId = sessionStorage.getItem('desinationScheduleId');

    console.log(scheduleId)
    console.log(scheduleId!=null && destinationScheduleId !=null)
    // Check if both scheduleId and destinationScheduleId are present
    if (scheduleId!='null' && destinationScheduleId !='null') {
      // Connecting flights logic
      const scheduleIdPassengers = [];
      const destinationScheduleIdPassengers = [];
      passengers.forEach((passenger) => {
        const passengerDetails = {
          name: passenger.name,
          age: passenger.age,
          gender: passenger.gender,
          seatNo: null,
        };

        // Store passenger details separately for scheduleId and destinationScheduleId
        scheduleIdPassengers.push({ ...passengerDetails, scheduleId});
        destinationScheduleIdPassengers.push({ ...passengerDetails, airlineName:secondAirlineName,flightName:flightName,sourceAirportId:source,destinationAirportId:destination,dateTime:dateTime });
      });

      Cookies.set('scheduleIdPassengers', JSON.stringify(scheduleIdPassengers));
      Cookies.set('destinationScheduleIdPassengers', JSON.stringify(destinationScheduleIdPassengers));


      navigate('/connecting-flight-seat', { state: { bookingType } }); 
    } else {
      // Single flight logic
      const flightTickets = passengers.map((passenger) => ({
        bookingId: '',
        scheduleId:destinationScheduleId,
        name: passenger.name,
        age: passenger.age,
        gender: passenger.gender,
        seatNo: null,
      }));

      Cookies.set('flightTickets', JSON.stringify(flightTickets));
      // Additional actions for single flights

      sessionStorage.setItem('bookingType', bookingType);
      sessionStorage.setItem('ticketCount', ticketCount);

      navigate('/seats', { state: { bookingType } });
    }
  };


  return (
    <>
    <Navbar/>
      <Container className="mt-5" style={{width:"100%"}} >
        <Card>
          <Card>
            <Typography variant="h5" component="div">
              Passenger Details
            </Typography>
            <Typography variant="body1" component="div">
              No. of Tickets: {ticketCount}
            </Typography>

            <Card elevation={3} style={{ padding: '20px' }}>
              <Typography variant="h6">Passenger Details</Typography>

              {passengers.map((passenger, index) => (
                <div key={index} style={{ marginBottom: '20px' }}>
                  <Typography variant="subtitle1">Passenger {index + 1}</Typography>
                  <div style={{ display: 'flex', marginBottom: '10px' }}>
                    <div style={{ marginRight: '10px', flexGrow: 1 }}>
                      <Typography>Name:</Typography>
                      <TextField
                        type="text"
                        value={passenger.name}
                        onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
                        fullWidth
                      />
                    </div>
                    <div style={{ marginRight: '10px', flexGrow: 1 }}>
                      <Typography>Age:</Typography>
                      <TextField
                        type="text"
                        value={passenger.age}
                        onChange={(e) => handlePassengerChange(index, 'age', e.target.value)}
                        fullWidth
                      />
                    </div>
                    <div style={{ marginRight: '10px', flexGrow: 1 }}>
                      <Typography>Gender:</Typography>
                      <FormControl fullWidth>
                        <Select
                          value={passenger.gender}
                          onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                        >
                          <MenuItem value="Male">Male</MenuItem>
                          <MenuItem value="Female">Female</MenuItem>
                          <MenuItem value="Other">Other</MenuItem>
                        </Select>
                      </FormControl>
                    </div>
                    <Button
  variant="contained" color="primary" 
  style={{
    height: '50px',
    width: '150px',
    marginTop: '15px',
    marginLeft: '10px',
  }}
  onClick={() => handleDeletePassenger(index)}
>
  Delete Passenger
</Button>

                  </div>
                </div>
              ))}

              <Button variant="contained" color="primary" onClick={handleAddPassenger} style={{margin:10}}>
                Add Passenger
              </Button>

              <Button variant="contained" color="primary" onClick={handleSubmit}>
                Continue to Seat Booking
              </Button>
            </Card>
          </Card>
        </Card>
      </Container>
    </>
  );
};

export default Booking;
