import React, { useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Navbar from './Navbar'
const Booking = () => {
  const navigate = useNavigate();
  const [bookingType, setBookingType] = useState('Single Trip');
  const [passengers, setPassengers] = useState([{ name: '', age: '', gender: '' }]);
  const [ticketCount, setTicketCount] = useState(1); // Initialize with one ticket
  const MAX_TICKETS = 5;



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
    // Check if both scheduleId and destinationScheduleId are present
    if (scheduleId && destinationScheduleId) {
      // Connecting flights logic
      const scheduleIdPassengers = [];
      const destinationScheduleIdPassengers = [];
      passengers.forEach((passenger) => {
        const passengerDetails = {
          bookingId: '',
          name: passenger.name,
          age: passenger.age,
          gender: passenger.gender,
          seatNo: null,
        };

        // Store passenger details separately for scheduleId and destinationScheduleId
        scheduleIdPassengers.push({ ...passengerDetails, scheduleId });
        destinationScheduleIdPassengers.push({ ...passengerDetails, scheduleId: destinationScheduleId });
      });

      Cookies.set('scheduleIdPassengers', JSON.stringify(scheduleIdPassengers));
      Cookies.set('destinationScheduleIdPassengers', JSON.stringify(destinationScheduleIdPassengers));


      navigate('/connecting-flight-seat', { state: { bookingType } }); 
    } else {
      // Single flight logic
      const flightTickets = passengers.map((passenger) => ({
        bookingId: '',
        scheduleId,
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
      <Navbar />
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
    </>
  );
};

export default Booking;
