import React, { useState,useEffect } from 'react';
import { Container, Card, Button, Form } from 'react-bootstrap';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Typography,
} from '@material-ui/core';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from 'react-router-dom';
import { parseISO, format,isValid } from 'date-fns';
import Navbar from './Navbar'
const Booking = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [flightName,setFlightName] = useState('')
  const [interChangeSource, setInterChangeSource] = useState('');
  const [interChangeDestination, setInterChangeDestination] = useState('');
  const [flightDuration,setFlightDuration]=useState('');
  const [date,setDate]=useState('');
  const navigate = useNavigate();
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
const [book,setBook] = useState('');
const scheduleId = sessionStorage.getItem('desinationScheduleId');
const currentDate = new Date();

useEffect(() => {

  async function fetchData() {
    await fetchFlightsSchedules();
  }

  fetchData();
}, []);
  const fetchFlightsSchedules = async () => {
    try {
      setLoading(true);


      const response = await axios.get(`https://localhost:7285/api/FlightSchedules/${scheduleId}`);

      console.log(scheduleId)
      

      console.log(response.data);
      // setScheduleId(response.data.scheduleId);
      setFlightName(response.data.flightName);
      setInterChangeSource(response.data.destinationAirportId);
      setInterChangeDestination(response.data.sourceAirportId);
      setDate(response.data.dateTime);
      setFlightDuration(response.data.flightDuration)

      setBook(response.data);
      console.log(book)
      
    } catch (error) {
      console.error('Error fetching flights schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  

  const fetchFlightsSchedule = async () => {
    try {
      

      const sourceAirportId = await getAirportIdByCityName(interChangeSource);
      const destinationAirportId = await getAirportIdByCityName(interChangeDestination);

      if (!sourceAirportId || !destinationAirportId) {
        console.error('Error: sourceAirportId or destinationAirportId is null.');
        return;
      }

      console.log('Before parsing:', selectedDate);

      console.log('Before parsing:', selectedDate);

    // Assuming selectedDate is a date string
    const isoFormattedDate = format(new Date(selectedDate), 'yyyy-MM-dd');
    const parsedDate = parseISO(isoFormattedDate);

    console.log('After parsing:', parsedDate);

    // Check if the parsed date is valid
    if (!isValid(parsedDate)) {
      throw new Error('Invalid date format');
    }

    const formattedDate = format(parsedDate, 'yyyy-MM-dd');


      const response = await axios.get(
        `https://localhost:7285/api/HomePage?source=${sourceAirportId}&destination=${destinationAirportId}&travelDate=${formattedDate}`
      );

      console.log(response.data);

      if (response.data && response.data.length > 0) {
        setFlights(response.data);
      } else {
        console.error('Error: No schedule data found in the API response.');
      }
    } catch (error) {
      console.error('Error fetching schedule details:', error);
    }
  };

  const getAirportIdByCityName = async (cityName) => {
    try {
      const airportResponse = await axios.get(
        `https://localhost:7285/api/Airports/cityName/${cityName}`
      );

      console.log(airportResponse);

      if (airportResponse.data && airportResponse.data.length > 0) {
        return airportResponse.data;
      } else {
        console.error(`Error: No airport data found for ${cityName}.`);
        return null;
      }
    } catch (error) {
      console.error(`Error fetching airport details for ${cityName}:`, error);
      return null;
    }
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleScheduleSelect = async () => {
    try {
      await fetchFlightsSchedule();
    } catch (error) {
      console.error('Error handling schedule selection:', error.message);
      // Handle the error
    }
  };
  const handleSelectFlight = (scheduleId) => {
    sessionStorage.setItem('returnScheduleId', scheduleId);
    navigate('/round-trip-booking')
    // Navigate to the seat booking page or perform other actions as needed
  };

  const convertDuration = (duration) => {
    const [hours, minutes, seconds] = duration.split(':');
    return `${parseInt(hours)} hours ${parseInt(minutes)} minutes`;
  };

  return (
    <Container className="mt-5">
      <Card>
      {loading ? (
              <div className="text-center mt-3">
                <CircularProgress />
              </div>
            ) : (
              <TableContainer component={Paper} className="mt-3">
          <Card.Title>Select Round Trip Flights</Card.Title>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Flight Name</TableCell>
                      <TableCell>Source </TableCell>
                      <TableCell>Destination</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell>Flight Duration</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
    <TableRow >
      <TableCell>{flightName}</TableCell>
      <TableCell>{interChangeDestination}</TableCell>
      <TableCell>{interChangeSource}</TableCell>
      <TableCell>{new Date(date).toLocaleDateString()}</TableCell>
      <TableCell>{new Date(date).toLocaleTimeString()}</TableCell>
      <TableCell>{convertDuration(flightDuration)}</TableCell>
     
    </TableRow>

  

                  </TableBody>
                </Table>
              </TableContainer>
            )}
        <Card.Body>
          <Card.Title>Select Round Trip Flights</Card.Title>
          <Form>
          <Form.Group className="mb-3">
      <Form.Label>Select Return Date</Form.Label>
      <DatePicker
        selected={selectedDate}
        onChange={(date) => setSelectedDate(date)}
        minDate={currentDate} // Set the minimum date to the current date
        dateFormat="yyyy-MM-dd"
      />
    </Form.Group>
            <Button variant="primary" onClick={handleScheduleSelect}>
              Select Schedule
            </Button>

            {loading ? (
              <div className="text-center mt-3">
                <CircularProgress />
              </div>
            ) : (
              <TableContainer component={Paper} className="mt-3">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Flight Name</TableCell>
                      <TableCell>Departure Date</TableCell>
                      <TableCell>Departure Time</TableCell>
                      <TableCell>Flight Duration</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {flights && flights.length > 0 ? (
                      flights.map((flight) => (
                        <TableRow key={flight.scheduleId}>
                          <TableCell>{flight.flightName}</TableCell>
                          <TableCell>{new Date(flight.dateTime).toLocaleDateString()}</TableCell>
                          <TableCell>{new Date(flight.dateTime).toLocaleTimeString()}</TableCell>
                          <TableCell>{convertDuration(flight.flightDuration)}</TableCell>
                          <TableCell>
                            <Button
                              variant="success"
                              onClick={() => handleSelectFlight(flight.scheduleId)}
                            >
                              Select Flight
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5}>No data available</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};
export default Booking;
