import React, { useState, useEffect } from 'react';
import { Container, Grid, Button, Card, Typography, Paper } from '@mui/material';
import { Armchair } from 'phosphor-react';
import axiosInstance from './AxiosInstance';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from './Navbar'

const SeatBooking = () => {
  const [selectedOngoingSeats, setSelectedOngoingSeats] = useState([]);
  const [selectedReturnSeats, setSelectedReturnSeats] = useState([]);
  const [isConfirmed, setConfirmed] = useState(false);
  const [ongoingSeatsData, setOngoingSeatsData] = useState([]);
  const [returnSeatsData, setReturnSeatsData] = useState([]);
  const [timer, setTimer] = useState(300); // 5 minutes in seconds
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editedOngoingSeats, setEditedOngoingSeats] = useState([]);
  const [editedReturnSeats, setEditedReturnSeats] = useState([]);

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

    console.log(selectedOngoingSeats)
     console.log(selectedReturnSeats)

    // Fetch ongoing seats data after the component mounts
    const ongoingScheduleId = sessionStorage.getItem('desinationScheduleId');
    fetchSeatsData(ongoingScheduleId, setOngoingSeatsData);

    // Fetch return seats data after the ongoing seats data is fetched
    const returnScheduleId = sessionStorage.getItem('returnScheduleId');
    if (returnScheduleId) {
      fetchSeatsData(returnScheduleId, setReturnSeatsData);
    }
  }, []);

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
      // Perform any action when the timer reaches 0
      console.log('Timer reached 0');
      Cookies.remove(); // For clearing all cookies
      navigate('/homepage');
    }
  }, [timer]);



  const handleEdit = () => {
    setIsEditing(true);
    setEditedOngoingSeats([...selectedOngoingSeats]); // Copy the selected ongoing seats for editing
    setEditedReturnSeats([...selectedReturnSeats]); // Copy the selected return seats for editing
  };

  const handleSaveEdits = () => {
    setIsEditing(false);
    setSelectedOngoingSeats([...editedOngoingSeats]); // Update the ongoing selected seats with the edited ongoing seats
    setSelectedReturnSeats([...editedReturnSeats]); // Update the return selected seats with the edited return seats
  };

  const handleSeatClickEditable = (seatNumber, isReturnJourney) => {
    const editedSeatsSetter = isReturnJourney
      ? setEditedReturnSeats
      : setEditedOngoingSeats;

    const editedSeats = isReturnJourney
      ? editedReturnSeats
      : editedOngoingSeats;

    const editedSeatsCopy = [...editedSeats];

    if (editedSeatsCopy.includes(seatNumber)) {
      editedSeatsCopy.splice(editedSeatsCopy.indexOf(seatNumber), 1);
    } else {
      editedSeatsCopy.push(seatNumber);
    }

    editedSeatsSetter(editedSeatsCopy);
  };

    const handleSeatClick = (seatNumber, isReturnJourney) => {
    const selectedSeatsSetter = isReturnJourney
      ? setSelectedReturnSeats
      : setSelectedOngoingSeats;

    const editedSeatsSetter = isReturnJourney
      ? setEditedReturnSeats
      : setEditedOngoingSeats;

    const selectedSeats = isReturnJourney
      ? selectedReturnSeats
      : selectedOngoingSeats;

    if (selectedSeats.includes(seatNumber)) {
      selectedSeatsSetter(selectedSeats.filter((seat) => seat !== seatNumber));
    } else {
      selectedSeatsSetter([...selectedSeats, seatNumber]);
    }
  };

  const handleConfirm = async () => {
    try {
      const isReturnJourney = !!sessionStorage.getItem('desinationScheduleId');
  
      const selectedSeats = isReturnJourney ? selectedReturnSeats : selectedOngoingSeats;
      console.log(selectedSeats)
      const selectedSeatss = isReturnJourney ?   selectedOngoingSeats:selectedReturnSeats;
      console.log(selectedSeatss)

      const existingFlightTicketss = JSON.parse(
        Cookies.get('singleJourneyTickets') || '[]'
      );

      console.log(existingFlightTicketss)
      
      const existingFlightTickets = JSON.parse(
        Cookies.get(isReturnJourney ? 'returnJourneyTickets' : 'singleJourneyTickets') || '[]'
      );
      
      console.log(existingFlightTickets)
      console.log('Existing Flight Tickets:', existingFlightTicketss);

      
      // Find the first available seat number for each selected seat
      for (let i = 0; i < selectedSeats.length; i++) {
        const seat = selectedSeats[i];
      
        // Check if the seat is already assigned
        if (!existingFlightTickets.some((ticket) => ticket.seatNo === seat)) {
          // Find the first passenger with a null seat number
          const passengerIndex = existingFlightTickets.findIndex(
            (passenger) => passenger.seatNo === null
          );
      
          if (passengerIndex !== -1) {
            // Assign the seat to the passenger
            existingFlightTickets[passengerIndex].seatNo = seat;
          } else {
            console.log('No passenger information found for seat assignment!');
            // Handle the case where no more passengers are available
          }
        }
      }
      
      // Update existingFlightTicketss
      for (let i = 0; i < selectedSeatss.length; i++) {
        const seat = selectedSeatss[i];
      
        // Check if the seat is already assigned
        if (!existingFlightTicketss.some((ticket) => ticket.seatNo === seat)) {
          // Find the first passenger with a null seat number
          const passengerIndex = existingFlightTicketss.findIndex(
            (passenger) => passenger.seatNo === null
          );
      
          if (passengerIndex !== -1) {
            // Assign the seat to the passenger
            existingFlightTicketss[passengerIndex].seatNo = seat;
          } else {
            console.error('No passenger information found for seat assignment!');
            // Handle the case where no more passengers are available
          }
        }
      }
      
      // Update cookies
      Cookies.set(
        isReturnJourney ? 'returnJourneyTickets' : 'singleJourneyTickets',
        JSON.stringify(existingFlightTickets)
      );
      
      Cookies.set(
        isReturnJourney ? 'singleJourneyTickets' : 'returnJourneyTickets',
        JSON.stringify(existingFlightTicketss)
      );
      console.log('FlightTicket details before submitting:', existingFlightTickets);
      toast.success('Booking successfully');
      Cookies.set(
        isReturnJourney ? 'returnJourneyTickets' : 'singleJourneyTickets',
        JSON.stringify(existingFlightTickets)
      ); // Correctly stringify the array
  
      if (isReturnJourney) {
        // If it's the return journey, proceed to the next step
        // Handle seat booking details for the return journey if needed
        // ...
  
        // Clear the singleJourneyTickets cookies after processing
        setSelectedOngoingSeats([]); // Clear ongoing selected seats
      } else {
        // If it's the single journey, no need to send the combined data yet
        return;
      }
  
      // At this point, both singleJourneyTickets and returnJourneyTickets should be available
      // Combine both cookies and send a POST request with the combined data
      const combinedData = {
        booking: {
          bookingType: 'RoundTrip', // Assuming you want to set this explicitly for round trips
          userId: sessionStorage.getItem('userId'),
          status: 'Booked',
        },
        flightTickets: [
          ...JSON.parse(Cookies.get('singleJourneyTickets') || '[]'),
          ...JSON.parse(Cookies.get('returnJourneyTickets') || '[]'),
        ].filter((passenger) => passenger.seatNo !== null),
      };

  
      // Assuming that axiosInstance.post is asynchronous
      const combinedResponse = await axiosInstance.post('Bookings/CreateBooking', combinedData);
  
      console.log('Combined Response:', combinedResponse.data);
  
      // Perform actions based on the combined response if needed
      console.log('Booking, FlightTicket, and FlightSeat created successfully');
  
      Cookies.remove('singleJourneyTickets');
      Cookies.remove('returnJourneyTickets');
      // Set the confirmed state
      setConfirmed(true);
    } catch (error) {
      console.error('Error during confirmation:', error);
      // Log the detailed error response
      if (error.response) {
        console.error('Error response from server:', error.response.data);
      }
      // Handle the error as needed
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
              ? 'failed'
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
    <Container className="mt-5">
      <Navbar/>
      <Grid container>
        <Grid item xs={12}>
          <Typography variant="h2">Select Your Seats - Ongoing</Typography>
            <>
              <Card sx={{ p: 3 }}>
                {renderSeats(ongoingSeatsData, isEditing ? editedOngoingSeats : selectedOngoingSeats, handleSeatClick, isEditing, false)}
              </Card>
              
              
            </>
            <Paper sx={{ p: 3 }}>
              <Typography variant="div" className="mt-3">
                <strong>Selected Seats:</strong> {selectedOngoingSeats.join(', ')}
              </Typography>
            
            </Paper>
        </Grid>
        { returnSeatsData.length > 0 && (
          <Grid item xs={12} className="mt-5">
            <Typography variant="h2">Select Your Seats - Return</Typography>
            <Card sx={{ p: 3 }}>{renderSeats(returnSeatsData, selectedReturnSeats, handleSeatClick, false, true)}</Card>
            <Typography variant="div" className="mt-3">
              <strong>Selected Seats:</strong> {selectedReturnSeats.join(', ')}
            </Typography>
          </Grid>
        )}
        
      </Grid>
      <Button onClick={handleConfirm}>Confirm</Button>

    </Container>
  );
  
  
};
export default SeatBooking;
