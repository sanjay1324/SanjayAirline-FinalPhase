// import React, { useState, useEffect } from 'react';
// import { Container, Grid, Button, Card, Typography, Paper, Dialog, DialogTitle, DialogContent, DialogActions, Box } from '@mui/material';
// import { Armchair } from 'phosphor-react';
// import axiosInstance from './AxiosInstance';
// import Cookies from 'js-cookie';
// import { useNavigate } from 'react-router-dom';
// import Navbar from './Navbar';

// const SeatBooking = () => {
//   const [selectedOngoingSeats, setSelectedOngoingSeats] = useState([]);
//   const [selectedReturnSeats, setSelectedReturnSeats] = useState([]);
//   const [isConfirmed, setConfirmed] = useState(false);
//   const [ongoingSeatsData, setOngoingSeatsData] = useState([]);
//   const [returnSeatsData, setReturnSeatsData] = useState([]);
//   const [timer, setTimer] = useState(300); // 5 minutes in seconds
//   const navigate = useNavigate();
//   const [isEditing, setIsEditing] = useState(false);
//   const [editedOngoingSeats, setEditedOngoingSeats] = useState([]);
//   const [editedReturnSeats, setEditedReturnSeats] = useState([]);
//   const [showSecondJourney, setShowSecondJourney] = useState(false);

//   const [isPassengerDetailsModalOpen, setPassengerDetailsModalOpen] = useState(false);
//   const [selectedPassengerDetails, setSelectedPassengerDetails] = useState([]);



//   useEffect(() => {
//     const fetchSeatsData = async (scheduleId, setStateCallback) => {
//       try {
//         const response = await axiosInstance.get(`Seats/GetSeatsByScheduleId/${scheduleId}`);
//         const seatsWithStatus = response.data.map((seat) => ({ ...seat }));
//         setStateCallback(seatsWithStatus);
//       } catch (error) {
//         console.error('Error fetching seats data:', error);
//       }
//     };

//     // Fetch ongoing seats data after the component mounts
//     const ongoingScheduleId = sessionStorage.getItem('desinationScheduleId');
//     fetchSeatsData(ongoingScheduleId, setOngoingSeatsData);

//     // Fetch return seats data after the ongoing seats data is fetched
//     const returnScheduleId = sessionStorage.getItem('returnScheduleId');
//     if (returnScheduleId) {
//       fetchSeatsData(returnScheduleId, setReturnSeatsData);
//     }
//   }, []);

//   const handleViewPassengerDetails = (seatNumbers) => {
//     const singleJourneyTickets = JSON.parse(Cookies.get('singleJourneyTickets') || '[]');
//     const returnJourneyTickets = JSON.parse(Cookies.get('returnJourneyTickets') || '[]');
  
//     const allFlightTickets = [...singleJourneyTickets, ...returnJourneyTickets];
  
//     const passengers = allFlightTickets.filter((passenger) => seatNumbers.includes(passenger.seatNo));
  
//     if (passengers.length > 0) {
//       setSelectedPassengerDetails(passengers);
//       setPassengerDetailsModalOpen(true);
//     } else {
//       setSelectedPassengerDetails(null);
//       setPassengerDetailsModalOpen(false);
//     }
//   };
  
  
  

//   useEffect(() => {
//     const timerInterval = setInterval(() => {
//       setTimer((prevTimer) => prevTimer - 1);
//     }, 1000);

//     return () => {
//       clearInterval(timerInterval);
//     };
//   }, []);

//   useEffect(() => {
//     if (timer === 0) {
//       Cookies.remove(); // For clearing all cookies
//       navigate('/homepage');
//     }
//   }, [timer]);

//   const handleEdit = () => {
//     setIsEditing(true);
//     setEditedOngoingSeats([...selectedOngoingSeats]);
//     setEditedReturnSeats([...selectedReturnSeats]);
//   };

//   const handleSaveEdits = () => {
//     setIsEditing(false);
//     setSelectedOngoingSeats([...editedOngoingSeats]);
//     setSelectedReturnSeats([...editedReturnSeats]);
//   };

//   const handleSeatClickEditable = (seatNumber, isReturnJourney) => {
//     const editedSeatsSetter = isReturnJourney
//       ? setEditedReturnSeats
//       : setEditedOngoingSeats;

//     const editedSeats = isReturnJourney ? editedReturnSeats : editedOngoingSeats;

//     const editedSeatsCopy = [...editedSeats];

//     if (editedSeatsCopy.includes(seatNumber)) {
//       editedSeatsCopy.splice(editedSeatsCopy.indexOf(seatNumber), 1);
//     } else {
//       editedSeatsCopy.push(seatNumber);
//     }

//     editedSeatsSetter(editedSeatsCopy);
//   };

//   const handleSeatClick = (seatNumber, isReturnJourney) => {
//     const selectedSeatsSetter = isReturnJourney
//       ? setSelectedReturnSeats
//       : setSelectedOngoingSeats;

//     const editedSeatsSetter = isReturnJourney
//       ? setEditedReturnSeats
//       : setEditedOngoingSeats;

//     const selectedSeats = isReturnJourney ? selectedReturnSeats : selectedOngoingSeats;

//     if (selectedSeats.includes(seatNumber)) {
//       selectedSeatsSetter(selectedSeats.filter((seat) => seat !== seatNumber));
//     } else {
//       selectedSeatsSetter([...selectedSeats, seatNumber]);
//     }
//   };

//   const handleConfirm = async (status) => {
//     try {
//       const isReturnJourney = !!sessionStorage.getItem('desinationScheduleId');

//       if (status === 'singleJourneyTickets') {
//         const selectedSeats = isReturnJourney ? selectedOngoingSeats : selectedReturnSeats;

//         const existingFlightTickets = JSON.parse(
//           Cookies.get('singleJourneyTickets') || '[]'
//         );

//         for (let i = 0; i < selectedSeats.length; i++) {
//           const seat = selectedSeats[i];

//           if (!existingFlightTickets.some((ticket) => ticket.seatNo === seat)) {
//             const passengerIndex = existingFlightTickets.findIndex(
//               (passenger) => passenger.seatNo === null
//             );

//             if (passengerIndex !== -1) {
//               existingFlightTickets[passengerIndex].seatNo = seat;
//             } else {
//               console.error('No passenger information found for seat assignment!');
//             }
//           }
//         }

//         Cookies.set('singleJourneyTickets', JSON.stringify(existingFlightTickets));

//         // Set the flag to show the second journey if seats for the first journey are selected
//         if (selectedOngoingSeats.length > 0) {
//           setShowSecondJourney(true);
//         }
//       } else {
//         const selectedSeats = isReturnJourney ? selectedReturnSeats : selectedOngoingSeats;

//         const existingFlightTickets = JSON.parse(
//           Cookies.get(isReturnJourney ? 'returnJourneyTickets' : 'singleJourneyTickets') || '[]'
//         );

//         for (let i = 0; i < selectedSeats.length; i++) {
//           const seat = selectedSeats[i];

//           if (!existingFlightTickets.some((ticket) => ticket.seatNo === seat)) {
//             const passengerIndex = existingFlightTickets.findIndex(
//               (passenger) => passenger.seatNo === null
//             );

//             if (passengerIndex !== -1) {
//               existingFlightTickets[passengerIndex].seatNo = seat;
//             } else {
//               console.log('No passenger information found for seat assignment!');
//             }
//           }
//         }

//         Cookies.set(
//           isReturnJourney ? 'returnJourneyTickets' : 'singleJourneyTickets',
//           JSON.stringify(existingFlightTickets)
//         );
//       }
//     } catch (error) {
//       console.error('Error during confirmation:', error);
//       if (error.response) {
//         console.error('Error response from server:', error.response.data);
//       }
//     }
//   };

//   const handleFinalConfirm = async () => {
//     const combinedData = {
//       booking: {
//         bookingType: 'RoundTrip',
//         userId: sessionStorage.getItem('userId'),
//         status: 'Booked',
//       },
//       flightTickets: [
//         ...JSON.parse(Cookies.get('singleJourneyTickets') || '[]'),
//         ...JSON.parse(Cookies.get('returnJourneyTickets') || '[]'),
//       ].filter((passenger) => passenger.seatNo !== null),
//     };

//     const combinedResponse = await axiosInstance.post('Bookings/CreateBooking', combinedData);

//     console.log(combinedResponse.data)
//     sessionStorage.setItem('bookingId', combinedResponse.data.booking.bookingId);

//     setTimeout(() => {
//               navigate('/ticket');
//             }, 3000);

//     setConfirmed(true);
//   };

//   const ChangeSeatStatus = async (scheduleId, status, seatNumbers) => {
//     try {
//       const response = await axiosInstance.put(
//         `Bookings/${scheduleId}/${status}`,
//         JSON.stringify(seatNumbers),
//         {
//           headers: {
//             'Content-Type': 'application/json',
//           },
//         }
//       );
//       console.log(response);
//       return response.data;
//     } catch (error) {
//       console.error(error);
//       throw error;
//     }
//   };

//   const renderSeats = (seatsData, selectedSeats, handleSeatClick, isEditing, isReturnJourney) => {
//     const seatButtons = [];
//     let combinedSeatCounter = 0;
  
//     for (let i = 0; i < seatsData.length; i++) {
//       const seat = seatsData[i];
  
//       // Check if the seat is part of a combined series
//       const isCombinedSeat = seat.seatNumber.endsWith('4-1') || seat.seatNumber.endsWith('7-1');
  
//       // Combine A1, A2, A3 and A4, A5, A6 into one row
//       if (isCombinedSeat) {
//         combinedSeatCounter++;
  
//         if (combinedSeatCounter <= 3) {
//           // Skip rendering, as it will be combined with the previous seat
//           continue;
//         } else {
//           combinedSeatCounter = 0; // Reset the counter for the next combined series
//         }
//       }
  
//       const marginRight = isCombinedSeat
//         ? combinedSeatCounter <= 2
//           ? '10px'
//           : '2px'
//         : i % 6 === 2 || i % 6 === 3
//         ? '10px' // Add space for the middle seats in each row
//         : '2px';
  
//       seatButtons.push(
//         <Button
//           key={seat.seatNumber}
//           variant={
//             selectedSeats.includes(seat.seatNumber)
//               ? 'success'
//               : seat.status === 'Booked'
//               ? 'secondary'
//               : 'light'
//           }
//           onClick={() => {
//             if (seat.status !== 'Booked') {
//               isEditing
//                 ? handleSeatClickEditable(seat.seatNumber, isReturnJourney)
//                 : handleSeatClick(seat.seatNumber, isReturnJourney);
//             }
//           }}
//           className={`m-2 ${seat.status === 'Booked' ? 'disabled-seat' : ''}`}
//           disabled={seat.status === 'Booked'}
//           style={{
//             backgroundColor:
//               selectedSeats.includes(seat.seatNumber)
//                 ? '#007BFF'
//                 : seat.status === 'Booked'
//                 ? '#6C757D'
//                 : '#28A745', // Green for available seats
//             width: isCombinedSeat ? '100px' : 'auto', // Adjust width for combined seats
//             marginRight: marginRight, // Adjust margin for combined seats and middle seats
//           }}
//         >
//           <Armchair
//             weight={selectedSeats.includes(seat.seatNumber) ? 'bold' : 'regular'}
//             color={'#FFFFFF'} // White color for the armchair symbol
//             size={isCombinedSeat ? 18 : 24} // Reduce size for combined seats
//             className={seat.status === 'Booked' ? 'disabled-armchair' : ''}
//           />
//           <span className="sr-only">{` ${seat.seatNumber}`}</span>
//         </Button>
//       );
  
//       // Add a line break after every 6 seats
//       if ((i + 1) % 6 === 0) {
//         seatButtons.push(<br key={`line-break-${i}`} />);
//       }
//     }
  
//     return seatButtons;
//   };
  
//   return (
//     <>
//       <Container className="mt-5">
//         <Navbar />
//         <Grid container>
//           <Grid item xs={12}>
//             <Typography variant="h2">Select Your Seats - Ongoing</Typography>
//             <>
//               <Card sx={{ p: 3 }}>
//                 {renderSeats(
//                   ongoingSeatsData,
//                   isEditing ? editedOngoingSeats : selectedOngoingSeats,
//                   handleSeatClick,
//                   isEditing,
//                   false
//                 )}
//               </Card>
//             </>
//             <Paper sx={{ p: 3 }}>
//               <Typography variant="div" className="mt-3">
//                 <strong>Selected Seats:</strong> {selectedOngoingSeats.join(', ')}
//               </Typography>
//               <Button onClick={() => handleConfirm('singleJourneyTickets')}>Select Seats</Button>
//             </Paper>
//           </Grid>
//           {showSecondJourney && (
//             <Grid item xs={12} className="mt-5">
//               <Typography variant="h2">Select Your Seats - Return</Typography>
//               <Card sx={{ p: 3 }}>
//                 {renderSeats(
//                   returnSeatsData,
//                   selectedReturnSeats,
//                   handleSeatClick,
//                   false,
//                   true
//                 )}
//               </Card>
//               <Typography variant="div" className="mt-3">
//                 <strong>Selected Seats:</strong> {selectedReturnSeats.join(', ')}
//               </Typography>
//               <Button onClick={() => handleConfirm('returnJourneyTickets')}>Select Seats</Button>
//             </Grid>
//           )}
//         </Grid>
//         <Button onClick={() => handleViewPassengerDetails([...selectedOngoingSeats, ...selectedReturnSeats], false)}>
//   View Passenger Details
// </Button>



//       {/* Add the passenger details modal */}
//       <Dialog open={isPassengerDetailsModalOpen} onClose={() => setPassengerDetailsModalOpen(false)}>
//         <DialogTitle>Passenger Details</DialogTitle>
//         <DialogContent>
//           {selectedPassengerDetails.map((passenger, index) => (
//             <Box key={index}>
//               <Typography variant="body1">
//                 <strong>Seat Number:</strong> {passenger.seatNo}
//               </Typography>
//               <Typography variant="body1">
//                 <strong>Name:</strong> {passenger.name}
//               </Typography>
//               {/* Add more details as needed */}
//               {index < selectedPassengerDetails.length - 1 && <hr />} {/* Add a horizontal line between passengers */}
//             </Box>
//           ))}
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => handleFinalConfirm()}>Confirm</Button>
//           <Button onClick={() => setPassengerDetailsModalOpen(false)}>Close</Button>
//         </DialogActions>
//       </Dialog>
//       </Container>
//     </>
//   );
// };

// export default SeatBooking;


import React, { useState, useEffect } from 'react';
import { Container, Grid, Button, Card, Typography, Paper, Dialog, DialogTitle, DialogContent, DialogActions, Box } from '@mui/material';
import { Armchair } from 'phosphor-react';
import axiosInstance from './AxiosInstance';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from './Navbar';

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
  const [showSecondJourney, setShowSecondJourney] = useState(false);

  const [isPassengerDetailsModalOpen, setPassengerDetailsModalOpen] = useState(false);
  const [selectedPassengerDetails, setSelectedPassengerDetails] = useState([]);



  useEffect(() => {
    const booked = sessionStorage.getItem('isBooked');

    if (booked === 'true') {
      // Clear the 'isBooked' flag to allow access on the next visit
      sessionStorage.removeItem('isBooked');

      // Replace the current entry in the history stack with '/ticket'
      navigate('/ticket', { replace: true });

      // Prevent going back in browser history
      window.history.pushState(null, '', '/ticket');

      // Listen for changes to the history state and handle the back button
      const handlePopState = () => {
        // Replace the current entry again to block going back
        window.history.pushState(null, '', '/ticket');
      };

      // Attach the event listener
      window.addEventListener('popstate', handlePopState);

      // Clean up the event listener on component unmount
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [navigate]);
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

  const handleViewPassengerDetails = (seatNumbers) => {
    const singleJourneyTickets = JSON.parse(Cookies.get('singleJourneyTickets') || '[]');
    const returnJourneyTickets = JSON.parse(Cookies.get('returnJourneyTickets') || '[]');
  
    const allFlightTickets = [...singleJourneyTickets, ...returnJourneyTickets];
  
    const passengers = allFlightTickets.filter((passenger) => seatNumbers.includes(passenger.seatNo));
  
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

  const handleSaveEdits = () => {
    setIsEditing(false);
    setSelectedOngoingSeats([...editedOngoingSeats]);
    setSelectedReturnSeats([...editedReturnSeats]);
  };

  const handleSeatClickEditable = (seatNumber, isReturnJourney) => {
    const editedSeatsSetter = isReturnJourney
      ? setEditedReturnSeats
      : setEditedOngoingSeats;

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

    const selectedSeats = isReturnJourney ? selectedReturnSeats : selectedOngoingSeats;

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
        const selectedSeats = isReturnJourney ? selectedOngoingSeats : selectedReturnSeats;

        const existingFlightTickets = JSON.parse(
          Cookies.get('singleJourneyTickets') || '[]'
        );

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

  // const renderSeats = (seatsData, selectedSeats, handleSeatClick, isEditing, isReturnJourney) => {
  //   const seatButtons = [];

  //   for (let i = 0; i < seatsData.length; i++) {
  //     const seat = seatsData[i];
  //     seatButtons.push(
  //       <Button
  //         key={seat.seatNumber}
  //         variant={
  //           selectedSeats.includes(seat.seatNumber)
  //             ? 'failed'
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
