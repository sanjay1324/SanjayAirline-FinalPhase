import React, { useState, useEffect } from 'react';
import { Container, Grid, Button, Card, Typography, Paper } from '@mui/material';
import { Armchair } from 'phosphor-react';
import axiosInstance from './AxiosInstance';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from './Navbar';

const SeatBooking = () => {
  const [selectedOngoingSeats, setSelectedOngoingSeats] = useState([]);
  const [selectedReturnSeats, setSelectedReturnSeats] = useState([]);
  const [selectedOngoingSeatCount, setSelectedOngoingSeatCount] = useState(0);
  const [selectedReturnSeatCount, setSelectedReturnSeatCount] = useState(0);
  const [isConfirmed, setConfirmed] = useState(false);
  const [ongoingSeatsData, setOngoingSeatsData] = useState([]);
  const [returnSeatsData, setReturnSeatsData] = useState([]);
  const [timer, setTimer] = useState(300); // 5 minutes in seconds
  const [timerInterval, setTimerInterval] = useState(null);
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editedOngoingSeats, setEditedOngoingSeats] = useState([]);
  const [editedReturnSeats, setEditedReturnSeats] = useState([]);
  const [sourceId, setSourceId] = useState([]);
  const [destinationId, setDestinationId] = useState([]);
  const [returnSourceId, setReturnSourceId] = useState(null);
  const [returnDestinationId, setReturnDestinationId] = useState(null);
  const scheduleId = sessionStorage.getItem('desinationScheduleId');
  const scheduleId2 = sessionStorage.getItem('scheduleId');
  const seatNumbers = selectedOngoingSeats;
  const seatNumbers2 = selectedReturnSeats;

  useEffect(() => {
    const timerInterval = setInterval(() => {
      setTimer((prevTimer) => prevTimer - 1);
    }, 1000);

    // Save the timer interval in state
    setTimerInterval(timerInterval);

    return () => {
      // Clear the timer interval when the component unmounts
      clearInterval(timerInterval);

      // Clear the reset timer if it exists
      if (timerInterval) {
        clearTimeout(timerInterval);
      }
    };
  }, [timer]);

  useEffect(() => {
    if (timer === 0) {
      // Perform any action when the timer reaches 0
      console.log('Timer reached 0');
      ChangeSeatStatus(scheduleId, 'Available', seatNumbers);
      ChangeSeatStatus(scheduleId2, 'Available', seatNumbers);

      Cookies.remove(); // For clearing all cookies
      navigate('/homepage');
      clearInterval(timerInterval);
    }
  }, [timer]);

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

  useEffect(() => {
    const fetchSeatsData = async (scheduleId, setStateCallback, isReturnFlight) => {
      try {
        const scheduleResponse = await axiosInstance.get(`FlightSchedules/${scheduleId}`);
        const sourceId = scheduleResponse.data.sourceAirportId;
        const destinationId = scheduleResponse.data.destinationAirportId;

        if (!isReturnFlight) {
          setSourceId(sourceId);
          setDestinationId(destinationId);
        } else {
          setReturnSourceId(sourceId);
          setReturnDestinationId(destinationId);
        }
        const seatsResponse = await axiosInstance.get(`Seats/GetSeatsByScheduleId/${scheduleId}`);
        const seatsWithStatus = seatsResponse.data.map((seat) => ({
          ...seat,
          sourceId,
          destinationId,
        }));

        setStateCallback(seatsWithStatus);
      } catch (error) {
        console.error('Error fetching seats data:', error);
      }
    };

    const ongoingScheduleId = sessionStorage.getItem('scheduleId');
    const returnScheduleId = sessionStorage.getItem('desinationScheduleId');
    console.log(returnScheduleId)
    // Fetch seats data for the ongoing leg of the connecting flight
    fetchSeatsData(ongoingScheduleId, setOngoingSeatsData);
    // Fetch seats data for the return leg of the connecting flight (if applicable)
    if (returnScheduleId) {
      console.log("true")
      fetchSeatsData(returnScheduleId, setReturnSeatsData, true);
    } else {
      console.log("false")
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





  const handleEdit = () => {
    setIsEditing(true);
    setEditedOngoingSeats([...selectedOngoingSeats]);
    setEditedReturnSeats([...selectedReturnSeats]);
  };

  const handleSaveEdits = () => {
    setIsEditing(false);
    setSelectedOngoingSeats([...editedOngoingSeats]);
    setSelectedReturnSeats([...editedReturnSeats]);
  };

  const handleSeatClickEditable = (seatNumber, isReturnJourney) => {
    const editedSeatsSetter = isReturnJourney ? setEditedReturnSeats : setEditedOngoingSeats;

    const editedSeats = isReturnJourney ? editedReturnSeats : editedOngoingSeats;

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

    const seatCountSetter = isReturnJourney
      ? setSelectedReturnSeatCount
      : setSelectedOngoingSeatCount;

    const selectedSeats = isReturnJourney
      ? selectedReturnSeats
      : selectedOngoingSeats;

    const ticketCount = parseInt(sessionStorage.getItem('ticketCount'), 10);

    if (selectedSeats.length < ticketCount || selectedSeats.includes(seatNumber)) {
      const updatedSelectedSeats = [...selectedSeats, seatNumber];
      selectedSeatsSetter(updatedSelectedSeats);
      seatCountSetter(updatedSelectedSeats.length);
    } else {
      console.log(`You can select up to ${ticketCount} seats.`);
    }
  };


  const handleConfirm = async () => {
    try {
      const isReturnJourney = !!sessionStorage.getItem('desinationScheduleId');
      const existingFlightTicketss = JSON.parse(
        Cookies.get('scheduleIdPassengers') || '[]'
      );

      console.log(existingFlightTicketss)

      const existingFlightTickets = JSON.parse(
        Cookies.get(isReturnJourney ? 'destinationScheduleIdPassengers' : 'scheduleIdPassengers') || '[]'
      );

      console.log(existingFlightTickets)
      console.log('Existing Flight Tickets:', existingFlightTicketss);


      // Find the first available seat number for each selected seat
      for (let i = 0; i < selectedOngoingSeats.length; i++) {
        const seat = selectedOngoingSeats[i];

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
      for (let i = 0; i < selectedReturnSeats.length; i++) {
        const seat = selectedReturnSeats[i];

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

      // Cookies.remove('singleJourneyTickets');
      // Cookies.remove('returnJourneyTickets');
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


  const handleSeatSeat = async () => {

    await ChangeSeatStatus(scheduleId, 'Booked', seatNumbers);
    await ChangeSeatStatus(scheduleId2, 'Booked', seatNumbers2);

  }

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
    <Container className="mt-5">
      <Navbar />
      <Grid container>
        <Grid item xs={12}>
          <div className="timer-container">
            <Typography variant="body2" className="timer">
              {Math.floor(timer / 60)}:{timer % 60 < 10 ? `0${timer % 60}` : timer % 60}
            </Typography>
          </div>
          <Typography variant="h2">Select Your Seats - Ongoing</Typography>
          <>
            <Card sx={{ p: 3 }}>

              <Typography variant="h5">Source to Connecting</Typography>

              <Typography variant="div" className="mt-3">
                <strong>Source ID:</strong> {sourceId}
              </Typography>
              <Typography variant="div" className="mt-3">
                <strong>Destination ID:</strong> {destinationId}
              </Typography>
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

            <Typography variant="div" className="mt-3">
              <strong>Selected Seat Count:</strong> {selectedOngoingSeatCount}
            </Typography>
          </Paper>
        </Grid>
        {returnSeatsData.length > 0 && (
          <Grid item xs={12} className="mt-5">
            <Typography variant="h2">Select Your Seats - Return</Typography>
            <Card sx={{ p: 3 }}>

              <Typography variant="h5">Connecting to Destination</Typography>

              <Typography variant="div" className="mt-3">
                <strong>Source ID:</strong> {returnSourceId}
              </Typography>
              <Typography variant="div" className="mt-3">
                <strong>Destination ID:</strong> {returnDestinationId}
              </Typography>
              {renderSeats(
                returnSeatsData,
                selectedReturnSeats,
                handleSeatClick,
                false,
                true
              )}
            </Card>
            <Paper sx={{ p: 3 }}>
              <Typography variant="div" className="mt-3">
                <strong>Selected Seats:</strong> {selectedReturnSeats.join(', ')}
              </Typography>

              <Typography variant="div" className="mt-3">
                <strong>Selected Seat Count:</strong> {selectedReturnSeatCount}
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>

      <Button onClick={handleSeatSeat}>Seat Selection</Button>

      <Button onClick={handleConfirm}>Confirm</Button>
    </Container>
  );
};

export default SeatBooking;
