import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const Booking = () => {
  const navigate = useNavigate();
  const [bookingType, setBookingType] = useState('SingleTrip');
  const [passengers, setPassengers] = useState([{ name: '', age: '', gender: '' }]);
  const [returnPassengers, setReturnPassengers] = useState([{ name: '', age: '', gender: '' }]);
  const [ticketCount, setTicketCount] = useState(1); // Initialize with one ticket
  const [isRoundTripSelected, setIsRoundTripSelected] = useState(false);
  const MAX_TICKETS = 5;

  const handleBookingTypeChange = (e) => {
    setBookingType(e.target.value);
    setIsRoundTripSelected(e.target.value === 'RoundTrip');
  };

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

  const handleSubmit = () => {
    // Store passenger details in Cookies
    const flightTickets = passengers.map((passenger) => ({
      bookingId: '',
      scheduleId: sessionStorage.getItem('scheduleId'), // You may need to set the correct scheduleId here
      name: passenger.name,
      age: passenger.age, // Assuming age is a number
      gender: passenger.gender,
      seatNo: null, // You may need to set the correct seatNo here
    }));

    if (isRoundTripSelected) {
      const returnFlightTickets = returnPassengers.map((returnPassenger) => ({
        bookingId: '',
        scheduleId: sessionStorage.getItem('returnScheduleId'), // You may need to set the correct returnScheduleId here
        name: returnPassenger.name,
        age: returnPassenger.age,
        gender: returnPassenger.gender,
        seatNo: null,
      }));

      Cookies.set('returnFlightTickets', JSON.stringify(returnFlightTickets));
    }

    Cookies.set('flightTickets', JSON.stringify(flightTickets));

    // Perform any necessary actions before navigating to the seat booking page
    // For now, just navigate to the seat booking page with passengers data
    sessionStorage.setItem('bookingType', bookingType);

    navigate('/seats', { state: { bookingType, isRoundTripSelected } });
  };

  return (
    <Container className="mt-5">
      <Row>
        <Col>
          <Card>
            <Card.Body>
              <Card.Title>Booking Form</Card.Title>
              <Card.Text>No. of Tickets: {ticketCount}</Card.Text>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Booking Type</Form.Label>
                  <Form.Select value={bookingType} onChange={handleBookingTypeChange}>
                    <option value="RoundTrip">Round Trip</option>
                    <option value="SingleTrip">Single Trip</option>
                  </Form.Select>
                </Form.Group>

                {passengers.map((passenger, index) => (
                  <div key={index}>
                    <Form.Group className="mb-3">
                      <Form.Label>Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={passenger.name}
                        onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Age</Form.Label>
                      <Form.Control
                        type="text"
                        value={passenger.age}
                        onChange={(e) => handlePassengerChange(index, 'age', e.target.value)}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Gender</Form.Label>
                      <Form.Control
                        as="select"
                        value={passenger.gender}
                        onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </Form.Control>
                    </Form.Group>

                    <Button variant="danger" onClick={() => handleDeletePassenger(index)}>
                      Delete Passenger
                    </Button>
                  </div>
                ))}

                {isRoundTripSelected && (
                  <>
                    <Card.Title className="mt-3">Return Trip Passenger Details</Card.Title>
                    {returnPassengers.map((returnPassenger, index) => (
                      <div key={index}>
                        <Form.Group className="mb-3">
                          <Form.Label>Name</Form.Label>
                          <Form.Control
                            type="text"
                            value={returnPassenger.name}
                            onChange={(e) =>
                              handleReturnPassengerChange(index, 'name', e.target.value)
                            }
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>Age</Form.Label>
                          <Form.Control
                            type="text"
                            value={returnPassenger.age}
                            onChange={(e) =>
                              handleReturnPassengerChange(index, 'age', e.target.value)
                            }
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>Gender</Form.Label>
                          <Form.Control
                            as="select"
                            value={returnPassenger.gender}
                            onChange={(e) =>
                              handleReturnPassengerChange(index, 'gender', e.target.value)
                            }
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </Form.Control>
                        </Form.Group>

                        <Button
                          variant="danger"
                          onClick={() => handleDeleteReturnPassenger(index)}
                        >
                          Delete Return Passenger
                        </Button>
                      </div>
                    ))}
                    <Button variant="primary" onClick={handleAddReturnPassenger}>
                      Add Return Passenger
                    </Button>
                  </>
                )}

                <Button variant="primary" onClick={handleAddPassenger}>
                  Add Passenger
                </Button>

                <Button variant="success" onClick={handleSubmit}>
                  Continue to Seat Booking
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Booking;
