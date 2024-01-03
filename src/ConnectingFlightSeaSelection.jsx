import React, { useState, useEffect } from 'react';
import { Container, Grid, Button, Card, Typography, Paper,CardContent,Modal } from '@mui/material';
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
  const [isModalOpen, setIsModalOpen] = useState(false);

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
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`, // Get the token from localStorage

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

        const scheduleResponse = await axiosInstanceForApiPath.get(`Integration/FlightSchedule/${scheduleId}`, {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
          },
        });        
        
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

        const seatsResponse = await axiosInstanceForApiPath.get(`Integration/seats/${scheduleId}`, {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
          },
        });
    
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
        
          // Check if the seat is already assigned to any passenger
          const existingPassenger = existingFlightTicketss.find((ticket) => ticket.seatNo === seat);
        
          // Check if the seat is already selected in the current iteration
          const seatAlreadySelected = selectedSeatss.slice(0, i).includes(seat);
        
          if (!existingPassenger && !seatAlreadySelected) {
            // Find the first passenger with a null seat number
            const passengerWithNullSeat = existingFlightTicketss.find(
              (passenger) => passenger.seatNo === null
            );
        
            if (passengerWithNullSeat) {
              // Assign the seat to the passenger with a null seat number
              passengerWithNullSeat.seatNo = seat;
            } else {
              // No passenger with a null seat number found, assign the seat to the current passenger
              const currentPassenger = existingFlightTicketss[i];
        
              if (currentPassenger) {
                currentPassenger.seatNo = seat;
              } else {
                console.error('No passenger information found for seat assignment!');
                break; // Exit the loop if no more passengers are available
              }
            }
          }
        }

        Cookies.set(
          isReturnJourney ? 'scheduleIdPassengers' : 'destinationScheduleIdPassengers',
          JSON.stringify(existingFlightTicketss)
        );

        await ChangeSeatStatus(scheduleId2, 'Booked', seatNumbers);
        sessionStorage.setItem(seatNumbers,'seatOffirstflight');


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
          
            // Check if the seat is already assigned to any passenger
            const existingPassenger = existingFlightTickets.find((ticket) => ticket.seatNo === seat);
          
            // Check if the seat is already selected in the current iteration
            const seatAlreadySelected = selectedSeats.slice(0, i).includes(seat);
          
            if (!existingPassenger && !seatAlreadySelected) {
              // Find the first passenger with a null seat number
              const passengerWithNullSeat = existingFlightTickets.find(
                (passenger) => passenger.seatNo === null
              );
          
              if (passengerWithNullSeat) {
                // Assign the seat to the passenger with a null seat number
                passengerWithNullSeat.seatNo = seat;
              } else {
                // No passenger with a null seat number found, assign the seat to the current passenger
                const currentPassenger = existingFlightTickets[i];
          
                if (currentPassenger) {
                  currentPassenger.seatNo = seat;
                } else {
                  console.error('No passenger information found for seat assignment!');
                  break; // Exit the loop if no more passengers are available
                }
              }
            }
          }

          Cookies.set(
            isReturnJourney ? 'destinationScheduleIdPassengers' : 'scheduleIdPassengers',
            JSON.stringify(existingFlightTickets)
          );
          sessionStorage.setItem(seatNumbers2,'seatsOfsecondFlight');

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
          
            // Check if the seat is already assigned to any passenger
            const existingPassenger = existingFlightTickets.find((ticket) => ticket.seatNo === seat);
          
            // Check if the seat is already selected in the current iteration
            const seatAlreadySelected = selectedSeats.slice(0, i).includes(seat);
          
            if (!existingPassenger && !seatAlreadySelected) {
              // Find the first passenger with a null seat number
              const passengerWithNullSeat = existingFlightTickets.find(
                (passenger) => passenger.seatNo === null
              );
          
              if (passengerWithNullSeat) {
                // Assign the seat to the passenger with a null seat number
                passengerWithNullSeat.seatNo = seat;
              } else {
                // No passenger with a null seat number found, assign the seat to the current passenger
                const currentPassenger = existingFlightTickets[i];
          
                if (currentPassenger) {
                  currentPassenger.seatNo = seat;
                } else {
                  console.error('No passenger information found for seat assignment!');
                  break; // Exit the loop if no more passengers are available
                }
              }
            }
          }

          Cookies.set(
            isReturnJourney ? 'destinationScheduleIdPassengers' : 'scheduleIdPassengers',
            JSON.stringify(existingFlightTickets)
          );

          sessionStorage.setItem('partnerSeat',seatNumber3);

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
      navigate('/confirm')

    }


    else {
      console.log('mine')
      setIsModalOpen(true);

      const combinedData = {
        booking: {
          bookingType: 'Oneway', // Assuming you want to set this explicitly for round trips
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
      setIsModalOpen(false);

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
      const storedEmail = sessionStorage.getItem('Email');
      const ticketDetails = combinedResponse.data.ticket;
      
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
      
        console.log(emailData)
        try {
          const response = await axiosInstance.post('Email/send', emailData);
          console.log(response.data); // Log the response from the server
      
          // You can handle success or further actions here
        } catch (error) {
          consol.log(error)
          console.error('Error sending email:', error);
        }
      }

      setTimeout(() => {
        navigate('/ticket');
      }, 3000);
      Cookies.remove('scheduleIdPassengers');
      Cookies.remove('destinationScheduleIdPassengers');
      // Set the confirmed state
      clearSessionStorage();

    }
  }

  const clearSessionStorage = () => {
    // Items to retain
    const retainItems = ['userId', 'token', 'Email', 'username', 'role','bookingId'];
  
    // Iterate through sessionStorage and remove items not in the retainItems list
    for (let key in sessionStorage) {
      if (!retainItems.includes(key)) {
        sessionStorage.removeItem(key);
      }
    }
  };
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
    let combinedSeatCounter = 0;
  
    for (let i = 0; i < seatsData.length; i++) {
      const seat = seatsData[i];
  
      // Check if the seat is part of a combined series
      const isCombinedSeat = seat.seatNumber.endsWith('4-1') || seat.seatNumber.endsWith('7-1');
  
      // Combine A1, A2, A3 and A4, A5, A6 into one row
      if (isCombinedSeat) {
        combinedSeatCounter++;
  
        if (combinedSeatCounter <= 3) {
          // Skip rendering, as it will be combined with the previous seat
          continue;
        } else {
          combinedSeatCounter = 0; // Reset the counter for the next combined series
        }
      }
  
      const marginRight = isCombinedSeat
        ? combinedSeatCounter <= 2
          ? '10px'
          : '2px'
        : i % 6 === 2 || i % 6 === 3
        ? '10px' // Add space for the middle seats in each row
        : '2px';
  
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
          style={{
            backgroundColor:
              selectedSeats.includes(seat.seatNumber)
                ? '#007BFF'
                : seat.status === 'Booked'
                ? '#6C757D'
                : '#28A745', // Green for available seats
            width: isCombinedSeat ? '100px' : 'auto', // Adjust width for combined seats
            marginRight: marginRight, // Adjust margin for combined seats and middle seats
          }}
        >
          <Armchair
            weight={selectedSeats.includes(seat.seatNumber) ? 'bold' : 'regular'}
            color={'#FFFFFF'} // White color for the armchair symbol
            size={isCombinedSeat ? 18 : 24} // Reduce size for combined seats
            className={seat.status === 'Booked' ? 'disabled-armchair' : ''}
          />
          <span className="sr-only">{` ${seat.seatNumber}`}</span>
        </Button>
      );
  
      // Add a line break after every 6 seats
      if ((i + 1) % 6 === 0) {
        seatButtons.push(<br key={`line-break-${i}`} />);
      }
    }
  
    return seatButtons;
  };





  return (
    <Container className="mt-5">
  <Navbar />
  <Grid container style={{ marginTop: 100 }}>
    <Grid item xs={12}>
      <div className="timer-container">
        <Card style={{ position: 'absolute', top: 10, right: 10, backgroundColor: '#ff0000', color: '#fff', marginTop: 100 }}>
          <CardContent>
            <Typography variant="body2" className="timer">
              Time Remaining: {Math.floor(timer / 60)}:{timer % 60 < 10 ? `0${timer % 60}` : timer % 60}
            </Typography>
          </CardContent>
        </Card>
      </div>
      <Typography variant="h2">Select Your Seats - Ongoing</Typography>
      <>
        <Card sx={{ p: 3 }}>

          <div >
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
      <Card sx={{ p: 3, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
        <CardContent sx={{ marginRight: '16px' }}>
          <strong>Selected Seats:</strong> {selectedOngoingSeats.join(', ')}
        </CardContent>

        <CardContent sx={{ marginRight: '16px' }}>
          <strong>Selected Seat Count:</strong> {selectedOngoingSeatCount}
        </CardContent>

        <CardContent>
          <Button onClick={() => handleConfirm('scheduleIdPassengers')}>Select Seats</Button>
        </CardContent>
      </Card>
    </Grid>
    {
      selectedOngoingSeats.length > 0 && (
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
      )
    }
  </Grid>

  {canConfirm && <Button onClick={handleTicketConfirm}>Confirm</Button>}

</Container>

  );
};

export default SeatBooking;
