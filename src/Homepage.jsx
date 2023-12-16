import React, { useEffect, useState } from 'react';
import {
  AppBar,
  Toolbar,
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
import DatePicker from 'react-datepicker';
import axiosInstance from './AxiosInstance';
import Navbar from './Navbar';

const BookingComponent = () => {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [bookingType, setBookingType] = useState('Select');
  const [flightSchedules, setFlightSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState([]); // New state to store the list of cities

  const [hasConnectingFlights, setHasConnectingFlights] = useState(false);
  const navigate = useNavigate();

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
  const formatDate = (dateTime) => {
    const date = new Date(dateTime);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  };

  const formatTime = (dateTime) => {
    const date = new Date(dateTime);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
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

    try {
      const response = await axiosInstance.get('Flight/search', {
        params: { source, destination, date: selectedDate },
      });

      setFlightSchedules(response.data);
      console.log(response.data)
      // Check if there are connecting flights
      const hasConnectingFlights = response.data.some(schedule => schedule.sourceToConnecting && schedule.connectingToDestination);
      setHasConnectingFlights(hasConnectingFlights);

      console.log(hasConnectingFlights);
    } catch (error) {
      console.error('Error fetching flight schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingAction = (sourceToConnectingScheduleId, connectingScheduleId) => {
    const bookingType = sessionStorage.getItem('bookingType');
    sessionStorage.setItem('scheduleId', connectingScheduleId);
    sessionStorage.setItem('desinationScheduleId', sourceToConnectingScheduleId);


    var scheduleIds = [sourceToConnectingScheduleId, connectingScheduleId];

// Store the array in sessionStorage
sessionStorage.setItem('scheduleIds', JSON.stringify(scheduleIds));
    if (bookingType === 'SingleTrip') {
      navigate('/booking');
    } else if (bookingType === 'RoundTrip') {
      navigate('/round-trip-booking');
    }
  };


  return (
    <>
      <Navbar />
      <TableContainer style={{ marginBottom:150, borderRadius: 5, width:1000, }}>
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
                      <MenuItem key={city.airportId} value={city.city}>
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
                      <MenuItem key={city.airportId} value={city.city}>
                        {city.city}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </TableCell>
              <TableCell>
                <TextField
                  label="Date"
                  type="date"
                  variant="outlined"
                  fullWidth
                  value={selectedDate || ''} 
                  onChange={(e) => handleDateChange(e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
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


      <TableContainer component={Paper} style={{ borderRadius: 5, width:1000 }}>

      <Paper  style={{ marginTop: '20px', padding: '20px' }}>
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
                            <TableCell>{formatDate(schedule.sourceToConnecting.dateTime)}</TableCell>
                            <TableCell>{formatTime(schedule.sourceToConnecting.dateTime)}</TableCell>

                          </TableRow>
                          <TableRow key={schedule.connectingToDestination.scheduleId}>
                            <TableCell>{schedule.connectingToDestination.flightName}</TableCell>
                            <TableCell>{schedule.connectingToDestination.sourceAirportId}</TableCell>
                            <TableCell>{schedule.connectingToDestination.destinationAirportId}</TableCell>
                            <TableCell>{schedule.connectingToDestination.flightDuration}</TableCell>
                            <TableCell>{formatDate(schedule.connectingToDestination.dateTime)}</TableCell>
                            <TableCell>{formatTime(schedule.connectingToDestination.dateTime)}</TableCell>

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
                          <TableCell>{formatDate(schedule.dateTime)}</TableCell>
                          <TableCell>{formatTime(schedule.dateTime)}</TableCell>
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

    </>
  );
};

export default BookingComponent;
