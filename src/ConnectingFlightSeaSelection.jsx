import React, { useState, useEffect } from 'react';
import { Container, Grid, Button, Card, Typography, Paper } from '@mui/material';
import { Armchair } from 'phosphor-react';
import axiosInstance from './AxiosInstance';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from './Navbar';
import axios from 'axios';
import ConfirmModal from './ConfirmModal';  // Import the ConfirmModal component


const SeatBooking = () => {
  const [selectedOngoingSeats, setSelectedOngoingSeats] = useState([]);
  const [selectedReturnSeats, setSelectedReturnSeats] = useState([]);
  const [selectSecondAirlineReturnSeats, setSelectSecondAirlineReturnSeats] = useState([]);
  const [selectedOngoingSeatCount, setSelectedOngoingSeatCount] = useState(0);
  const [selectedReturnSeatCount, setSelectedReturnSeatCount] = useState(0);
  const [selectedSecondAirlineSeatCount, setSelectedSecondAirlineSeatCount] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [ongoingSeatsData, setOngoingSeatsData] = useState([]);
  const [returnSeatsData, setReturnSeatsData] = useState([]);
  const navigate = useNavigate();
  const [secondFlightSeatData, setSecondFlightSeatData] = useState([]);
  const [timer, setTimer] = useState(10000); // 5 minutes in seconds
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
  const canConfirm =
  JSON.parse(Cookies.get('scheduleIdPassengers') || '[]').every((passenger) => passenger.seatNo !== null) &&
  JSON.parse(Cookies.get('destinationScheduleIdPassengers') || '[]').every((passenger) => passenger.seatNo !== null);



  const handleConfirms = () => {
    setShowConfirmModal(true);
  };

   const handleModalConfirm = async () => {
    // Execute the final confirmation logic here
    setShowConfirmModal(false);
    await handleTicketConfirm();
  };

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
      ChangeSeatStatus2(apiPath, scheduleId2, 'Available', seatNumbers);

      Cookies.remove(); // For clearing all cookies
      navigate('/homepage');
      clearInterval(timerInterval);
    }
  }, [timer]); //this is for  timer 0

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

  const ChangeSeatStatus2 = async (apiPath, scheduleId, status, seatNumbers) => {
    try {
      const axiosInstanceForApiPath = axios.create({
        baseURL: apiPath, // baseURL is the root URL of your API
      });
      const response = await axiosInstanceForApiPath.patch(
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

  useEffect(() => {

    const fetchSeatsData = async (scheduleId, setStateCallback, isReturnFlight) => {
      try {
        const scheduleResponse = await axiosInstance.get(`Integration/FlightSchedule/${scheduleId}`);

        const sourceId = scheduleResponse.data.sourceAirportId;
        const destinationId = scheduleResponse.data.destinationAirportId;

        if (!isReturnFlight) {
          setSourceId(sourceId);
          setDestinationId(destinationId);
        } else {
          setReturnSourceId(sourceId);
          setReturnDestinationId(destinationId);
        }
        const seatsResponse = await axiosInstance.get(`Integration/seats/${scheduleId}`);
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

    const fetchSecondFlightSeatData = async (apiPath, scheduleId, setStateCallback, isReturnFlight) => {
      try {
        const axiosInstanceForApiPath = axios.create({
          baseURL: apiPath, // baseURL is the root URL of your AI
        });

        console.log(scheduleId)

        const scheduleResponse = await axiosInstanceForApiPath.get(`Integration/FlightSchedule/${scheduleId}`);
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

        const seatsResponse = await axiosInstanceForApiPath.get(`Integration/seats/${scheduleId}`);
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

    if (secondFlightAirlineName) {
      const returnScheduleId = sessionStorage.getItem('desinationScheduleId');
      console.log(returnScheduleId)
      fetchSecondFlightSeatData(apiPath, returnScheduleId, setSecondFlightSeatData, true)
    }
    else {
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


  const handleSeatClick = (seatNumber, isReturnJourney) => {


    if (secondFlightAirlineName) {
    } else {
      console.log('secondFlightAirlineName is falsy or undefined');
    }

    if (!secondFlightAirlineName) {

      const selectedSeatsSetter = isReturnJourney
        ? setSelectedReturnSeats
        : setSelectedOngoingSeats;

      const seatCountSetter = isReturnJourney
        ? setSelectedReturnSeatCount
        : setSelectedOngoingSeatCount;

      const selectedSeats = isReturnJourney
        ? selectedReturnSeats
        : selectedOngoingSeats;

      const ticketCount = parseInt(sessionStorage.getItem('ticketCount'), 5);

      const seatIsSelected = selectedSeats.includes(seatNumber);

      if (seatIsSelected) {
        // Deselect the seat if it's already selected
        selectedSeatsSetter((prevSelectedSeats) =>
          prevSelectedSeats.filter((seat) => seat !== seatNumber)
        );
      } else {
        // Select the seat if it's not selected and the limit is not reached
        if (selectedSeats.length < ticketCount) {
          const updatedSelectedSeats = [...selectedSeats, seatNumber];
          selectedSeatsSetter(updatedSelectedSeats);
          seatCountSetter(updatedSelectedSeats.length);
        } else {
          console.log(`You can select up to ${ticketCount} seats.`);
        }
      }

    }

    else {
      const selectedSecondAirlineSeatsSetter = isReturnJourney
        ? setSelectSecondAirlineReturnSeats
        : setSelectedOngoingSeats;

      const seatCountSetter = isReturnJourney
        ? setSelectedSecondAirlineSeatCount
        : setSelectedOngoingSeatCount;

      const selectedSeats = isReturnJourney
        ? selectSecondAirlineReturnSeats
        : selectedOngoingSeats;

      const ticketCount = parseInt(sessionStorage.getItem('ticketCount'), 5);
      const seatIsSelected = selectedSeats.includes(seatNumber);

      if (seatIsSelected) {
        // Deselect the seat if it's already selected
        selectedSecondAirlineSeatsSetter((prevSelectedSeats) =>
          prevSelectedSeats.filter((seat) => seat !== seatNumber)
        );
      } else {
        // Select the seat if it's not selected and the limit is not reached
        if (selectedSeats.length < ticketCount) {
          const updatedSelectedSeats = [...selectedSeats, seatNumber];
          selectedSecondAirlineSeatsSetter(updatedSelectedSeats);
          seatCountSetter(updatedSelectedSeats.length);
        } else {
          console.log(`You can select up to ${ticketCount} seats.`);
        }
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
        if (!secondFlightAirlineName) {
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
    }
  };

  const handleTicketConfirm = async () => {

    if (secondFlightAirlineName) {
      const combinedData = {
        booking: {
          bookingType: 'Single',
          userId: sessionStorage.getItem('userId'),
          status: 'Booked',
        },
        flightTickets: [
          ...JSON.parse(Cookies.get('scheduleIdPassengers') || '[]'),
        ].filter((passenger) => passenger.seatNo !== null),
        connectionFlightTickets: [
          ...JSON.parse(Cookies.get('destinationScheduleIdPassengers') || '[]'),
        ].filter((passenger) => passenger.seatNo !== null),
      };

      console.log('Combined Data:', combinedData);

      try {
        const combinedResponse = await axiosInstance.post('HomePage/CreateBooking', combinedData);
        console.log('Combined Response:', combinedResponse);

        const partner = combinedResponse.data.message;
        console.log('Partner:', partner);

        const partnerBookings = combinedResponse.data.ticket
        console.log(partnerBookings)
        console.log(partnerBookings[0].ticketNo)

        if (partner === 'Partner Booking') {
          const apiPath = sessionStorage.getItem('secondFlightApiPath');
          console.log('API Path:', apiPath);

          const axiosInstanceForApiPath = axios.create({
            baseURL: apiPath,

          });

          const Id = combinedResponse.data.booking.bookingId;
          console.log('Booking ID:', Id);

          const partnerBooking = combinedResponse.data.ticket;


          if (Array.isArray(partnerBooking) && partnerBooking.length > 0) {
            const transformedPassengers = partnerBooking.map((passenger) => ({
              name: passenger.name,
              age: passenger.age,
              gender: passenger.gender,
              seatNo: passenger.seatNo,
              airlineName: "SanjayAirline",
              flightName: passenger.flightName,
              sourceAirportId: passenger.sourceAirportId,
              destinationAirportId: passenger.destinationAirportId,
              dateTime: passenger.dateTime,
              status: 'Booked',
              bookingId: Id,
              ticketNo: passenger.ticketNo,
            }));

            console.log("sa",transformedPassengers);

            sessionStorage.setItem('bookingId', Id);

            const url = '/Integration/partnerbooking'; // Add a leading slash if needed
            const secondApiResponse = await axiosInstanceForApiPath.post(
              url,
              transformedPassengers
            );

            console.log('Second API Response:', secondApiResponse);

            toast.success("Booking Successful");

            // Show success toast after a delay
            setTimeout(() => {
              navigate('/ticket');
            }, 3000); // Delay in milliseconds


            Object.keys(Cookies.get()).forEach((cookieName) => {
              Cookies.remove(cookieName);
            });

            const keysToPreserve = ['token', 'Email', 'userId', 'userName', 'role'];

  // Get all keys from the session storage
  const allKeys = Object.keys(sessionStorage);

  // Iterate through the keys
  allKeys.forEach((key) => {
    // Check if the key should be preserved
    if (!keysToPreserve.includes(key)) {
      // If not, remove the item from session storage
      sessionStorage.removeItem(key);
    }
  });

          }
        }


        console.log('Booking, FlightTicket, and FlightSeat created successfully');
      } catch (error) {
        console.log(error)
        console.error('Combined API Error:', error.response);
        // Handle error as needed
      }
    }


    else {
      console.log('mine')
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
      const combinedResponse = await axiosInstance.post('Bookings/CreateBooking', combinedData);

      console.log('Combined Response:', combinedResponse.data);

      // Perform actions based on the combined response if needed
      console.log('Booking, FlightTicket, and FlightSeat created successfully');

      toast.success("Booking Made Successfully")

      const bookingId = combinedResponse.data.booking.bookingId;
      console.log(bookingId);

      sessionStorage.setItem("bookingId", bookingId)



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
      }, 3000);
      Cookies.remove('singleJourneyTickets');
      Cookies.remove('returnJourneyTickets');
      // Set the confirmed state
    }
  }

  // const renderSeats = (seatsData, selectedSeats, handleSeatClick, isEditing, isReturnJourney) => {
  //   const seatButtons = [];

  //   // Define the number of seats per row
  //   const seatsPerRow = 6;

  //   for (let i = 0; i < seatsData.length; i += seatsPerRow) {
  //     const rowSeats = seatsData.slice(i, i + seatsPerRow);

  //     const rowButtons = rowSeats.map((seat) => (
  //       <Button
  //         key={seat.seatNumber}
  //         variant={
  //           selectedSeats.includes(seat.seatNumber)
  //             ? 'success'
  //             : seat.status === 'Booked'
  //               ? 'secondary'
  //               : 'light'
  //         }
  //         onClick={() => {
  //           if (seat.status !== 'Booked') {
  //             isEditing
  //               ? handleSeatClickEditable(seat.seatNumber, isReturnJourney)
  //               : handleSeatClick(seat.seatNumber, isReturnJourney);
  //           }
  //         }}
  //         className={`m-2 ${seat.status === 'Booked' ? 'disabled-seat' : ''}`}
  //         disabled={seat.status === 'Booked'}
  //       >
  //         <Armchair
  //           weight={selectedSeats.includes(seat.seatNumber) ? 'bold' : 'regular'}
  //           color={
  //             selectedSeats.includes(seat.seatNumber)
  //               ? '#007BFF'
  //               : seat.status === 'Booked'
  //                 ? '#6C757D'
  //                 : '#6C757D'
  //           }
  //           size={24}
  //           className={seat.status === 'Booked' ? 'disabled-armchair' : ''}
  //         />
  //         <span className="sr-only">{`Seat ${seat.seatNumber}`}</span>
  //       </Button>
  //     ));

  //     seatButtons.push(
  //       <div key={`row-${i / seatsPerRow}`} className="d-flex justify-content-center">
  //         {rowButtons}
  //       </div>
  //     );
  //   }

  //   return seatButtons;
  // };

  const renderSeats = (seatsData, selectedSeats, handleSeatClick, isEditing, isReturnJourney) => {
    const seatButtons = [];

    // Define the number of seats per row
    const seatsPerRow = 6;

    for (let i = 0; i < seatsData.length; i += seatsPerRow) {
      const rowSeats = seatsData.slice(i, i + seatsPerRow);

      const rowButtons = rowSeats.map((seat) => (
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
      ));

      seatButtons.push(
        <div key={`row-${i / seatsPerRow}`} className="d-flex justify-content-center">
          {rowButtons}
        </div>
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

              <div>
                <Typography variant="h5">Source to Connecting</Typography>
                <Typography variant="h5" className="mt-3">
                  <strong>Source ID:</strong> {sourceId}
                  <span style={{ marginLeft: '10px' }}>
                    <strong>Destination ID:</strong> {destinationId}
                  </span>
                </Typography>
              </div>
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
                <div>
                  <Typography variant="h5">Source to Connecting</Typography>
                  <Typography variant="h5" className="mt-3">
                    <strong>Source ID:</strong> {sourceId}
                    <span style={{ marginLeft: '10px' }}>
                      <strong>Destination ID:</strong> {destinationId}
                    </span>
                  </Typography>
                </div>
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
                <div>
                  <Typography variant="h5">Source to Connecting</Typography>
                  <Typography variant="h5" className="mt-3">
                    <strong>Source ID:</strong> {sourceId}
                    <span style={{ marginLeft: '10px' }}>
                      <strong>Destination ID:</strong> {destinationId}
                    </span>
                  </Typography>
                </div>
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
                  <strong>Selected Seat Count:</strong> {selectedSecondAirlineSeatCount}
                </Typography>

                <Button onClick={() => handleConfirm('destinationScheduleIdPassengers')}>Select Seats</Button>

              </Paper>
            </Grid>
          )
        }

      </Grid>



      {canConfirm && <Button onClick={handleTicketConfirm}>Confirm</Button>}

    </Container>
  );
};

export default SeatBooking;
