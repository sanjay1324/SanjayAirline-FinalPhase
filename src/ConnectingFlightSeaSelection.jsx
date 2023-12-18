import React, { useState, useEffect } from 'react';
import { Container, Grid, Button, Card, Typography, Paper } from '@mui/material';
import { Armchair } from 'phosphor-react';
import axiosInstance from './AxiosInstance';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from './Navbar';
import axios from 'axios';

const SeatBooking = () => {
  const [selectedOngoingSeats, setSelectedOngoingSeats] = useState([]);
  const [selectedReturnSeats, setSelectedReturnSeats] = useState([]);
  const [selectSecondAirlineReturnSeats, setSelectSecondAirlineReturnSeats] = useState([]);
  const [selectedOngoingSeatCount, setSelectedOngoingSeatCount] = useState(0);
  const [selectedReturnSeatCount, setSelectedReturnSeatCount] = useState(0);
  const [ongoingSeatsData, setOngoingSeatsData] = useState([]);
  const [returnSeatsData, setReturnSeatsData] = useState([]);
  const navigate = useNavigate();
  const [secondFlightSeatData, setSecondFlightSeatData] = useState([]);
  const [timer, setTimer] = useState(300); // 5 minutes in seconds
  const [timerInterval, setTimerInterval] = useState(null);
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
  const seatNumber3 = selectSecondAirlineReturnSeats;
  const secondFlightAirlineName = sessionStorage.getItem('secondFlightAirlineName');
  const apiPath = sessionStorage.getItem('secondFlightApiPath');


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
  }, [timer]);  //this is for timer

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
  }, [timer]); //this is for  timer 0

  const ChangeSeatStatus = async (scheduleId, status, seatNumbers) => {
    try {
      const response = await axiosInstance.patch(
        `Integration/Integration/${scheduleId}/${status}`,
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

  const ChangeSeatStatus2 = async (apiPath, scheduleId, status, seatNumbers) => {
    try {
      const axiosInstanceForApiPath = axios.create({
        baseURL: apiPath, // baseURL is the root URL of your API
      });
      const response = await axiosInstanceForApiPath.patch(
        `Integration/${scheduleId}/${status}`,
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

    const fetchSecondFlightSeatData = async (apiPath, setStateCallback, isReturnFlight) => {
      try {
        const axiosInstanceForApiPath = axios.create({
          baseURL: apiPath, // baseURL is the root URL of your API
        });

        const scheduleResponse = await axiosInstanceForApiPath.get(`FlightSchedules/${scheduleId}`);
        console.log(scheduleResponse)

        const sourceId = scheduleResponse.data.sourceAirportId;
        const destinationId = scheduleResponse.data.destinationAirportId;

        if (!isReturnFlight) {
          setSourceId(sourceId);
          setDestinationId(destinationId);
        } else {
          setReturnSourceId(sourceId);
          setReturnDestinationId(destinationId);
        }

        const seatsResponse = await axiosInstanceForApiPath.get(`Seats/ByScheduleId/${scheduleId}`);
        const seatsWithStatus = seatsResponse.data.map((seat) => ({
          ...seat,
          sourceId,
          destinationId,
        }));

        console.log(seatsResponse)
        setStateCallback(seatsWithStatus);
      } catch (error) {
        console.error('Error fetching seats data:', error);
      }
    };


    const ongoingScheduleId = sessionStorage.getItem('scheduleId');
    console.log(ongoingScheduleId)
    console.log(secondFlightAirlineName)

    if (!secondFlightAirlineName) {
      fetchSecondFlightSeatData(apiPath, setSecondFlightSeatData, true)
    } else {
      const returnScheduleId = sessionStorage.getItem('desinationScheduleId');
console.log(returnScheduleId)
      if (returnScheduleId) {
        console.log("true")
        fetchSeatsData(returnScheduleId, setReturnSeatsData, true);
      } else {
        console.log("false")
      }
    }
    // Fetch seats data for the ongoing leg of the connecting flight
    fetchSeatsData(ongoingScheduleId, setOngoingSeatsData);
    // Fetch seats data for the return leg of the connecting flight (if applicable)

  }, []);

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

    if (secondFlightAirlineName) {

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

      const ticketCount = parseInt(sessionStorage.getItem('ticketCount'), 5);

      if (selectedSeats.length < ticketCount || selectedSeats.includes(seatNumber)) {
        const updatedSelectedSeats = [...selectedSeats, seatNumber];
        selectedSeatsSetter(updatedSelectedSeats);
        seatCountSetter(updatedSelectedSeats.length);
      } else {
        console.log(`You can select up to ${ticketCount} seats.`);
      }
    }

    else {
      const selectedSecondAirlineSeatsSetter = isReturnJourney
        ? setSelectSecondAirlineReturnSeats
        : setSelectedOngoingSeats;

      const seatCountSetter = isReturnJourney
        ? setSelectedReturnSeatCount
        : setSelectedOngoingSeatCount;

      const selectedSeats = isReturnJourney
        ? selectedReturnSeats
        : selectedOngoingSeats;

      const ticketCount = parseInt(sessionStorage.getItem('ticketCount'), 5);

      if (selectedSeats.length < ticketCount || selectedSeats.includes(seatNumber)) {
        const updatedSelectedSeats = [...selectedSeats, seatNumber];
        selectedSecondAirlineSeatsSetter(updatedSelectedSeats);
        seatCountSetter(updatedSelectedSeats.length);
      } else {
        console.log(`You can select up to ${ticketCount} seats.`);
      }
    }


  };


  const handleConfirm = async (status) => {
    try {
      const isReturnJourney = !!sessionStorage.getItem('desinationScheduleId');


      if (status === 'scheduleIdPassengers') {
        const selectedSeatss = isReturnJourney ? selectedOngoingSeats : selectedReturnSeats; //going
        console.log(selectedSeatss)

        const existingFlightTicketss = JSON.parse(
          Cookies.get('scheduleIdPassengers') || '[]'
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
          isReturnJourney ? 'scheduleIdPassengers' : 'destinationScheduleIdPassengers',
          JSON.stringify(existingFlightTicketss)
        );

        await ChangeSeatStatus(scheduleId2, 'Booked', seatNumbers);


      }


      else {

        console.log(secondFlightAirlineName)
        if (secondFlightAirlineName) {
          const selectedSeats = isReturnJourney ? selectedReturnSeats : selectedOngoingSeats; //return
          console.log(selectedSeats)

          const existingFlightTickets = JSON.parse(
            Cookies.get(isReturnJourney ? 'destinationScheduleIdPassengers' : 'scheduleIdPassengers') || '[]'
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
            isReturnJourney ? 'destinationScheduleIdPassengers' : 'scheduleIdPassengers',
            JSON.stringify(existingFlightTickets)
          );
          await ChangeSeatStatus(scheduleId, 'Booked', seatNumbers2);


        } 
        else {
          const selectedSeats = isReturnJourney ? selectSecondAirlineReturnSeats : selectedOngoingSeats; //return
          console.log(selectedSeats)

          const existingFlightTickets = JSON.parse(
            Cookies.get(isReturnJourney ? 'destinationScheduleIdPassengers' : 'scheduleIdPassengers') || '[]'
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
            isReturnJourney ? 'destinationScheduleIdPassengers' : 'scheduleIdPassengers',
            JSON.stringify(existingFlightTickets)
          );

          await ChangeSeatStatus2(apiPath, scheduleId, 'Booked', seatNumber3);
        }



      }
    }

    catch (error) {
      console.error('Error during confirmation:', error);
      // Log the detailed error response
      if (error.response) {
        console.error('Error response from server:', error.response.data);
      }
      // Handle the error as needed
    }
  };

  const handleTicketConfirm =  () =>{


    if(secondFlightAirlineName){


      const combinedData = {
        booking: {
          bookingType: 'Single', // Assuming you want to set this explicitly for round trips
          userId: sessionStorage.getItem('userId'),
          status: 'Booked',
        },
        flightTickets: [
          ...JSON.parse(Cookies.get('scheduleIdPassengers') || '[]'),
        ].filter((passenger) => passenger.seatNo !== null),
        connectionFlightTickets:[
          ...JSON.parse(Cookies.get('destinationScheduleIdPassengers') || '[]'),
        ].filter((passenger) => passenger.seatNo !== null),
      };

      console.log(combinedData)


      // Assuming that axiosInstance.post is asynchronous
      const combinedResponse =  axiosInstance.post('HomePage/CreateBooking', combinedData);

      console.log('Combined Response:', combinedResponse.data);

      // Perform actions based on the combined response if needed
      console.log('Booking, FlightTicket, and FlightSeat created successfully');

      // Cookies.remove('singleJourneyTickets');
      // Cookies.remove('returnJourneyTickets');
      // Set the confirmed state
    }else{
      const combinedData = {
        booking: {
          bookingType: 'Single', // Assuming you want to set this explicitly for round trips
          userId: sessionStorage.getItem('userId'),
          status: 'Booked',
        },
        flightTickets: [
          ...JSON.parse(Cookies.get('scheduleIdPassengers') || '[]'),
          ...JSON.parse(Cookies.get('destinationScheduleIdPassengers') || '[]'),
        ].filter((passenger) => passenger.seatNo !== null),
      };

      console.log(combinedData)

      // Assuming that axiosInstance.post is asynchronous
      const combinedResponse =  axiosInstance.post('Bookings/CreateBooking', combinedData);

      console.log('Combined Response:', combinedResponse.data);

      // Perform actions based on the combined response if needed
      console.log('Booking, FlightTicket, and FlightSeat created successfully');

      // Cookies.remove('singleJourneyTickets');
      // Cookies.remove('returnJourneyTickets');
      // Set the confirmed state
    }
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

            <Button onClick={() => handleConfirm('scheduleIdPassengers')}>Select Seats</Button>


          </Paper>
        </Grid>
        {
          returnSeatsData.length > 0 ? (
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
                <Button onClick={() => handleConfirm('destinationScheduleIdPassengers')}>Select Seats</Button>

              </Paper>
            </Grid>
          ) : (
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
                  secondFlightSeatData, // Use secondFlightSeatData instead of returnSeatsData
                  selectSecondAirlineReturnSeats,
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

                <Button onClick={() => handleConfirm('destinationScheduleIdPassengers')}>Select Seats</Button>

              </Paper>
            </Grid>
          )
        }

      </Grid>


      <Button onClick={handleTicketConfirm}>Confirm</Button>
    </Container>
  );
};

export default SeatBooking;
