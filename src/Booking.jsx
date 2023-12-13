import React, { useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

const Booking = () => {
  const navigate = useNavigate();
  const [bookingType, setBookingType] = useState('Single Trip');
  const [passengers, setPassengers] = useState([{ name: '', age: '', gender: '' }]);
  const [ticketCount, setTicketCount] = useState(1); // Initialize with one ticket
  const MAX_TICKETS = 5;

  const handleBookingTypeChange = (e) => {
    setBookingType(e.target.value);
  };

  const handleAddPassenger = () => {
    if (passengers.length < MAX_TICKETS && ticketCount < MAX_TICKETS) {
      setPassengers([...passengers, { name: '', age: '', gender: '' }]);
      setTicketCount(ticketCount + 1);
    }
  };

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
    // Store passenger details in Cookies
    const flightTickets = passengers.map((passenger) => ({
      bookingId:'',
      scheduleId: sessionStorage.getItem('scheduleId'), // You may need to set the correct scheduleId here
      name: passenger.name,
      age: passenger.age, // Assuming age is a number
      gender: passenger.gender,
      seatNo: null, // You may need to set the correct seatNo here
    }));

    Cookies.set('flightTickets', JSON.stringify(flightTickets));

    // Perform any necessary actions before navigating to the seat booking page
    // For now, just navigate to the seat booking page with passengers data
    sessionStorage.setItem('bookingType', bookingType);

    navigate('/seats', { state: { bookingType } });
  };

  return (
    <Container className="mt-5">
      <Row>
        <Col>
          <Card>
            <Card.Body>
              <Card.Title>Booking Form</Card.Title>
              <Card.Text>No. of Tickets: {ticketCount}</Card.Text>

              <Paper elevation={3} style={{ padding: '20px' }}>
                <Typography variant="h6">Passenger Details</Typography>

                {passengers.map((passenger, index) => (
                  <div key={index} style={{ marginBottom: '20px' }}>
                    <Typography variant="subtitle1">Passenger {index + 1}</Typography>
                    <div style={{ display: 'flex', marginBottom: '10px' }}>
  <div style={{ marginRight: '10px', flexGrow: 1 }}>
    <Typography>Name:</Typography>
    <input
      type="text"
      value={passenger.name}
      onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
      style={{ width: '100%' }}
    />
  </div>
  <div style={{ marginRight: '10px', flexGrow: 1 }}>
    <Typography>Age:</Typography>
    <input
      type="text"
      value={passenger.age}
      onChange={(e) => handlePassengerChange(index, 'age', e.target.value)}
      style={{ width: '100%' }}
    />
  </div>
  <div style={{ marginRight: '10px', flexGrow: 1 }}>
    <Typography>Gender:</Typography>
    <select
      value={passenger.gender}
      onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
      style={{ width: '100%' }}
    >
      <option value="Male">Male</option>
      <option value="Female">Female</option>
      <option value="Other">Other</option>
    </select>
  </div>
  <Button
    variant="danger"
    style={{ height: '40px', width: '150px', marginTop: '15px', marginLeft: '10px' }}
    onClick={() => handleDeletePassenger(index)}
  >
    Delete Passenger
  </Button>
</div>

                  </div>
                ))}

                <Button variant="primary" onClick={handleAddPassenger}>
                  Add Passenger
                </Button>

                <Button variant="success" onClick={handleSubmit}>
                  Continue to Seat Booking
                </Button>
              </Paper>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Booking;
