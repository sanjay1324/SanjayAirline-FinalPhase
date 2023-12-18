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
import { Grid, ListItem, ListItemText, List, Divider } from '@mui/material';

import { useNavigate } from 'react-router-dom';
import 'react-datepicker/dist/react-datepicker.css';
import DatePicker from 'react-datepicker';
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

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleDropdownChange = (value) => {
    sessionStorage.setItem('bookingType', value);
    setBookingType(value);
  };

  const handleBooking = async () => {
    setLoading(true);
    console.log(selectedDate)

    if(!source ){
      toast.error("Source Airport is not Selected or Empty")
    }
    else if(!destination){
      toast.error("Destination Airport is not Selected Or Empty")
    }
    else if(!date){
      toast.error("Date Time is not Selected or Empty")
    }else{

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

  const handleConnectionBookingAction= (sourceToConnectingScheduleId, connectingScheduleId) => {

 const bookingType = sessionStorage.getItem('bookingType');
    sessionStorage.setItem('scheduleId', connectingScheduleId);
    sessionStorage.setItem('desinationScheduleId', sourceToConnectingScheduleId);
    const { apiPath, airlineName,flightName,sourceAirportId,destinationAirportId,dateTime } = finalIntegratedConnectingFlights[0]?.SecondFlight[0] || {};

    sessionStorage.setItem('flightName',flightName);
    sessionStorage.setItem('sourceAirportId',sourceAirportId);
    sessionStorage.setItem('destinationAiportId',destinationAirportId)
    sessionStorage.setItem('secondFlightApiPath', apiPath);
    sessionStorage.setItem('secondFlightAirlineName', airlineName);
    sessionStorage.setItem('dateTime',dateTime);
 
    const firstFlightAirlineName = finalIntegratedConnectingFlights[0]?.FirstFlight?.airlineName;
    sessionStorage.setItem('firstFlightAirlineName', firstFlightAirlineName);

    if(!bookingType){
      toast.error("Booking Type is not Selected or Empty")
    }else{
    if (bookingType === 'SingleTrip') {
     
      navigate('/booking');
    } else if (bookingType === 'RoundTrip') {
      if(!bookingType){
        toast.error("Booking Type is not Selected or Empty")
      }
      navigate('/round-trip-return-flight');
    }}

  }

  const handleBookingAction = (sourceToConnectingScheduleId, connectingScheduleId) => {
    const bookingType = sessionStorage.getItem('bookingType');
    sessionStorage.setItem('scheduleId', connectingScheduleId);
    sessionStorage.setItem('desinationScheduleId', sourceToConnectingScheduleId);
    var scheduleIds = [sourceToConnectingScheduleId, connectingScheduleId];
    // Store the array in sessionStorage
    sessionStorage.setItem('scheduleIds', JSON.stringify(scheduleIds));

    if(!bookingType){
      toast.error("Booking Type is not Selected or Empty")
    }else{
    if (bookingType === 'SingleTrip') {
     
      navigate('/booking');
    } else if (bookingType === 'RoundTrip') {
      if(!bookingType){
        toast.error("Booking Type is not Selected or Empty")
      }
      navigate('/round-trip-return-flight');
    }}
  };

  const onClick = () => {
    console.log("Sanjay")
  }



  return (
    <>
      <Navbar />
      <ToastContainer/>
      <TableContainer component={Paper} style={{ marginTop: 50, borderRadius: 5, width: 1000, marginBottom: 50, position: 'relative' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell colSpan={6}>
                <Typography variant="h6" component="div" align="center">
                  Flight Scheduler
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>
                <FormControl variant="outlined" fullWidth>
                  <InputLabel id="source-label" >Source</InputLabel>
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
              </TableCell>
              <TableCell>
                <FormControl variant="outlined" fullWidth>
                  <InputLabel id="destination-label">Destination</InputLabel>
                  <Select
                    labelId="destination-label"
                    label="Destination"
                    id="destination"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  >
                    <MenuItem value="Select" >Select</MenuItem>
                    {cities.map((city) => (
                      <MenuItem key={city.airportId} value={city.airportId}>
                        {city.city}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </TableCell>
              <TableCell style={{ width: 140 }}>
                <FormControl fullWidth>
                  <TextField type="date" id="departure-date" value={date} onChange={(e) => setDate(e.target.value)} />
                </FormControl>

              </TableCell>
              <TableCell>
                <FormControl variant="outlined" fullWidth>
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
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={6}>
                <Button variant="contained" color="primary" fullWidth onClick={handleBooking}>
                  Get Flights
                </Button>

              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>


      <TableContainer component={Paper} style={{ borderRadius: 5, width: 1000 }}>

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

      <TableContainer className="m-5" component={Paper} style={{ borderRadius: 5, width: 1000 }}>
        {finalIntegratedConnectingFlights && finalIntegratedConnectingFlights.length > 0 && (
          <TableContainer className="m-5" component={Paper}>
            {finalIntegratedConnectingFlights.map((connection, index) => (
              <Table key={index} className="mb-5">
                <TableHead>
                  <TableRow>
                    <TableCell>Second Flight</TableCell>
                    <TableCell>First Flight</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {connection.SecondFlight.map((flight, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="flex flex-row-reverse border p-2 hover:cursor-pointer m-5">
                          <div className="p-5">
                            <List>
                              <ListItem>
                                <ListItemText primary={flight.flightName} />
                              </ListItem>
                              <ListItem>
                                <ListItemText primary={flight.sourceAirportId} />
                              </ListItem>
                              <ListItem>
                                <ListItemText primary={flight.destinationAirportId} />
                              </ListItem>
                              <ListItem>
                                <ListItemText primary={`Flight Duration: ${flight.fightDuration}`} />
                              </ListItem>
                              <ListItem>
                                <ListItemText primary={`Departure Date: ${flight.dateTime.split('T')[0]}`} />
                              </ListItem>
                              <ListItem>
                                <ListItemText primary={`Departure Time: ${flight.dateTime.split('T')[1]}`} />
                              </ListItem>
                            </List>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="p-5">
                          <List>
                            <ListItem>
                              <ListItemText primary={connection.FirstFlight.flightName} />
                            </ListItem>
                            <ListItem>
                              <ListItemText primary={connection.FirstFlight.sourceAirportId} />
                            </ListItem>
                            <ListItem>
                              <ListItemText primary={connection.FirstFlight.destinationAirportId} />
                            </ListItem>
                            <ListItem>
                              <ListItemText primary={`Flight Duration: ${connection.FirstFlight.flightDuration}`} />
                            </ListItem>
                            <ListItem>
                              <ListItemText primary={`Departure Date: ${connection.FirstFlight.dateTime.split('T')[0]}`} />
                            </ListItem>
                            <ListItem>
                              <ListItemText primary={`Departure Time: ${connection.FirstFlight.dateTime.split('T')[1]}`} />
                            </ListItem>
                          </List>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleConnectionBookingAction(flight.scheduleId, connection.FirstFlight.scheduleId)}
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

      </TableContainer>

    </>
  );
};

export default BookingComponent;

