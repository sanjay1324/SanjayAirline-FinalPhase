import React, { useState } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Button,Checkbox,
  FormControlLabel,
} from '@material-ui/core';
import { useNavigate } from 'react-router-dom';

import Cookies from 'js-cookie';

const Booking = () => {
  const navigate = useNavigate();
  const [bookingType, setBookingType] = useState('SingleTrip');
  const [passengers, setPassengers] = useState([{ name: '', age: '', gender: '' }]);
  const [returnPassengers, setReturnPassengers] = useState([{ name: '', age: '', gender: '' }]);
  const [ticketCount, setTicketCount] = useState(1); // Initialize with one ticket
  const [isRoundTripSelected, setIsRoundTripSelected] = useState(false);
  const [selectedReturnScheduleId, setSelectedReturnScheduleId] = useState(null);
  const MAX_TICKETS = 5;
  const [isRoundTrip, setIsRoundTrip] = useState(false);
  const [startDate, setStartDate] = useState(new Date());




  const handleAddPassenger = () => {
    if (passengers.length < MAX_TICKETS && ticketCount < MAX_TICKETS) {
      setPassengers([...passengers, { name: '', age: '', gender: '' }]);
      setTicketCount(ticketCount + 1);
    }
  };

  const handleAddReturnPassenger = () => {
    setReturnPassengers([...returnPassengers, { name: '', age: '', gender: '' }]);
  };

  const handleDeletePassenger = (index) => {
    const updatedPassengers = [...passengers];
    updatedPassengers.splice(index, 1);
    setPassengers(updatedPassengers);
    setTicketCount(ticketCount - 1);
  };

  const handleDeleteReturnPassenger = (index) => {
    const updatedReturnPassengers = [...returnPassengers];
    updatedReturnPassengers.splice(index, 1);
    setReturnPassengers(updatedReturnPassengers);
  };

  const handlePassengerChange = (index, field, value) => {
    const updatedPassengers = [...passengers];
    updatedPassengers[index][field] = value;
    setPassengers(updatedPassengers);
  };

  const handleReturnPassengerChange = (index, field, value) => {
    const updatedReturnPassengers = [...returnPassengers];
    updatedReturnPassengers[index][field] = value;
    setReturnPassengers(updatedReturnPassengers);
  };

  const handleReturnDateChange = (e) => {
    setReturnDate(e.target.value);
  };

  const handleSelectReturnSchedule = (scheduleId) => {
    setSelectedReturnScheduleId(scheduleId);
  };

  const handleSubmit = () => {
    // Store passenger details in Cookies
    
    if (isRoundTripSelected) {

      const singleJourneyTickets = passengers.map((passenger) => ({
            bookingId: '',
            scheduleId: sessionStorage.getItem('scheduleId'),
            name: passenger.name,
            age: passenger.age,
            gender: passenger.gender,
            seatNo: null,
          }));
          
      const returnFlightTickets = returnPassengers.map((passenger) => ({
        bookingId: '',
        scheduleId: selectedReturnScheduleId,
        name: passenger.name,
        age: passenger.age,
        gender: passenger.gender,
        seatNo: null,
      }));
  
      Cookies.set('returnFlightTickets', JSON.stringify(returnFlightTickets));
      Cookies.set('singleFlightTickets', JSON.stringify(singleFlightTickets));

    }else{
        const singleJourneyTickets = passengers.map((passenger) => ({
            bookingId: '',
            scheduleId: sessionStorage.getItem('desinationScheduleId'),
            name: passenger.name,
            age: passenger.age,
            gender: passenger.gender,
            seatNo: null,
          }));
      
          const returnJourneyTickets = passengers.map((passenger) => ({
              bookingId: '',
              scheduleId: sessionStorage.getItem('returnScheduleId'),
              name: passenger.name,
              age: passenger.age,
              gender: passenger.gender,
              seatNo: null,
            }));
          
        
          Cookies.set('singleJourneyTickets', JSON.stringify(singleJourneyTickets));
        
          Cookies.set('returnJourneyTickets', JSON.stringify(returnJourneyTickets));
    }
  
    // If the checkbox is clicked, save details two times in Cookies
    
  
    // Perform any necessary actions before navigating to the seat booking page
    // For now, just navigate to the seat booking page with passengers data
    navigate('/round-trip-seat-booking', { state: { bookingType, isRoundTripSelected } });
  };
  
  return (
    <Container className="mt-5">
      <Card>
        <CardContent>
          <Typography variant="h5" component="div">
            Booking Form
          </Typography>

          <FormControlLabel
            control={<Checkbox checked={isRoundTrip} onChange={() => setIsRoundTrip(!isRoundTrip)} />}
            label="Round Trip"
          />

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Age</TableCell>
                  <TableCell>Gender</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {passengers.map((passenger, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <TextField
                        type="text"
                        value={passenger.name}
                        onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="text"
                        value={passenger.age}
                        onChange={(e) => handlePassengerChange(index, 'age', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <FormControl>
                        <Select
                          value={passenger.gender}
                          onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                        >
                          <MenuItem value="Male">Male</MenuItem>
                          <MenuItem value="Female">Female</MenuItem>
                          <MenuItem value="Other">Other</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => handleDeletePassenger(index)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {isRoundTrip && (
            <>
              <Typography variant="h6" component="div">
                Return Trip Details
              </Typography>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>#</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Age</TableCell>
                      <TableCell>Gender</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {returnPassengers.map((returnPassenger, index) => (
                      <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <TextField
                            type="text"
                            value={returnPassenger.name}
                            onChange={(e) =>
                              handleReturnPassengerChange(index, 'name', e.target.value)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="text"
                            value={returnPassenger.age}
                            onChange={(e) =>
                              handleReturnPassengerChange(index, 'age', e.target.value)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <FormControl>
                            <Select
                              value={returnPassenger.gender}
                              onChange={(e) =>
                                handleReturnPassengerChange(index, 'gender', e.target.value)
                              }
                            >
                              <MenuItem value="Male">Male</MenuItem>
                              <MenuItem value="Female">Female</MenuItem>
                              <MenuItem value="Other">Other</MenuItem>
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() => handleDeleteReturnPassenger(index)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Button variant="contained" color="primary" onClick={handleAddReturnPassenger}>
                Add Return Passenger
              </Button>
            </>
          )}

          <Button variant="contained" color="primary" onClick={handleAddPassenger}>
            Add Passenger
          </Button>

          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Continue to Seat Booking
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Booking;