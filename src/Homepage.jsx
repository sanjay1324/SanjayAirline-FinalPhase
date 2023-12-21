import React, { useEffect, useState } from 'react';
import {
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';

import { useNavigate } from 'react-router-dom';
import 'react-datepicker/dist/react-datepicker.css';
import axiosInstance from './AxiosInstance';
import Navbar from './Navbar';
import { sanjayairline } from './Constants';
import { airlinesapi } from './Constants'
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';

const BookingComponent = () => {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [bookingType, setBookingType] = useState('Select');
  const [flightSchedules, setFlightSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState([]); // New state to store the list of cities
  const [hasConnectingFlights, setHasConnectingFlights] = useState(false);
  const [date, setDate] = useState('');
  const [finalIntegratedConnectingFlights, setFinalIntegratedConnectingFlights] = useState([]);
  const navigate = useNavigate();

  console.log(finalIntegratedConnectingFlights)

  useEffect(() => {
    // Fetch the list of cities from the API
    const fetchCities = async () => {
      try {
        const response = await axiosInstance.get('Airports');
        setCities(response.data);
      } catch (error) {
        console.error('Error fetching cities:', error);
      }
    };
    fetchCities();
  }, []);

  const getIntegratedFlightDetails = async (
    firstAirlines,
    secondAirlines,
    source,
    destination,
    dateTime
  ) => {
    const connectionSchedules = [];
    console.log("hi");
    await Promise.all(
      Object.entries(firstAirlines).map(
        async ([firstAirlineName, firstAirline]) => {
          try {
            console.log(firstAirline.apiPath, dateTime);
            const firstResponse = await axios.get(
              `${firstAirline.apiPath}Integration/connectingflight/${source}/${destination}/${dateTime}`
            );
            console.log(firstResponse);
            const firstFlights = firstResponse.data.map((firstFlight) => ({
              ...firstFlight,
              airlineName: firstAirlineName,
              apiPath: firstAirline.apiPath,
            }));
            console.log(firstFlights);

            if (firstFlights && firstFlights.length > 0) {
              await Promise.all(
                firstFlights.map(async (firstFlight) => {
                  await Promise.all(
                    Object.entries(secondAirlines).map(
                      async ([secondAirlineName, secondAirline]) => {
                        console.log(secondAirline);
                        try {
                          const secondResponse = await axios.get(
                            `${secondAirline.apiPath}Integration/directflight/${firstFlight.destinationAirportId}/${destination}/${firstFlight.dateTime}`
                          );

                          console.log(secondResponse);
                          const secondFlights = secondResponse.data.map(
                            (secondFlight) => ({
                              ...secondFlight,
                              airlineName: secondAirlineName,
                              apiPath: secondAirline.apiPath,
                            })
                          );

                          if (secondFlights && secondFlights.length > 0) {
                            console.log(secondFlights);
                            secondFlights.forEach((secondFlight) => {
                              const connectionSchedule = {
                                FirstFlight: firstFlight,
                                SecondFlight: secondFlights,
                              };
                              console.log(connectionSchedule);
                              connectionSchedules.push(connectionSchedule);
                            });
                          }
                        } catch (error) {
                          console.error(error);
                        }
                      }
                    )
                  );
                })
              );
            }
          } catch (error) {
            console.error(error);
          }
        }
      )
    );
    console.log(connectionSchedules)
    setFinalIntegratedConnectingFlights(connectionSchedules); // Uncomment this line if you want to use this data in your application
  };

  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'space-between',
      margin: '20px', // Adjust margin as needed
      background: '#f0f0f0', // Background color
      backgroundImage: 'url("b.jpg")', // Background image
      backgroundSize: 'cover',
      padding: '20px', // Add padding to the container
      borderRadius: '10px', // Add border radius for rounded corners
    },
    inputColumn: {
      width: '48%', // Adjust the width as needed
      background: '#ffffff', // Input column background color
      padding: '15px', // Add padding to the input column
      borderRadius: '5px', // Add border radius for rounded corners
    },
    buttonColumn: {
      width: '48%', // Adjust the width as needed
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      background: '#ffffff', // Button column background color
      padding: '15px', // Add padding to the button column
      borderRadius: '5px', // Add border radius for rounded corners
    },
  };
  const handleDateChange = (e) => {
    const inputDate = e.target.value;

    // Check if the entered date is in YYYY format
    const isValidFormat = /^\d{4}-\d{2}-\d{2}$/.test(inputDate);

    // Check if the year is either 2023 or 2024
    const isValidYear = ['2023', '2024'].includes(inputDate.substring(0, 4));

    // If the format and year are valid, update the state
    if (isValidFormat && isValidYear) {
      setDate(inputDate);
    } else {
      // If not valid, you can show an error or handle it in another way
      console.error('Invalid date format or year.');
    }
  };


  const handleDropdownChange = (value) => {
    sessionStorage.setItem('bookingType', value);
    setBookingType(value);
  };

  const handleBooking = async () => {
    setLoading(true);
    console.log(selectedDate)

    if (!source) {
      toast.error("Source Airport is not Selected or Empty")
    }
    else if (!destination) {
      toast.error("Destination Airport is not Selected Or Empty")
    }
    else if (!date) {
      toast.error("Date Time is not Selected or Empty")
    } else {

    }
    try {
      const response = await axiosInstance.get('Flight/search', {
        params: { source, destination, date },
      });

      setFlightSchedules(response.data);
      // Check if there are connecting flights
      const hasConnectingFlights = response.data.some(schedule => schedule.sourceToConnecting && schedule.connectingToDestination);
      setHasConnectingFlights(hasConnectingFlights);

    } catch (error) {
      console.error('Error fetching flight schedules:', error);
    } finally {
      setLoading(false);
    }

    try {
      await getIntegratedFlightDetails(sanjayairline, airlinesapi, source, destination, date);


    } catch (error) {
      console.log(error)
    }




  };

  const handleConnectionBookingAction = (sourceToConnectingScheduleId, connectingScheduleId, firstFlight, secondFlight) => {
    // Store details of the selected flights in session storage

    // Other actions based on your logic...
    const bookingType = sessionStorage.getItem('bookingType');
    sessionStorage.setItem('scheduleId', connectingScheduleId);
    sessionStorage.setItem('desinationScheduleId', sourceToConnectingScheduleId);

    const firstAirlineName = firstFlight.airlineName;
    sessionStorage.setItem('firstFlightAirlineName', firstAirlineName);

    const secondApiPath = secondFlight.apiPath;
    const secondAirlineName = secondFlight.airlineName;
    const secondFlightName = secondFlight.flightName;
    const secondSourceAirportID = secondFlight.sourceAirportId;
    const secondDestinationAirportID = secondFlight.destinationAirportId;
    const secondDateTime = secondFlight.dateTime;

    sessionStorage.setItem('flightName', secondFlightName);
    sessionStorage.setItem('sourceAirportId', secondSourceAirportID);
    sessionStorage.setItem('destinationAiportId', secondDestinationAirportID);
    sessionStorage.setItem('secondFlightApiPath', secondApiPath);
    sessionStorage.setItem('secondFlightAirlineName', secondAirlineName);
    sessionStorage.setItem('dateTime', secondDateTime);

    if (!bookingType) {
      toast.error('Booking Type is not Selected or Empty');
    } else {
      if (bookingType === 'SingleTrip') {
        navigate('/booking');
      } else if (bookingType === 'RoundTrip') {
        if (!bookingType) {
          toast.error('Booking Type is not Selected or Empty');
        }
        navigate('/round-trip-return-flight');
      }
    }
  };
  const handleBookingAction = (sourceToConnectingScheduleId, connectingScheduleId) => {
    const bookingType = sessionStorage.getItem('bookingType');
    sessionStorage.setItem('scheduleId', connectingScheduleId);
    sessionStorage.setItem('desinationScheduleId', sourceToConnectingScheduleId);
    var scheduleIds = [sourceToConnectingScheduleId, connectingScheduleId];
    // Store the array in sessionStorage
    sessionStorage.setItem('scheduleIds', JSON.stringify(scheduleIds));

    if (!bookingType) {
      toast.error("Booking Type is not Selected or Empty")
    } else {
      if (bookingType === 'SingleTrip') {

        navigate('/booking');
      } else if (bookingType === 'RoundTrip') {
        if (!bookingType) {
          toast.error("Booking Type is not Selected or Empty")
        }
        navigate('/round-trip-return-flight');
      }
    }
  };

  const onClick = () => {
    console.log("Sanjay")
  }



  return (
    <>
      <Navbar />
      <ToastContainer />


      <Table style={{ marginTop: 100 }}>
  <TableHead>
    <TableRow>
      <TableCell colSpan={4}>
        <Typography variant="h6" component="div" align="center" color>
          Flight Schedule
        </Typography>
      </TableCell>
    </TableRow>
  </TableHead>
  <TableRow>
    <TableCell colSpan={4}>
      <div style={styles.container}>
        <div style={styles.inputColumn}>
          <FormControl variant="outlined" fullWidth>
            <InputLabel id="source-label">Source</InputLabel>
            <Select
              labelId="source-label"
              label="Source"
              id="source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
            >
              <MenuItem value="Select">Select</MenuItem>
              {cities.map((city) => (
                <MenuItem key={city.airportId} value={city.airportId}>
                  {city.city}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl variant="outlined" fullWidth style={{ marginTop: '10px' }}>
            <InputLabel id="destination-label">Destination</InputLabel>
            <Select
              labelId="destination-label"
              label="Destination"
              id="destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            >
              <MenuItem value="Select">Select</MenuItem>
              {cities.map((city) => (
                <MenuItem key={city.airportId} value={city.airportId}>
                  {city.city}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
        </div>
        <div style={styles.inputColumn}>

        <FormControl variant="outlined" style={{ width: '100%', marginTop: '10px' }}>
            <InputLabel id="booking-type-label">Booking Type</InputLabel>
            <Select
              labelId="booking-type-label"
              label="Booking Type"
              id="booking-type"
              value={bookingType}
              onChange={(e) => handleDropdownChange(e.target.value)}
            >
              <MenuItem value="Select">Select</MenuItem>
              <MenuItem value="SingleTrip">Single Trip</MenuItem>
              <MenuItem value="RoundTrip">Round Trip</MenuItem>
            </Select>
          </FormControl>

          <FormControl variant="outlined" style={{ width: '100%', marginTop: '10px' }}>
            <TextField type="date" id="departure-date" value={date} onChange={(e) => setDate(e.target.value)} />
          </FormControl>

          </div>       
          </div>
            <Button
              variant="contained"
              color="primary"
              style={{ width: 400, marginTop: '10px', marginRight: '280px', marginLeft: '380px' }}
              onClick={handleBooking}
            >
              Get Flights
            </Button>
      
    </TableCell>
          

          
  </TableRow>
          

        
      
</Table>



      <TableContainer component={Paper} style={{ borderRadius: 5, width: 1000, marginBottom: 50,  marginLeft: 50 }}>

        <Paper style={{ marginTop: '20px', padding: '20px' }}>
          {loading ? (
            <CircularProgress />
          ) : flightSchedules.length > 0 ? (
            <>
              {hasConnectingFlights ? (
                <div>
                  <Typography variant="h6">Connecting Flights Available</Typography>
                  {flightSchedules.map((schedule, index) => (
                    <div key={index}>
                      <Typography variant="subtitle1">
                        {index === 0 ? 'Source to Connecting:' : 'Connecting to Destination:'}
                      </Typography>
                      <TableContainer component={Paper}>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Flight Name</TableCell>
                              <TableCell>Source Airport</TableCell>
                              <TableCell>Destination Airport</TableCell>
                              <TableCell>Flight Duration</TableCell>
                              <TableCell>Date</TableCell>
                              <TableCell>Time</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            <TableRow key={schedule.sourceToConnecting.scheduleId}>
                              <TableCell>{schedule.sourceToConnecting.flightName}</TableCell>
                              <TableCell>{schedule.sourceToConnecting.sourceAirportId}</TableCell>
                              <TableCell>{schedule.sourceToConnecting.destinationAirportId}</TableCell>
                              <TableCell>{schedule.sourceToConnecting.flightDuration}</TableCell>
                              <TableCell>{(schedule.sourceToConnecting.dateTime)}</TableCell>
                              <TableCell>{(schedule.sourceToConnecting.dateTime)}</TableCell>

                            </TableRow>
                            <TableRow key={schedule.connectingToDestination.scheduleId}>
                              <TableCell>{schedule.connectingToDestination.flightName}</TableCell>
                              <TableCell>{schedule.connectingToDestination.sourceAirportId}</TableCell>
                              <TableCell>{schedule.connectingToDestination.destinationAirportId}</TableCell>
                              <TableCell>{schedule.connectingToDestination.flightDuration}</TableCell>
                              <TableCell>{(schedule.connectingToDestination.dateTime)}</TableCell>
                              <TableCell>{(schedule.connectingToDestination.dateTime)}</TableCell>

                            </TableRow>
                          </TableBody>
                        </Table>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleBookingAction(
                            schedule.connectingToDestination.scheduleId,
                            schedule.sourceToConnecting.scheduleId
                          )}
                        >
                          Book
                        </Button>
                      </TableContainer>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <Typography variant="h6">Non-Stop Flights Available</Typography>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Flight Name</TableCell>
                          <TableCell>Source Airport</TableCell>
                          <TableCell>Destination Airport</TableCell>
                          <TableCell>Flight Duration</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Time</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {flightSchedules.map((schedule) => (
                          <TableRow key={schedule.scheduleId}>
                            <TableCell>{schedule.flightName}</TableCell>
                            <TableCell>{schedule.sourceAirportId}</TableCell>
                            <TableCell>{schedule.destinationAirportId}</TableCell>
                            <TableCell>{schedule.flightDuration}</TableCell>
                            <TableCell>{(schedule.dateTime)}</TableCell>
                            <TableCell>{(schedule.dateTime)}</TableCell>
                            <TableCell>
                              <Button
                                variant="contained"
                                color="primary"
                                onClick={() => handleBookingAction(schedule.scheduleId, null)}
                              >
                                Book
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}
            </>
          ) : (
            <Typography>No flights available for the selected criteria.</Typography>
          )}
        </Paper>
      </TableContainer>

      <TableContainer component={Paper} style={{ marginTop: 120, borderRadius: 5, width: 1000, marginLeft: 50 }}>
        {finalIntegratedConnectingFlights && finalIntegratedConnectingFlights.length > 0 && (
          <TableContainer className="m-5" component={Paper} style={{ marginTop: 120, borderRadius: 5, width: 800, marginLeft: 50 }}>
            {finalIntegratedConnectingFlights.map((connection, index) => (
              <Table key={index} className="mb-5">
                <TableHead>
                  <TableRow>
                    <Typography variant="h6">Connecting Flight By My Airline and Other Airline</Typography>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {connection.SecondFlight.map((flight, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Paper className="p-5">
                          <TableRow>
                            <TableCell>{connection.FirstFlight.flightName}</TableCell>
                            <TableCell>{connection.FirstFlight.sourceAirportId}</TableCell>
                            <TableCell>{connection.FirstFlight.destinationAirportId}</TableCell>
                            <TableCell>{`Flight Duration: ${connection.FirstFlight.flightDuration}`}</TableCell>
                            <TableCell>{`Departure Date: ${connection.FirstFlight.dateTime.split('T')[0]}`}</TableCell>
                            <TableCell>{`Departure Time: ${connection.FirstFlight.dateTime.split('T')[1]}`}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>{flight.flightName}</TableCell>
                            <TableCell>{flight.sourceAirportId}</TableCell>
                            <TableCell>{flight.destinationAirportId}</TableCell>
                            <TableCell>{`Flight Duration: ${flight.flightDuration}`}</TableCell>
                            <TableCell>{`Departure Date: ${flight.dateTime.split('T')[0]}`}</TableCell>
                            <TableCell>{`Departure Time: ${flight.dateTime.split('T')[1]}`}</TableCell>
                          </TableRow>
                        </Paper>
                        <Button style={{ marginLeft: 450 }}
                          variant="contained"
                          color="primary"
                          onClick={() =>
                            handleConnectionBookingAction(
                              flight.scheduleId,
                              connection.FirstFlight.scheduleId,
                              connection.FirstFlight,
                              flight
                            )
                          }
                        >
                          BOOK
                        </Button>
                      </TableCell>
           </TableRow>
                  ))}
                </TableBody>
              </Table>
            ))}
          </TableContainer>
        )}
      </TableContainer>;
    </>
  );
};

export default BookingComponent;

