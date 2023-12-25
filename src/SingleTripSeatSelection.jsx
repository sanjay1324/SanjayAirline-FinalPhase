import React, { useState, useEffect } from 'react';
import { CircularProgress, Container, Grid, Button, Card, Typography, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText, Box } from '@mui/material';
import { Armchair } from 'phosphor-react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import Navbar from './Navbar';
import axiosInstance from './AxiosInstance';
import './den.css'

const SeatBooking = () => {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [seatsData, setSeatsData] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [timer, setTimer] = useState(300); // 5 minutes in seconds
  const [timerInterval, setTimerInterval] = useState(null);
  const navigate = useNavigate();
  const ticketCount = sessionStorage.getItem('ticketCount');
  const [isModalOpen, setModalOpen] = useState(false);
  const [bookingDetails, setBookingDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const scheduleId = sessionStorage.getItem('desinationScheduleId');
  const seatNumbers = selectedSeats;

  useEffect(() => {
    const fetchSeatsData = async () => {
      try {
        const YOUR_SCHEDULE_ID = sessionStorage.getItem('desinationScheduleId');
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

      Cookies.remove(); // For clearing all cookies
      navigate('/homepage');
      clearInterval(timerInterval);
    }
  }, [timer]);

  const isSeatBooked = (seatNumber) => {
    return bookedSeats.includes(seatNumber);
  };

  const handleSeatClick = (seatNumber) => {
    if (isSeatBooked(seatNumber)) {
      console.log(`Seat ${seatNumber} is already booked.`);
      return;
    }

     ChangeSeatStatus(scheduleId, 'Booked', seatNumbers);

    console.log(selectedSeats);

    let seatIsSelected;

    // Check if the seat is already selected
    if (selectedSeats.includes(seatNumber)) {
      seatIsSelected = true;
    } else {
      seatIsSelected = false;
    }

    // Proceed to update the selected seats
    if (seatIsSelected) {
      // If the seat is already selected, remove it (deselect)
      setSelectedSeats((prevSelectedSeats) =>
        prevSelectedSeats.filter((seat) => seat !== seatNumber)
      );
    } else {
      // If the seat is not selected, check if the ticket count limit is reached
      if (selectedSeats.length < ticketCount) {
        // Add the seat to the selected seats
        setSelectedSeats((prevSelectedSeats) => [...prevSelectedSeats, seatNumber]);
      } else {
        console.log('Cannot select more seats than the allowed ticketCount.');
      }
    }
  };

  


  const ChangeSeatStatus = async (scheduleId, status, seatNumbers) => {
    try {
      const response = await axiosInstance.patch(
        `Integration/changeseatstatus/${scheduleId}/${status}`,
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

      setModalOpen(true);
      setBookingDetails([
        {
          bookingType: sessionStorage.getItem('bookingType'),
          userId: sessionStorage.getItem('userId'),
          status: 'Booked',
          flightTickets: existingFlightTickets.filter((passenger) => passenger.seatNo !== null),
        },
      ]);

      // Send a POST request with the combined data

    
      console.log(selectedSeats)
      console.log(seatNumbers)

      // Set a timer to change the seat status back to 'Available' after 5 minutes
      const resetTimer = setTimeout(async () => {
        await ChangeSeatStatus(scheduleId, 'Available', seatNumbers);
      }, 5 * 60 * 1000); // 5 minutes in milliseconds

      // Save the reset timer in state or context if you need to clear it later
      setTimerInterval(resetTimer);


    } catch (error) {
      console.error('Error during confirmation:', error);
      // Log the detailed error response
      if (error.response) {
        console.error('Error response from server:', error.response.data);
      }
      // Handle the error as needed
    }
  };
 


  
  
  
  
  
  const handleCloseModal = () => {
    // Close the modal
    setModalOpen(false);

    // Optionally, you can perform additional actions here
  };
  const handleConfirmation = async () => {
    try {
      setLoading(true);

      const existingFlightTickets = JSON.parse(Cookies.get('flightTickets') || '[]');

      const combinedData = {
        booking: {
          bookingType: sessionStorage.getItem('bookingType'),
          userId: sessionStorage.getItem('userId'),
          status: 'Booked',
        },
        flightTickets: existingFlightTickets.filter((passenger) => passenger.seatNo !== null),
      };

      const combinedResponse = await axiosInstance.post('Bookings/CreateBooking', combinedData);
      console.log(combinedResponse.status);

      if (combinedResponse.status === 200 || combinedResponse.status === 201) {
        console.log('Combined Response:', combinedResponse.data);
        toast.success('Booking Done');
        const bookingId = combinedResponse.data.booking.bookingId
        const book = sessionStorage.setItem('bookingId',bookingId)
          
// Assume you have a function to fetch additional details based on scheduleId
const fetchAdditionalDetails = async (scheduleId) => {
  try {
    const response = await axiosInstance.get(`FlightSchedules/${scheduleId}`);
    const scheduleDetails = response.data;

    // Assuming the API response has properties like sourceAirportId, destinationAirportId, and dateTime
    return {
      sourceAirportId: scheduleDetails.sourceAirportId,
      destinationAirportId: scheduleDetails.destinationAirportId,
      dateTime: scheduleDetails.dateTime,
    };
  } catch (error) {
    console.error('Error fetching additional details:', error);
    throw error; // You might want to handle this error according to your application's requirements
  }
};

// Your existing code
const storedEmail = sessionStorage.getItem('email');
const ticketDetails = existingFlightTickets;

console.log(storedEmail);
console.log(ticketDetails);

if (storedEmail && ticketDetails && ticketDetails.length > 0) {
  // Fetch additional details for each ticket
  const fetchDetailsPromises = ticketDetails.map(async (ticket) => {
    try {
      const additionalDetails = await fetchAdditionalDetails(ticket.scheduleId);
      return {
        seat: ticket.seatNo,
        passengerName: ticket.name,
        age: ticket.age,
        sourceAirport: additionalDetails.sourceAirportId,
        destinationAirport: additionalDetails.destinationAirportId,
        flightDate: additionalDetails.dateTime,
        flightTime: additionalDetails.dateTime.split('T')[1],
      };
    } catch (error) {
      // Handle the error or log it based on your application's requirements
      console.error('Error processing ticket details:', error);
      return null; // Or handle it in a way that fits your needs
    }
  });

  // Wait for all details to be fetched
  const ticketsData = await Promise.all(fetchDetailsPromises);

  // Filter out any null values (tickets where additional details couldn't be fetched)
  const validTicketsData = ticketsData.filter((data) => data !== null);

  const emailData = {
    email: storedEmail,
    tickets: validTicketsData,
  };

  try {
    const response = await axiosInstance.post('Email/send', emailData);
    console.log(response.data); // Log the response from the server

    // You can handle success or further actions here
  } catch (error) {
    console.error('Error sending email:', error);
  }


}

      

        
        
       
        setTimeout(() => {
          navigate('/ticket');
        }, 3000); // Delay in milliseconds

        Object.keys(Cookies.get()).forEach((cookieName) => {
          Cookies.remove(cookieName);
        });

      } else {
        // If the response status is not 200 or 201, handle accordingly
        console.error(combinedResponse.data);
      }

    } catch (error) {
      console.error('Error during confirmation:', error);
      if (error.response) {
        console.error('Error response from server:', error.response.data);
      }
      // Handle the error as needed
    } finally {
      setLoading(false);
    }
  };

  const renderSeats = () => {
    const seatButtons = [];
    const seatsPerRow = 3;

    for (let i = 0; i < seatsData.length; i += seatsPerRow) {
      const rowSeats = seatsData.slice(i, i + seatsPerRow);

      seatButtons.push(
        <div key={`row-${i}`} className="seat-row">
          {rowSeats.map((seat) => (
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
                  handleSeatClick(seat.seatNumber);
                }
              }}
              className={`m-2 ${seat.status === 'Booked' ? 'disabled-seat' : 'seat'}`}
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
              <span className="sr-only">{` ${seat.seatNumber}`}</span>
            </Button>
          ))}
        </div>
      );
    }

    return seatButtons;
  };

  return (
    <>
      <Navbar />
      <ToastContainer />
      <Container className="mt-5">
        <Grid container>
          <Grid item xs={12}>
            <div className="timer-container">
              <Typography variant="body2" className="timer">
                {Math.floor(timer / 60)}:{timer % 60 < 10 ? `0${timer % 60}` : timer % 60}
              </Typography>
              <Typography variant="h2">Select Your Seats</Typography>
            </div>
            <Card sx={{ p: 3, width: '50%', height: '70%', overflow: 'hidden', marginLeft:30, marginRight:80,position: 'relative' }}>
              <div className="flight-container">
              {renderSeats()}
              </div>
            </Card>
            <Button variant="contained" color="primary" onClick={handleConfirm}>
              Confirm Booking
            </Button>
          </Grid>
        </Grid>
        <Dialog open={isModalOpen} onClose={handleCloseModal}>
          <DialogTitle>Booking Details</DialogTitle>
          <DialogContent>
            {/* Display the booking details inside the modal */}
            <Box mb={2}>
              <Typography variant="body1">
                <strong>Booking Type:</strong> {bookingDetails.bookingType}
              </Typography>
            </Box>
            <Box mb={2}>
              <Typography variant="body1">
                <strong>User ID:</strong> {bookingDetails.userId}
              </Typography>
            </Box>

            {bookingDetails && bookingDetails[0] && bookingDetails[0].flightTickets.map((passenger, index) => (
              <Box key={index} mb={2}>
                <DialogContentText>
                  <strong>Seat {passenger.seatNo}:</strong> Passenger Name: {passenger.name}, Age: {passenger.age}
                </DialogContentText>
              </Box>
            ))}

            {/* Add more details as needed */}
          </DialogContent>
          <DialogActions>

            <Button
              variant="contained"
              color="primary"
              onClick={handleConfirmation}

              className="mt-3"
              style={{ marginTop: 1230 }}
            >
              Confirm Booking
            </Button>
            <Button onClick={handleCloseModal} color="primary">
              Close
            </Button>

            {loading && (
              <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                {/* Add your circular progress indicator here */}
                <CircularProgress />
              </div>
            )}
            {/* Add additional actions or buttons if needed */}
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default SeatBooking;