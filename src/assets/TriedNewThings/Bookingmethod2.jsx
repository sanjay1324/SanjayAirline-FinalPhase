import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal } from 'react-bootstrap';
import { Armchair } from 'phosphor-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../AxiosInstance';

const BookingAndSeatBooking = () => {
  const navigate = useNavigate();

  const [showForm, setShowForm] = useState(true);
  const [bookingType, setBookingType] = useState('RoundTrip');
  const [passengers, setPassengers] = useState([{ name: '', age: '', gender: '' }]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [isConfirmed, setConfirmed] = useState(false);
  const [seatsData, setSeatsData] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([2, 5, 8]);
  const [showModal, setShowModal] = useState(false);
  const [passengerInfo, setPassengerInfo] = useState({
    name: passengers[0].name,
    age: passengers[0].age,
    gender: passengers[0].gender,
  });

  useEffect(() => {
    const fetchSeatsData = async () => {
      try {
        const YOUR_SCHEDULE_ID = 15;
        const response = await axiosInstance.get(`Seats/GetSeatsByScheduleId/${YOUR_SCHEDULE_ID}`);
        const seatsWithStatus = response.data.map(seat => {
          return {
            ...seat,
            status: isSeatBooked(seat.seatNumber) ? 'booked' : 'available',
          };
        });
        setSeatsData(seatsWithStatus);
      } catch (error) {
        console.error('Error fetching seats data:', error);
      }
    };

    fetchSeatsData();
  }, [selectedSeats]);

  const isSeatBooked = (seatNumber) => {
    return bookedSeats.includes(seatNumber);
  };

  const handleSeatClick = (seatNumber) => {
    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter((seat) => seat !== seatNumber));
    } else {
      setSelectedSeats([...selectedSeats, seatNumber]);
    }
  };

  const handleConfirm = async () => {
    let bookingId;
    const YOUR_SCHEDULE_ID = sessionStorage.getItem('scheduleId');
    console.log(YOUR_SCHEDULE_ID);
    if (selectedSeats.length === 0) {
      // Handle the case where no seat is selected
      console.error('No seat selected!');
      return;
    }const combinedData = {
      booking: {
        bookingType: bookingType,
        userId: sessionStorage.getItem('userId'),
        status: 'Booked'
      },
      flightTicket: {
        bookingId,
        scheduleId: YOUR_SCHEDULE_ID,
        seatNo: selectedSeats.join(', '), // Combine selected seats into a string
        name: passengerInfo.name,
        age: passengerInfo.age,
        gender: passengerInfo.gender,
      },
      flightSeat: {
        scheduleId: YOUR_SCHEDULE_ID,
        seatNumber: selectedSeats.join(', '), // Combine selected seats into a string
        status: 'Booked',
      },
    };
    const combinedResponse = await axiosInstance.post('Booking', combinedData);
    console.log('Combined Response:', combinedResponse.data);

    // Step 2: Post the combined data
    // Implement the axios post call here with combinedData

    // Perform actions based on the combined response if needed
    console.log('Booking, FlightTicket, and FlightSeat created successfully');

    // Set the confirmed state
    setConfirmed(true);
  };

  const renderSeats = () => {
    return seatsData.map((seat) => (
      <Button
        key={seat.seatNumber}
        variant={selectedSeats.includes(seat.seatNumber) ? 'success' : (seat.status === 'booked' ? 'secondary' : 'light')}
        onClick={() => handleSeatClick(seat.seatNumber)}
        className="m-2"
        disabled={seat.status === 'booked'}
      >
        <Armchair
          weight={selectedSeats.includes(seat.seatNumber) ? 'bold' : 'regular'}
          color={selectedSeats.includes(seat.seatNumber) ? '#007BFF' : (seat.status === 'booked' ? '#6C757D' : '#6C757D')}
          size={24}
        />
        <span className="sr-only">{`Seat ${seat.seatNumber}`}</span>
      </Button>
    ));
  };

  const handleEditPassenger = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleSaveChanges = () => {
    // Update passengerInfo with the new passenger information
    // No need to update cookies or session storage

    setShowModal(false);
  };

  const handleBookingTypeChange = (e) => {
    setBookingType(e.target.value);
  };

  const handleAddPassenger = () => {
    setPassengers([...passengers, { name: '', age: '', gender: '' }]);
  };

  const handleDeletePassenger = (index) => {
    const updatedPassengers = [...passengers];
    updatedPassengers.splice(index, 1);
    setPassengers(updatedPassengers);
  };

  const handlePassengerChange = (index, field, value) => {
    const updatedPassengers = [...passengers];
    updatedPassengers[index][field] = value;
    setPassengers(updatedPassengers);
  };

  const handleSubmit = () => {
    // Perform any necessary actions before navigating to the seat booking page
    // For now, just hide the form and show passenger details
    setShowForm(false);
  };

  return (
    <Container className="mt-5">
      <Row>
        <Col>
          {showForm ? (
            <Card>
              <Card.Body>
                <Card.Title>Booking Form</Card.Title>
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

                  <Button variant="primary" onClick={handleAddPassenger}>
                    Add Passenger
                  </Button>

                  <Button variant="success" onClick={handleSubmit}>
                    Continue to Seat Booking
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          ) : (
            <div>
              {passengers.map((passenger, index) => (
                <div key={index}>
                  <p>Name: {passenger.name}</p>
                  <p>Age: {passenger.age}</p>
                  <p>Gender: {passenger.gender}</p>
                  <Button variant="link" onClick={handleEditPassenger}>
                    Edit Passenger
                  </Button>
                </div>
              ))}
              <Row className="mt-5">
                <Col>
                  <h2>Select Your Seats</h2>
                  <Card className="p-3">{renderSeats()}</Card>
                  <div className="mt-3">
                    <strong>Selected Seats:</strong> {selectedSeats.join(', ')}
                    <Button variant="primary" onClick={handleConfirm} className="mt-3">
                      Confirm Booking
                    </Button>
                  </div>
                </Col>
              </Row>
            </div>
          )}
        </Col>
      </Row>

      <Modal show={showModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Passenger Information</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formName">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter name"
                value={passengerInfo.name}
                onChange={(e) => setPassengerInfo({ ...passengerInfo, name: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="formAge">
              <Form.Label>Age</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter age"
                value={passengerInfo.age}
                onChange={(e) => setPassengerInfo({ ...passengerInfo, age: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="formGender">
              <Form.Label>Gender</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter gender"
                value={passengerInfo.gender}
                onChange={(e) => setPassengerInfo({ ...passengerInfo, gender: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSaveChanges}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default BookingAndSeatBooking;
