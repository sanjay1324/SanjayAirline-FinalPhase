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
  CardContent} from '@material-ui/core';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import Navbar from './Navbar'
import './css/homepage.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer, toast } from 'react-toastify';

const Booking = () => {
  const navigate = useNavigate();
  const [bookingType, setBookingType] = useState('Single Trip');
  const [passengers, setPassengers] = useState([{ name: '', age: '', gender: '' }]);
  const [ticketCount, setTicketCount] = useState(1); // Initialize with one ticket
  const MAX_TICKETS = 4;

  
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

  const handlePassengerChanges = (index, field, value) => {
    setPassengers((prevPassengers) => {
      const updatedPassengers = [...prevPassengers];
  
      if (field === 'name') {
        // Validate the name as a string
        if (/^[a-zA-Z\s]*$/.test(value)) {
          updatedPassengers[index] = { ...updatedPassengers[index], [field]: value };
        }else {
          // Optionally, handle invalid name input (e.g., show an error message).
        }
      } else if (field === 'age') {
        // Validate the age as a number not exceeding 200
        const ageValue = parseInt(value, 10); // Parse the value as an integer
        if (!isNaN(ageValue) && ageValue >= 0 && ageValue <= 150) {
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
  

  const handleSubmit = () => {
    const scheduleId = sessionStorage.getItem('scheduleId');
    const destinationScheduleId = sessionStorage.getItem('desinationScheduleId');
    const secondAirlineName = sessionStorage.getItem('secondFlightAirlineName');
    console.log(secondAirlineName)
    console.log(scheduleId)

    console.log(passengers.name)

    
    if (ticketCount <= 0) {
      toast.error('No Passenger is Added');
    } else {
      const isEmptyField = passengers.some(
        (passenger) => !passenger.name || !passenger.age || !passenger.gender
      );
    
      if (isEmptyField) {
        toast.error("All fields for all passengers are required");
      } else {
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
            if(secondAirlineName!==null){
              console.log(true)
              scheduleIdPassengers.push({ ...passengerDetails, scheduleId,ticketStatus:"Booked"});
              destinationScheduleIdPassengers.push({ ...passengerDetails, airlineName:secondAirlineName,flightName:flightName,sourceAirportId:source,destinationAirportId:destination,dateTime:dateTime });
            }else{
              scheduleIdPassengers.push({ ...passengerDetails, scheduleId});
    
              destinationScheduleIdPassengers.push({ ...passengerDetails, "scheduleId":destinationScheduleId});
              console.log(false)
            }
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
      }
    }

    // console.log(scheduleId!=null && destinationScheduleId !=null)
    // Check if both scheduleId and destinationScheduleId are present
    
  };
  const cardColor = ticketCount >= MAX_TICKETS ? 'red' : 'green';


  return (
    <>
          <div className='oneway-content'>

    <Navbar/>
    <ToastContainer></ToastContainer>
      <Container className="mt-5" style={{width:"600px"}} >
        <Card >
          <Card>
          <Card style={{ position: 'absolute', top: 0, right: 0, backgroundColor: cardColor }}>

      <CardContent>
        <Typography variant="h5" component="div">
          Passenger Details
        </Typography>
        <Typography variant="body1" component="div">
          No. of Tickets: {ticketCount}
        </Typography>
      </CardContent>
    </Card>

    <form  style={{ maxWidth: '600px', margin: 'auto' }}>
  <Card style={{ padding: '20px', marginBottom: '20px' }}>
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
              onChange={(e) => handlePassengerChanges(index, 'name', e.target.value)}
              fullWidth
            />
          </div>
          <div style={{ marginRight: '10px', flexGrow: 1 }}>
            <Typography>Age:</Typography>
            <TextField
              type="number"
              value={passenger.age}
              onChange={(e) => handlePassengerChanges(index, 'age', e.target.value)}
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
            variant="contained" 
            color="primary" 
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

    <Button variant="contained" color="primary" onClick={handleAddPassenger} style={{ marginBottom: '10px' }}>
      Add Passenger
    </Button>
  </Card>

  <Button type="submit" variant="contained" color="primary" style={{ width: '100%' }} onClick={handleSubmit}>
    Continue to Seat Booking
  </Button>
</form>

          </Card>
        </Card>
      </Container>
      </div>
    </>
  );
};

export default Booking;
