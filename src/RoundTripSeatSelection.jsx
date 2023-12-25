import React, { useState, useEffect } from 'react';
import { Container, Grid, Button, Card, Typography, Paper, Dialog, DialogTitle, DialogContent, DialogActions, Box } from '@mui/material';
import { Armchair } from 'phosphor-react';
import axiosInstance from './AxiosInstance';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from './Navbar';
import './den.css';


const SeatBooking = () => {
  const [selectedOngoingSeats, setSelectedOngoingSeats] = useState([]);
  const [selectedReturnSeats, setSelectedReturnSeats] = useState([]);
  const [isConfirmed, setConfirmed] = useState(false);
  const [ongoingSeatsData, setOngoingSeatsData] = useState([]);
  const [returnSeatsData, setReturnSeatsData] = useState([]);
  const [timer, setTimer] = useState(3000); // 5 minutes in seconds
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editedOngoingSeats, setEditedOngoingSeats] = useState([]);
  const [editedReturnSeats, setEditedReturnSeats] = useState([]);
  const [showSecondJourney, setShowSecondJourney] = useState(false);
  const [isPassengerDetailsModalOpen, setPassengerDetailsModalOpen] = useState(false);
  const [selectedPassengerDetails, setSelectedPassengerDetails] = useState([]);


  useEffect(() => {
    const fetchSeatsData = async (scheduleId, setStateCallback) => {
      try {
        const response = await axiosInstance.get(`Seats/GetSeatsByScheduleId/${scheduleId}`);
        const seatsWithStatus = response.data.map((seat) => ({ ...seat }));
        setStateCallback(seatsWithStatus);
      } catch (error) {
        console.error('Error fetching seats data:', error);
      }
    };

    // Fetch ongoing seats data after the component mounts
    const ongoingScheduleId = sessionStorage.getItem('desinationScheduleId');
    fetchSeatsData(ongoingScheduleId, setOngoingSeatsData);

    // Fetch return seats data after the ongoing seats data is fetched
    const returnScheduleId = sessionStorage.getItem('returnScheduleId');
    if (returnScheduleId) {
      fetchSeatsData(returnScheduleId, setReturnSeatsData);
    }
  }, []);

  const handleViewPassengerDetails = (seatNumbers, isReturnJourney) => {
    const returnJourneyTickets = JSON.parse(Cookies.get('returnJourneyTickets') || '[]');
    const singleJourneyTickets = JSON.parse(Cookies.get('singleJourneyTickets') || '[]');
  
    const passengers = isReturnJourney
      ? returnJourneyTickets.filter((passenger) => seatNumbers.includes(passenger.seatNo))
      : singleJourneyTickets.filter((passenger) => seatNumbers.includes(passenger.seatNo));
  
    if (passengers.length > 0) {
      setSelectedPassengerDetails(passengers);
      setPassengerDetailsModalOpen(true);
    } else {
      setSelectedPassengerDetails(null);
      setPassengerDetailsModalOpen(false);
    }
  };
  
  
  

  useEffect(() => {
    const timerInterval = setInterval(() => {
      setTimer((prevTimer) => prevTimer - 1);
    }, 1000);

    return () => {
      clearInterval(timerInterval);
    };
  }, []);

  useEffect(() => {
    if (timer === 0) {
      Cookies.remove(); // For clearing all cookies
      navigate('/homepage');
    }
  }, [timer]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedOngoingSeats([...selectedOngoingSeats]);
    setEditedReturnSeats([...selectedReturnSeats]);
  };
  const handleSeatClickEditable = (seatNumber, isReturnJourney) => {
    const editedSeatsSetter = isReturnJourney
      ? setEditedReturnSeats
      : setEditedOngoingSeats;
  
      console.log("sanjay")
    const editedSeats = isReturnJourney ? editedReturnSeats : editedOngoingSeats;
  
    const editedSeatsCopy = [...editedSeats];
  
    // Check if the seat is already selected
    const seatIndex = editedSeatsCopy.indexOf(seatNumber);
  
    if (seatIndex !== -1) {
      // If selected, remove it (deselect)
      editedSeatsCopy.splice(seatIndex, 1);
    } else {
      // If not selected, add it (select)
      editedSeatsCopy.push(seatNumber);
    }
  
    editedSeatsSetter(editedSeatsCopy);
  
    // Also update the corresponding cookie when a seat is clicked
    const journeyType = isReturnJourney ? 'returnJourneyTickets' : 'singleJourneyTickets';
    const existingTickets = JSON.parse(Cookies.get(journeyType) || '[]');
  
    const updatedTickets = existingTickets.map((ticket) => {
      if (editedSeatsCopy.includes(ticket.seatNo)) {
        return { ...ticket, seatNo: ticket.seatNo }; // Update seatNo only
      }
      return ticket;
    });
  
    // Update the cookie with the correct information
    Cookies.set(journeyType, JSON.stringify(updatedTickets));
  };
  
  
  
  useEffect(() => {
    // Fetch the ticket count from sessionStorage
    const ticketCount = sessionStorage.getItem('ticketCount');
    if (!ticketCount) {
      // Handle the case where ticketCount is not available
    }

    // Check if the number of selected seats exceeds the ticketCount
    const totalSelectedSeats = selectedOngoingSeats.length + selectedReturnSeats.length;
    if (totalSelectedSeats > ticketCount) {
      // Handle the case where the selected seats exceed the allowed count
    }
  }, [selectedOngoingSeats, selectedReturnSeats]);

  const handleSeatClick = (seatNumber, isReturnJourney) => {
    // Check if the number of selected seats exceeds the ticketCount
    const totalSelectedSeats = selectedOngoingSeats.length + selectedReturnSeats.length;
    const ticketCount = sessionStorage.getItem('ticketCount');
    if (totalSelectedSeats <= ticketCount) {
      const selectedSeatsSetter = isReturnJourney ? setSelectedReturnSeats : setSelectedOngoingSeats;

      const selectedSeats = isReturnJourney ? selectedReturnSeats : selectedOngoingSeats;

      if (selectedSeats.includes(seatNumber)) {
        selectedSeatsSetter(selectedSeats.filter((seat) => seat !== seatNumber));
      } else {
        selectedSeatsSetter([...selectedSeats, seatNumber]);
      }
    } else {
      // Handle the case where the selected seats exceed the allowed count
    }
  };

  const handleSaveEdits = () => {
    setIsEditing(false);

    const updateSeatInCookies = (existingTickets, editedSeats) => {
      return existingTickets.map((passenger) => {
        if (editedSeats.includes(passenger.seatNo)) {
          return { ...passenger, seatNo: passenger.seatNo }; // Update seatNo only
        }
        return passenger;
      });
    };

    // Update seatNo in singleJourneyTickets if applicable
    const existingSingleJourneyTickets = JSON.parse(Cookies.get('singleJourneyTickets') || '[]');
    Cookies.set(
      'singleJourneyTickets',
      JSON.stringify(updateSeatInCookies(existingSingleJourneyTickets, editedOngoingSeats))
    );

    // Update seatNo in returnJourneyTickets if applicable
    const existingReturnJourneyTickets = JSON.parse(Cookies.get('returnJourneyTickets') || '[]');
    Cookies.set(
      'returnJourneyTickets',
      JSON.stringify(updateSeatInCookies(existingReturnJourneyTickets, editedReturnSeats))
    );
  };


  const handleConfirm = async (status) => {
    try {
      const isReturnJourney = !!sessionStorage.getItem('desinationScheduleId');

      if (status === 'singleJourneyTickets') {
        const selectedSeats = isReturnJourney ? selectedOngoingSeats : selectedReturnSeats;

        const existingFlightTickets = JSON.parse(
          Cookies.get('singleJourneyTickets') || '[]'
        );

        for (let i = 0; i < selectedSeats.length; i++) {
          const seat = selectedSeats[i];

          if (!existingFlightTickets.some((ticket) => ticket.seatNo === seat)) {
            const passengerIndex = existingFlightTickets.findIndex(
              (passenger) => passenger.seatNo === null
            );

            if (passengerIndex !== -1) {
              existingFlightTickets[passengerIndex].seatNo = seat;
            } else {
              console.error('No passenger information found for seat assignment!');
            }
          }
        }

        Cookies.set('singleJourneyTickets', JSON.stringify(existingFlightTickets));

        // Set the flag to show the second journey if seats for the first journey are selected
        if (selectedOngoingSeats.length > 0) {
          setShowSecondJourney(true);
        }
      } else {
        const selectedSeats = isReturnJourney ? selectedReturnSeats : selectedOngoingSeats;

        const existingFlightTickets = JSON.parse(
          Cookies.get(isReturnJourney ? 'returnJourneyTickets' : 'singleJourneyTickets') || '[]'
        );

        for (let i = 0; i < selectedSeats.length; i++) {
          const seat = selectedSeats[i];

          if (!existingFlightTickets.some((ticket) => ticket.seatNo === seat)) {
            const passengerIndex = existingFlightTickets.findIndex(
              (passenger) => passenger.seatNo === null
            );

            if (passengerIndex !== -1) {
              existingFlightTickets[passengerIndex].seatNo = seat;
            } else {
              console.log('No passenger information found for seat assignment!');
            }
          }
        }

        Cookies.set(
          isReturnJourney ? 'returnJourneyTickets' : 'singleJourneyTickets',
          JSON.stringify(existingFlightTickets)
        );
      }
    } catch (error) {
      console.error('Error during confirmation:', error);
      if (error.response) {
        console.error('Error response from server:', error.response.data);
      }
    }
  };

  const handleFinalConfirm = async () => {
    const combinedData = {
      booking: {
        bookingType: 'RoundTrip',
        userId: sessionStorage.getItem('userId'),
        status: 'Booked',
      },
      flightTickets: [
        ...JSON.parse(Cookies.get('singleJourneyTickets') || '[]'),
        ...JSON.parse(Cookies.get('returnJourneyTickets') || '[]'),
      ].filter((passenger) => passenger.seatNo !== null),
    };

    const combinedResponse = await axiosInstance.post('Bookings/CreateBooking', combinedData);

    console.log(combinedResponse.data)
    sessionStorage.setItem('bookingId', combinedResponse.data.booking.bookingId);

    setTimeout(() => {
              navigate('/ticket');
            }, 3000);

    setConfirmed(true);
  };

  const ChangeSeatStatus = async (scheduleId, status, seatNumbers) => {
    try {
      const response = await axiosInstance.put(
        `Bookings/${scheduleId}/${status}`,
        JSON.stringify(seatNumbers),
        {
          headers: {
            'Content-Type': 'application/json',
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

  const renderSeats = (seatsData, selectedSeats, handleSeatClick, isEditing, isReturnJourney) => {
    const seatButtons = [];

    for (let i = 0; i < seatsData.length; i++) {
      const seat = seatsData[i];
      seatButtons.push(
        <Button
          key={seat.seatNumber}
          variant={
            selectedSeats.includes(seat.seatNumber)
              ? 'success'
              : seat.status === 'Booked'
                ? 'secondary'
                : 'light'
          }
          onClick={() => {
            if (seat.status !== 'Booked') {
              isEditing
                ? handleSeatClickEditable(seat.seatNumber, isReturnJourney)
                : handleSeatClick(seat.seatNumber, isReturnJourney);
            }
          }}
          className={`m-2 ${seat.status === 'Booked' ? 'disabled-seat' : ''}`}
          disabled={seat.status === 'Booked'}
        >
          <Armchair
            weight={selectedSeats.includes(seat.seatNumber) ? 'bold' : 'regular'}
            color={
              selectedSeats.includes(seat.seatNumber)
                ? '#007BFF'
                : seat.status === 'Booked'
                  ? '#6C757D'
                  : '#6C757D'
            }
            size={24}
            className={seat.status === 'Booked' ? 'disabled-armchair' : ''}
          />
          <span className="sr-only">{`Seat ${seat.seatNumber}`}</span>
        </Button>
      );
    }

    return seatButtons;
  };

  return (
    <>
      <Container className="mt-5">
        <Navbar />
        <Grid container>
          <Grid item xs={12}>
            <Typography variant="h2">Select Your Seats - Ongoing</Typography>
            <>
              <Card sx={{ p: 3 }}>
                {renderSeats(
                  ongoingSeatsData,
                  isEditing ? editedOngoingSeats : selectedOngoingSeats,
                  handleSeatClick,
                  isEditing,
                  false
                )}
              </Card>
            </>
            <Paper sx={{ p: 3 }}>
              <Typography variant="div" className="mt-3">
                <strong>Selected Seats:</strong> {selectedOngoingSeats.join(', ')}
              </Typography>
              <Button onClick={() => handleConfirm('singleJourneyTickets')}>Select Seats</Button>
            </Paper>
          </Grid>
          {showSecondJourney && (
            <Grid item xs={12} className="mt-5">
              <Typography variant="h2">Select Your Seats - Return</Typography>
              <Card sx={{ p: 3 }}>
                {renderSeats(
                  returnSeatsData,
                  selectedReturnSeats,
                  handleSeatClick,
                  false,
                  true
                )}
              </Card>
              <Typography variant="div" className="mt-3">
                <strong>Selected Seats:</strong> {selectedReturnSeats.join(', ')}
              </Typography>
              <Button onClick={() => handleConfirm('returnJourneyTickets')}>Select Seats</Button>
            </Grid>
          )}
        </Grid>
        <Button onClick={() => handleViewPassengerDetails([...selectedOngoingSeats, ...selectedReturnSeats], false)}>
  View Passenger Details
</Button>



      {/* Add the passenger details modal */}
      <Dialog open={isPassengerDetailsModalOpen} onClose={() => setPassengerDetailsModalOpen(false)}>
        <DialogTitle>Passenger Details</DialogTitle>
        <DialogContent>
          {selectedPassengerDetails.map((passenger, index) => (
            <Box key={index}>
              <Typography variant="body1">
                <strong>Seat Number:</strong> {passenger.seatNo}
              </Typography>
              <Typography variant="body1">
                <strong>Name:</strong> {passenger.name}
              </Typography>
              {/* Add more details as needed */}
              {index < selectedPassengerDetails.length - 1 && <hr />} {/* Add a horizontal line between passengers */}
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleFinalConfirm()}>Confirm</Button>
          <Button onClick={() => setPassengerDetailsModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      </Container>
    </>
  );
};

export default SeatBooking;
