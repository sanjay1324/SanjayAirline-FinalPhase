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
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editedOngoingSeats, setEditedOngoingSeats] = useState([]);
  const [editedReturnSeats, setEditedReturnSeats] = useState([]);
  const [sourceId, setSourceId] = useState([]);
  const [destinationId, setDestinationId] = useState([]);
  const firstFlightPassengerDetailsCookieName = 'firstFlightPassengerDetails';
  const [returnSourceId, setReturnSourceId] = useState(null);
  const [returnDestinationId, setReturnDestinationId] = useState(null);

  const getPassengerDetailsCookieName = () => {
    const scheduleIds = [
      sessionStorage.getItem('scheduleId'),
      sessionStorage.getItem('desinationScheduleId')
    ];

    const isRoundTrip = scheduleIds.length > 1;

    if (isRoundTrip) {
      return 'passengerDetails';
    } else {
      return 'passengerDetails';
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

        const TicketCount = sessionStorage.getItem('ticketCount');

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

    // Fetch seats data for the ongoing leg of the connecting flight
    fetchSeatsData(ongoingScheduleId, setOngoingSeatsData);
    // Fetch seats data for the return leg of the connecting flight (if applicable)
    if (returnScheduleId) {
      fetchSeatsData(returnScheduleId, setReturnSeatsData, true);
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
      console.log('Timer reached 0');
      Cookies.remove();
      navigate('/homepage');
    }
  }, [timer]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedOngoingSeats([...selectedOngoingSeats]);
    setEditedReturnSeats([...selectedReturnSeats]);
  };

  const handleSaveEdits = () => {
    setIsEditing(false);
    setSelectedOngoingSeats([...editedOngoingSeats]);
    setSelectedReturnSeats([...editedReturnSeats]);
    setSelectedOngoingSeatCount(editedOngoingSeats.length);
    setSelectedReturnSeatCount(editedReturnSeats.length);
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

    const seatCountSetter = isReturnJourney
      ? setSelectedReturnSeatCount
      : setSelectedOngoingSeatCount;

    const selectedSeats = isReturnJourney
      ? selectedReturnSeats
      : selectedOngoingSeats;

    const ticketCount = parseInt(sessionStorage.getItem('ticketCount'), 10);

    if (selectedSeats.length < ticketCount) {
      selectedSeatsSetter([...selectedSeats, seatNumber]);
      seatCountSetter(selectedSeats.length + 1);
    } else {
      console.log(`You can select up to ${ticketCount} seats.`);
    }
  };

  const handleConfirm = async () => {
    try {
      const isReturnJourney = !!sessionStorage.getItem('desinationScheduleId');

      const existingFlightTickets = JSON.parse(
        Cookies.get(isReturnJourney ? 'destinationScheduleIdPassengers' : 'scheduleIdPassengers') || '[]'
      );

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

      // Update existingFlightTickets for return journey
      for (let i = 0; i < selectedReturnSeats.length; i++) {
        const seat = selectedReturnSeats[i];

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
        // setSelectedOngoingSeats([]); // Clear ongoing selected seats
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
      <Navbar />
      <Grid container>
        <Grid item xs={12}>
          <Typography variant="h2">Select Your Seats - Ongoing</Typography>
          <>
            <Card sx={{ p: 3 }}>
              {getPassengerDetailsCookieName() === firstFlightPassengerDetailsCookieName && (
                <Typography variant="h5">Source to Connecting</Typography>
              )}
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
              {getPassengerDetailsCookieName() === firstFlightPassengerDetailsCookieName && (
                <Typography variant="h5">Connecting to Destination</Typography>
              )}
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
      <Button onClick={handleConfirm}>Confirm</Button>
    </Container>
  );
};

export default SeatBooking;
