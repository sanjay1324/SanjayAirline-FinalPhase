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

  const handleConfirm = async (status) => {
    try {
      const isReturnJourney = !!sessionStorage.getItem('desinationScheduleId');

      if (status === 'singleJourneyTickets') {
        const selectedSeatss = isReturnJourney ? selectedOngoingSeats : selectedReturnSeats; //going
        console.log(selectedSeatss)

        const existingFlightTicketss = JSON.parse(
          Cookies.get('singleJourneyTickets') || '[]'
        ); //going

        console.log('Existing Flight Tickets:', existingFlightTicketss);

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

        Cookies.set(
          isReturnJourney ? 'singleJourneyTickets' : 'returnJourneyTickets',
          JSON.stringify(existingFlightTicketss)
        );

      } else {
        const selectedSeats = isReturnJourney ? selectedReturnSeats : selectedOngoingSeats; //return
        console.log(selectedSeats)

        const existingFlightTickets = JSON.parse(
          Cookies.get(isReturnJourney ? 'returnJourneyTickets' : 'singleJourneyTickets') || '[]'
        );


        console.log(existingFlightTickets)


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

        Cookies.set(
          isReturnJourney ? 'returnJourneyTickets' : 'singleJourneyTickets',
          JSON.stringify(existingFlightTickets)
        );
      }


     

    } catch (error) {
      console.error('Error during confirmation:', error);
      // Log the detailed error response
      if (error.response) {
        console.error('Error response from server:', error.response.data);
      }
      // Handle the error as needed
    }
  };

  const handleFinalConfirm = async () => {
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


    }

    const combinedResponse = await axiosInstance.post('Bookings/CreateBooking', combinedData);

    console.log('Combined Response:', combinedResponse.data);

    // Perform actions based on the combined response if needed
    console.log('Booking, FlightTicket, and FlightSeat created successfully');

    console.log()
    sessionStorage.setItem('bookingId',combinedResponse.data.bookingId)

    setConfirmed(true);

  }
  const ChangeSeatStatus = async (scheduleId, status, seatNumbers) => {
    try {
      const response = await axiosInstance.put(
        `Bookings/${scheduleId}/${status}`,
        JSON.stringify(seatNumbers),
        {
          headers: {
            "Content-Type": "application/json",
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
    <>


    <Container className="mt-5">
      <Navbar />
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
            <Button onClick={() => handleConfirm('singleJourneyTickets')}>Select Seats</Button>

          </Paper>
        </Grid>
        {returnSeatsData.length > 0 && (
          <Grid item xs={12} className="mt-5">
            <Typography variant="h2">Select Your Seats - Return</Typography>
            <Card sx={{ p: 3 }}>{renderSeats(returnSeatsData, selectedReturnSeats, handleSeatClick, false, true)}</Card>
            <Typography variant="div" className="mt-3">
              <strong>Selected Seats:</strong> {selectedReturnSeats.join(', ')}
            </Typography>
            <Button onClick={() => handleConfirm('returnJourneyTickets')}>Select Seats</Button>

          </Grid>
        )}

      </Grid>



    </Container>

    <Button onClick={handleFinalConfirm}> Confirm </Button>
    </>
  );


};
export default SeatBooking;
