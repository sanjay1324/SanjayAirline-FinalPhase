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
  Box
} from '@mui/material';
import video from "./anime.gif";
import { Airplane, ArrowRight } from 'phosphor-react';
import { useNavigate } from 'react-router-dom';
import 'react-datepicker/dist/react-datepicker.css';
import axiosInstance from './AxiosInstance';
import Navbar from './Navbar';
import { sanjayairline } from './Constants';
import { airlinesapi } from './Constants'
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import './css/homepage.css'
import GradientBackground from './GradientBackground';

// import sanjaylogo from './css/image/logo-no-background.png';

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
  const [airportData, setAirportData] = useState([]);
  const LoggedIn = sessionStorage.getItem('LoggedIn');
  const [isLoading, setIsLoading] = useState(false); // Add this line to define isLoading

  const continueBooking = sessionStorage.getItem('continuewithoutlogin')





  useEffect(() => {
    // Fetch the list of cities from the 

    // if (LoggedIn === 'false') {
    //   toast.info("You are not authorized user")
    //   navigate('/login')
    // }
    if (sessionStorage.getItem('LoggedIn') === 'true') {
      location.reload();
      sessionStorage.removeItem('LoggedIn');
      sessionStorage.setItem('loggedIn', true);
    }


    const fetchCities = async () => {
      try {
        const response = await axiosInstance.get('Airports');
        setCities(response.data);
        
        setAirportData(response.data);
      } catch (error) {
        console.log('Error fetching cities:', error);
      }
    };
    fetchCities();
  }, []);

  const getAirportDetails = (airportId) => {
    const airport = airportData.find((a) => a.airportId === airportId);
    return airport ? { city: airport.city, airportName: airport.airportName } : null;
  };

  const getIntegratedFlightDetails = async (
    firstAirlines,
    secondAirlines,
    source,
    destination,
    dateTime
  ) => {
    const connectionSchedules = [];
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
                          const token = sessionStorage.getItem('token'); // Retrieve token from sessionStorage

                          console.log(token)
                          const secondResponse = await axios.get(
                            `${secondAirline.apiPath}Integration/directflight/${firstFlight.destinationAirportId}/${destination}/${firstFlight.dateTime}`,
                            {
                              headers: {
                                'Authorization': `Bearer ${token}` // Include the token in the Authorization header
                                // You may need to modify the header key based on the authentication mechanism used by the API
                              }
                            }
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
                          console.log(error);
                        }
                      }
                    )
                  );
                })
              );
            }
          } catch (error) {
            console.log(error);
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



  const handleDropdownChange = (value) => {
    sessionStorage.setItem('bookingType', value);
    setBookingType(value);
  };

  const handleBooking = async () => {
    setLoading(true);
    const continueBooking = sessionStorage.getItem('continueBooking')
    // if(continueBooking!=='true'){
    //   navigate('/')

    // }
    console.log(selectedDate)

    if (!source) {
      toast.error("Source Airport is not Selected or Empty")
      setLoading(false);

    }
    else if (!destination) {
      toast.error("Destination Airport is not Selected Or Empty")
      setLoading(false);

    }
    else if (!date) {
      toast.error("Date Time is not Selected or Empty")
      setLoading(false);

    } else if (source == destination) {
      toast.error("Source and Destination should not be same")
      setLoading(false);

    }
    else {
      try {
        const response = await axiosInstance.get('Flight/search', {
          params: { source, destination, date },
        });

        setFlightSchedules(response.data);
        // Check if there are connecting flights
        const hasConnectingFlights = response.data.some(schedule => schedule.sourceToConnecting && schedule.connectingToDestination);
        if (hasConnectingFlights) {
          // sessionStorage.setItem('connnectingflight',true);
          sessionStorage.setItem('source', source);
          sessionStorage.setItem('destination', destination);
        }
        setHasConnectingFlights(hasConnectingFlights);

      } catch (response) {
        toast.info(response.response.data);
        console.log(response.response.data)
        if (response.response.data == 'Invalid date. Please provide a future date.') {
          toast.error("Invalid date. Please provide a future date.");
        }
        console.log('Error fetching flight schedules:', response.data);
      } finally {
        setLoading(false);
      }
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

        if (continueBooking == 'true') {
          navigate('/')
        }
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
        if (continueBooking == 'true') {
          console.log(continueBooking)
          navigate('/')
          sessionStorage.setItem('continuewithoutlogin', false)
        } else {
          navigate('/booking');
        }

      } else if (bookingType === 'RoundTrip') {
        sessionStorage.setItem('connectingFlightRoundTrip', true)
        if (continueBooking == 'true') {
          console.log(continueBooking)
          navigate('/')
          sessionStorage.setItem('continuewithoutlogin', false)
        } else {
          navigate('/round-trip-return-flight');
        }
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


  const getCurrentDate = () => {
    console.log('callinggetcurrentdate')
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    let month = currentDate.getMonth() + 1;
    month = month < 10 ? `0${month}` : month;
    const day = currentDate.getDate();
    console.log(day)
    return `${year}-${month}-${day}`;
  };

  const getMaxDate = () => {
    console.log('calling gtmaxdte')
    const currentDate = new Date();
    currentDate.setFullYear(2024); // Set the year to 2024
    currentDate.setMonth(currentDate.getMonth() + 5);
    const year = currentDate.getFullYear();
    let month = currentDate.getMonth() + 1;
    month = month < 10 ? `0${month}` : month;
    const day = currentDate.getDate();
    console.log(date)
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (selectedDate) => {
    // Add your logic to handle the selected date
    setDate(selectedDate);
  };

  return (
    <>
        <GradientBackground  >

      <div className='additional-content'>
        <Navbar />
        <ToastContainer />
        <div style={{ margin: '20px', position: 'absolute', top: 0, left: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', marginRight: '16px' }}>
          <img src={video} alt="SanjayAirline Logo" style={{ marginLeft: 245, height: '450px', width: '650px', borderRadius: 171}} />
        </Box>
    </div>
        <Table style={{ marginTop: 550, width: 300 }}>
          <TableHead>
            <TableRow>
              <TableCell colSpan={4}>
                <Typography variant="h6" component="div" align="center" color>
                  Explore Flights
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableRow >
            <TableCell colSpan={4} >
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
                      <MenuItem value="SingleTrip">Oneway</MenuItem>
                      <MenuItem value="RoundTrip">Round Trip</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl variant="outlined" style={{ width: '100%', marginTop: '10px' }}>
        <TextField
          type="date"
          id="departure-date"
          value={date}
          onChange={(e) => handleDateChange(e.target.value)}
          inputProps={{
            min: getCurrentDate(),
            max: getMaxDate(),
          }}
        />
      </FormControl>

                </div>
              </div>
              <Button
                variant="contained"
                color="primary"
                style={{ width: 400, marginTop: '10px', marginRight: '200px', marginLeft: '280px' }}
                onClick={handleBooking}
              >
                Get Flights
              </Button>
            </TableCell>
          </TableRow>
        </Table>


        <TableContainer style={{ borderRadius: 5, width: 1000, marginLeft: 50 }}>
          {loading ? (
            <CircularProgress />
          ) : flightSchedules.length > 0 ? (
            <>
              {hasConnectingFlights ? (
                <div>

                  <Typography variant="h6">Connecting Flights Available</Typography>
                  {flightSchedules.map((schedule, index) => (
                    <div key={index} className="flight-schedule-container">
                      <div className="flight-info" >
                        <Typography variant="subtitle1">
                          Source to Connecting:
                          {`${schedule.sourceToConnecting.sourceAirportId} to ${schedule.sourceToConnecting.destinationAirportId}`}
                        </Typography>


                        <Typography variant="subtitle1" >
                          Connecting to Source:{`${schedule.connectingToDestination.sourceAirportId} to ${schedule.connectingToDestination.destinationAirportId}`}

                        </Typography>


                      </div>

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
                              <TableCell>{getAirportDetails(schedule.sourceToConnecting.sourceAirportId)?.city} - {getAirportDetails(schedule.sourceToConnecting.sourceAirportId)?.airportName}</TableCell>
                              <TableCell>{getAirportDetails(schedule.sourceToConnecting.destinationAirportId)?.city} - {getAirportDetails(schedule.sourceToConnecting.destinationAirportId)?.airportName}</TableCell>
                              <TableCell>{schedule.sourceToConnecting.flightDuration}</TableCell>
                              <TableCell>{schedule.sourceToConnecting.dateTime.split('T')[0]}</TableCell>
                              <TableCell>{schedule.sourceToConnecting.dateTime.split('T')[1]}</TableCell>
                            </TableRow>
                            <TableRow key={schedule.connectingToDestination.scheduleId}>
                              <TableCell>{schedule.connectingToDestination.flightName}</TableCell>
                              <TableCell>{getAirportDetails(schedule.connectingToDestination.sourceAirportId)?.city} - {getAirportDetails(schedule.connectingToDestination.sourceAirportId)?.airportName}</TableCell>
                              <TableCell>{getAirportDetails(schedule.connectingToDestination.destinationAirportId)?.city} - {getAirportDetails(schedule.connectingToDestination.destinationAirportId)?.airportName}</TableCell>
                              <TableCell>{schedule.connectingToDestination.flightDuration}</TableCell>
                              <TableCell>{schedule.connectingToDestination.dateTime.split('T')[0]}</TableCell>
                              <TableCell>{schedule.connectingToDestination.dateTime.split('T')[1]}</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleBookingAction(
                            schedule.sourceToConnecting.scheduleId,
                            schedule.connectingToDestination.scheduleId
                          )}
                          endIcon={<ArrowRight size={20} />} // Phosphor React arrow icon
                          className="book-button"
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
                            <TableCell>{getAirportDetails(schedule.sourceAirportId)?.city} - {getAirportDetails(schedule.sourceAirportId)?.airportName}</TableCell>
                            <TableCell>{getAirportDetails(schedule.destinationAirportId)?.city} - {getAirportDetails(schedule.destinationAirportId)?.airportName}</TableCell>
                            <TableCell>{schedule.flightDuration}</TableCell>
                            <TableCell>{schedule.dateTime.split('T')[0]}</TableCell>
                            <TableCell>{schedule.dateTime.split('T')[1]}</TableCell>
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
            <Typography variant="h6" style={{ fontWeight: 'bold', color: 'black' }}>No flights available for the selected criteria.</Typography>
          )}


          <TableContainer>
            <div className="connecting-flights-container">
              {isLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                  <CircularProgress />
                </div>
              ) : finalIntegratedConnectingFlights && finalIntegratedConnectingFlights.length > 0 ? (
                finalIntegratedConnectingFlights.map((connection, index) => (
                  <div key={index} className="connecting-flight mb-5">

                    <Typography variant="h6" style={{ fontWeight: 'bold', color: 'white' }}>Connecting Flight By My Airline and Other Airline</Typography>
                    {connection.SecondFlight.map((flight, i) => (
                      <div key={i} className="flight-details-container">
                        <div className="flight-details left-details">
                          <Typography variant="h6">First Flight Details</Typography>
                          <Typography>Flight Name: {connection.FirstFlight.flightName}</Typography>
                          <Typography>
                            Source Airport: {connection.FirstFlight.sourceAirportId} - {connection.FirstFlight.sourceAirportName}
                          </Typography>
                          <Typography>
                            Destination Airport: {connection.FirstFlight.destinationAirportId} - {connection.FirstFlight.destinationAirportName}
                          </Typography>
                          <Typography>Flight Duration: {connection.FirstFlight.flightDuration}</Typography>
                          <Typography>Date: {connection.FirstFlight.dateTime.split('T')[0]}</Typography>
                          <Typography>Time: {connection.FirstFlight.dateTime.split('T')[1]}</Typography>
                          {/* Assuming Airplane is a valid component */}
                          <Airplane size={32} />
                        </div>

                        <div className="book-button-container">
                          <Button
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
                            disabled={isLoading}
                          >
                            {isLoading ? <Loader size={24} /> : <ArrowRight size={24} />} BOOK
                          </Button>
                        </div>

                        <div className="flight-details right-details">
                          <Typography variant="h6">Second Flight Details</Typography>
                          <Typography>Flight Name: {flight.flightName}</Typography>
                          <Typography>Source Airport: {flight.sourceAirportId} - {flight.sourceAirportName}</Typography>
                          <Typography>Destination Airport: {flight.destinationAirportId} - {flight.destinationAirportName}</Typography>
                          <Typography>Flight Duration: {flight.flightDuration}</Typography>
                          <Typography>Date: {flight.dateTime.split('T')[0]}</Typography>
                          <Typography>Time: {flight.dateTime.split('T')[1]}</Typography>
                          {/* Assuming Airplane is a valid component */}
                          <Airplane size={32} />
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              ) : (
                <Typography variant="h6" style={{ fontWeight: 'bold', color: 'black' }}>
                  No connecting flights available.
                </Typography>
              )}
            </div>
          </TableContainer>

        </TableContainer>



      </div>


      </GradientBackground  >

    </>
  );
};

export default BookingComponent;

