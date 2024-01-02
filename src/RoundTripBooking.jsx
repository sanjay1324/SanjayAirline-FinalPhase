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
import Navbar from './Navbar';

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

  const handlePassengerChanges = (index, field, value) => {
    setPassengers((prevPassengers) => {
      const updatedPassengers = [...prevPassengers];
  
      if (field === 'name') {
        // Validate the name as a string
        if (/^[a-zA-Z]*$/.test(value)) {
          updatedPassengers[index] = { ...updatedPassengers[index], [field]: value };
        } else {
          // Optionally, handle invalid name input (e.g., show an error message).
        }
      } else if (field === 'age') {
        // Validate the age as a number not exceeding 200
        const ageValue = parseInt(value, 10); // Parse the value as an integer
        if (!isNaN(ageValue) && ageValue >= 0 && ageValue <= 200) {
          updatedPassengers[index] = { ...updatedPassengers[index], [field]: ageValue };
        } else {
          // Optionally, handle invalid age input (e.g., show an error message).
        }
      } else if (field === 'gender') {
        updatedPassengers[index][field] = value;
      }
  
      return updatedPassengers;
    });
  };

  const handleReturnPassengerChanges = (index, field, value) => {
    setPassengers((prevPassengers) => {
      const updatedPassengers = [...prevPassengers];
  
      if (field === 'name') {
        // Validate the name as a string
        if (/^[a-zA-Z]*$/.test(value)) {
          updatedPassengers[index] = { ...updatedPassengers[index], [field]: value };
        } else {
          // Optionally, handle invalid name input (e.g., show an error message).
        }
      } else if (field === 'age') {
        // Validate the age as a number not exceeding 200
        const ageValue = parseInt(value, 10); // Parse the value as an integer
        if (!isNaN(ageValue) && ageValue >= 0 && ageValue <= 200) {
          updatedPassengers[index] = { ...updatedPassengers[index], [field]: ageValue };
        } else {
          // Optionally, handle invalid age input (e.g., show an error message).
        }
      } else if (field === 'gender') {
        updatedPassengers[index][field] = value;
      }
  
      return updatedPassengers;
    });
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

      console.log(isRoundTripSelected)

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
      console.log("else")
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
      <Navbar/>
      <Card>
        <CardContent>
          <Typography variant="h5" component="div">
            Booking Form
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
                {passengers.map((passenger, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <TextField
                        type="text"
                        value={passenger.name}
                        onChange={(e) => handlePassengerChanges(index, 'name', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="text"
                        value={passenger.age}
                        onChange={(e) => handlePassengerChanges(index, 'age', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <FormControl>
                        <Select
                          value={passenger.gender}
                          onChange={(e) => handlePassengerChanges(index, 'gender', e.target.value)}
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
                              handleReturnPassengerChanges(index, 'name', e.target.value)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="text"
                            value={returnPassenger.age}
                            onChange={(e) =>
                              handleReturnPassengerChanges(index, 'age', e.target.value)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <FormControl>
                            <Select
                              value={returnPassenger.gender}
                              onChange={(e) =>
                                handleReturnPassengerChanges(index, 'gender', e.target.value)
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

          <Button variant="contained" color="primary" onClick={handleAddPassenger} style={{margin:20}}>
            Add Passenger
          </Button>

          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Continue to Seat Booking
          </Button>

          
        </CardContent>

        <FormControlLabel
            control={<Checkbox checked={isRoundTrip} onChange={() => setIsRoundTrip(!isRoundTrip)} />}
            label="Not Same Passenger for Return means click here to enter passenger details"
          />
      </Card>
     
    </Container>
  );
};

export default Booking;