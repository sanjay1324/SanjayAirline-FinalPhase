import React, { useState, useEffect } from 'react';
import { Container, Grid, Button, Card, Typography } from '@mui/material';
import { Armchair } from 'phosphor-react';
import axiosInstance from './AxiosInstance';
import Cookies from 'js-cookie';
import './index.css';

const SeatBooking = () => {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [isConfirmed, setConfirmed] = useState(false);
  const [seatsData, setSeatsData] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);

  useEffect(() => {
    const fetchSeatsData = async () => {
      try {
        const YOUR_SCHEDULE_ID = sessionStorage.getItem('scheduleId');
        const response = await axiosInstance.get(`Seats/GetSeatsByScheduleId/${YOUR_SCHEDULE_ID}`);
        const seatsWithStatus = response.data.map((seat) => {
          return {
            ...seat,
            
          };
        });

        setSeatsData(seatsWithStatus);
      } catch (error) {
        console.error('Error fetching seats data:', error);
      }
    };

    // Fetch seats data after the component mounts
    fetchSeatsData();
  }, []);

  console.log(seatsData.length)

  const isSeatBooked = (seatNumber) => {
    return bookedSeats.includes(seatNumber);
  };

  const handleSeatClick = (seatNumber) => {
    if (isSeatBooked(seatNumber)) {
      console.log(`Seat ${seatNumber} is already booked.`);
      return;
    }

    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter((seat) => seat !== seatNumber));
    } else {
      setSelectedSeats([...selectedSeats, seatNumber]);
    }
  };

  const handleConfirm = async () => {
    try {
      if (selectedSeats.length === 0) {
        console.error('No seat selected!');
        return;
      }

      const existingFlightTickets = JSON.parse(Cookies.get('flightTickets') || '[]');

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
            console.error('No passenger information found for seat assignment!');
            break; // Exit the loop if no more passengers are available
          }
        }
      }

      console.log('FlightTicket details before submitting:', existingFlightTickets);

      Cookies.set('flightTickets', JSON.stringify(existingFlightTickets)); // Correctly stringify the array

      // Send a POST request with the combined data
      const combinedData = {
        booking: {
          bookingType: sessionStorage.getItem('bookingType'),
          userId: sessionStorage.getItem('userId'),
          status: 'Booked',
        },
        flightTickets: existingFlightTickets.filter((passenger) => passenger.seatNo !== null),
      };

      // Assuming that axiosInstance.post is asynchronous
      const combinedResponse = await axiosInstance.post('Bookings/CreateBooking', combinedData);

      console.log('Combined Response:', combinedResponse.data);

      // Perform actions based on the combined response if needed
      console.log('Booking, FlightTicket, and FlightSeat created successfully');

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

  const renderSeats = () => {
    const seatButtons = [];

    for (let i = 0; i < seatsData.length; i++) {
      const seat = seatsData[i];
      console.log(seat)
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
              handleSeatClick(seat.seatNumber);
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
      <Grid container>
        <Grid item xs={12}>
          <Typography variant="h2">Select Your Seats</Typography>
          <Card sx={{ p: 3 }}>{renderSeats()}</Card>
          <Typography variant="div" className="mt-3">
            <strong>Selected Seats:</strong> {selectedSeats.join(', ')}
          </Typography>
          <Button variant="contained" color="primary" onClick={handleConfirm} className="mt-3">
            Confirm Booking
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SeatBooking;
