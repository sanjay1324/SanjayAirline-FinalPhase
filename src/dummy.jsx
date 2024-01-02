import React, { useState, useEffect } from 'react';
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
} from '@material-ui/core';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from 'react-router-dom';
import { parseISO, format, isValid } from 'date-fns';
import Navbar from './Navbar'
import axiosInstance from './AxiosInstance';
import { ToastContainer, toast } from 'react-toastify';


const Booking = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [flightName, setFlightName] = useState('')
  const [interChangeSource, setInterChangeSource] = useState('');
  const [interChangeDestination, setInterChangeDestination] = useState('');
  const [flightDuration, setFlightDuration] = useState('');
  const [date, setDate] = useState('');
  const navigate = useNavigate();
  const [flights, setFlights] = useState([]);
  const [connectingFlightRound, setConnectingFlightRound] = useState([]);
  const [loading, setLoading] = useState(false);
  const scheduleId = sessionStorage.getItem('desinationScheduleId');
  const currentDate = new Date();
  const [firstLegFlights,setFirstLegFlight]=useState([]);
  const [secondLegFlights,setSecondLegFlight]=useState([]);

  const [firstLegFlightName,setFirstLegFlightName]=useState('');
  const [firstLegInterChangeSource,setFirstLegInterChangeSource]=useState('');
  const [firstLegInterChangeDestination,setFirstLegInterChangeDestination]=useState('');
  const [firstLegDate,setFirstLegDate]=useState('');
  const [firstLegFlightDuration,setFirstLegFlightDuration]=useState('');

  const [secondLegFlightName,setSecondLegFlightName]=useState('');
  const [secondLegInterChangeSource,setSecondLegInterChangeSource]=useState('');
  const [secondLegInterChangeDestination,setSecondLegInterChangeDestination]=useState('');
  const [secondLegDate,setSecondLegDate]=useState('');
  const [secondLegFlightDuration,setSecondLegFlightDuration] = useState('');

  console.log(secondLegInterChangeSource)

  useEffect(() => {

    async function fetchData() {
      await fetchFlightsSchedules();
    }

    fetchData();
  }, []);
  const fetchFlightsSchedules = async () => {
    try {
      setLoading(true);

      const connnectingflight = sessionStorage.getItem('connectingFlightRoundTrip');
      console.log(connnectingflight)

      if(connnectingflight=='true'){
        const firstLegFlight = sessionStorage.getItem('desinationScheduleId')
        const secondLegFlight = sessionStorage.getItem('scheduleId');
        
        console.log(firstLegFlight);
        console.log(secondLegFlight);
        

        try{
        const firstResponse = await axiosInstance.get(`FlightSchedules/${firstLegFlight}`);
        setFirstLegFlight(firstResponse.data);


        setFirstLegFlightName(firstResponse.data.flightName);
        setFirstLegInterChangeSource(firstResponse.data.sourceAirportId);
        setFirstLegInterChangeDestination(firstResponse.data.destinationAirportId);
        setFirstLegDate(firstResponse.data.dateTime);
        setFirstLegFlightDuration(firstResponse.data.flightDuration)


        console.log(firstLegFlightDuration,firstLegDate,firstLegInterChangeSource,firstLegInterChangeDestination)
      }
        catch(error){
          console.log(error);
        }

        try {
          const secondResponse = await axiosInstance.get(`FlightSchedules/${secondLegFlight}`);
          setSecondLegFlight(secondResponse.data);

          setSecondLegFlightName(secondResponse.data.flightName);
        setSecondLegInterChangeSource(secondResponse.data.sourceAirportId);
        setSecondLegInterChangeDestination(secondResponse.data.destinationAirportId);
        setSecondLegDate(secondResponse.data.dateTime);
        setSecondLegFlightDuration(secondResponse.data.flightDuration)

        } catch (error) {
          console.log(error);

        }
        console.log(firstLegFlights);
        console.log(secondLegFlights)

      }
      else{
        const response = await axiosInstance.get(`FlightSchedules/${scheduleId}`);

        console.log(scheduleId)
  
  
        console.log(response.data);
        // setScheduleId(response.data.scheduleId);
        setFlightName(response.data.flightName);
        setInterChangeSource(response.data.destinationAirportId);
        setInterChangeDestination(response.data.sourceAirportId);
        setDate(response.data.dateTime);
        setFlightDuration(response.data.flightDuration)
      }
      

   

    } catch (error) {
      console.error('Error fetching flights schedule:', error);
    } finally {
      setLoading(false);
    }
  };



  const fetchFlightsSchedule = async () => {
    try {


   

    
      // console.log('Before parsing:', selectedDate);

      // console.log('Before parsing:', selectedDate);

      // Assuming selectedDate is a date string
      const isoFormattedDate = format(new Date(selectedDate), 'yyyy-MM-dd');
      const parsedDate = parseISO(isoFormattedDate);
      console.log(isoFormattedDate)

      // console.log('After parsing:', parsedDate);

      // Check if the parsed date is valid
      if (!isValid(parsedDate)) {
        throw new Error('Invalid date format');
      }

      console.log(date)
      if (isoFormattedDate && isoFormattedDate <= date) {
        // Show an error toast if the selected date is less than the current date
        toast.error("Check with Date");
        return;
      }
    
      console.log("checking")

      //`https://localhost:7285/api/HomePage?source=${sourceAirportId}&destination=${destinationAirportId}&travelDate=${formattedDate}`

      const connnectingflight = sessionStorage.getItem('connectingFlightRoundTrip');
      console.log(connnectingflight)

      if(connnectingflight=='true'){
        const firstLegFlight = sessionStorage.getItem('desinationScheduleId')
        const secondLegFlight = sessionStorage.getItem('scheduleId');
        console.log(firstLegFlight);
        console.log(secondLegFlight);

        const source = sessionStorage.getItem('destination');
        const destination = sessionStorage.getItem('source');
        const date = isoFormattedDate;

        const response = await axiosInstance.get('Flight/search', {
          params: { source, destination, date },
        })
  
        console.log(response.data);
  
        if (response.data && response.data.length > 0) {
          setConnectingFlightRound(response.data);
          console.log(connectingFlightRound)
        } else {
          console.error('Error: No schedule data found in the API response.');
        }

      }
      else{
        const sourceAirportId = await getAirportIdByCityName(interChangeSource);
        const destinationAirportId = await getAirportIdByCityName(interChangeDestination);
      const response = await axiosInstance.get(
        `HomePage?source=${sourceAirportId}&destination=${destinationAirportId}&travelDate=${isoFormattedDate}`
      );

      console.log(response.data);

      if (response.data && response.data.length > 0) {
        setFlights(response.data);
      } else {
        console.error('Error: No schedule data found in the API response.');
      }
    }
    } catch (error) {
      console.error('Error fetching schedule details:', error);
    }
  };

  const getAirportIdByCityName = async (cityName) => {
    try {
      const airportResponse = await axiosInstance.get(
        `Airports/cityName/${cityName}`
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

  const handleScheduleSelect = async () => {
    try {
      await fetchFlightsSchedule();
    } catch (error) {
      console.error('Error handling schedule selection:', error.message);
      // Handle the error
    }
  };


  const handleSelectFlight = (scheduleId,scheduleId2) => {
    console.log(scheduleId,scheduleId2)
    sessionStorage.setItem('returnScheduleId', scheduleId);
    sessionStorage.setItem('returnScheduleId2',scheduleId2);

  
    navigate('/round-trip-booking')

  };

  
  const convertDuration = (duration) => {
    if (!duration) return 'Duration not available';
    const parts = duration.split(':');
    if (parts.length < 3) return 'Invalid duration format';
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    if (isNaN(hours) || isNaN(minutes)) return 'Invalid duration';
    return `${hours} hours ${minutes} minutes`;
  };

return (
<Container className="mt-5">
  <ToastContainer />
  <Navbar />
  <Card>
    {loading ? (
      <div className="text-center mt-3">
        <CircularProgress />
      </div>
    ) : (
      <>
        {sessionStorage.getItem('connectingFlightRoundTrip') === 'true' ? (
          <>
           
              <>
                <Card.Title>Connecting Flights</Card.Title>
                <TableContainer component={Paper} className="mt-3">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Flight Name (Source to Connecting)</TableCell>
                        <TableCell>Source Airport</TableCell>
                        <TableCell>Destination Airport</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Time</TableCell>
                        <TableCell>Flight Duration</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                          <TableRow>
                            <TableCell>
                              {firstLegFlightName}
                            </TableCell>
                            <TableCell>
                              {firstLegInterChangeSource}
                            </TableCell>
                            <TableCell>
                              {firstLegInterChangeDestination}
                            </TableCell>
                            <TableCell>
                              {new Date(firstLegDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {new Date(firstLegDate).toLocaleTimeString()}
                            </TableCell>
                            <TableCell>
                              {convertDuration(firstLegFlightDuration)}
                            </TableCell>
                            
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              {secondLegFlightName}
                            </TableCell>
                            <TableCell>
                              {secondLegInterChangeSource}
                            </TableCell>
                            <TableCell>
                              {secondLegInterChangeDestination}
                            </TableCell>
                            <TableCell>
                              {new Date(secondLegDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {new Date(secondLegDate).toLocaleTimeString()}
                            </TableCell>
                            <TableCell>
                              {convertDuration(secondLegFlightDuration)}
                            </TableCell>
                           
                          </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>

                
              </>
            
          </>
        ) : (
          <>
            <TableContainer component={Paper} className="mt-3">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Flight Name</TableCell>
                    <TableCell>Source</TableCell>
                    <TableCell>Destination</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Flight Duration</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
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
            
          </>
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
                              <TableCell>
                                {new Date(flight.dateTime).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                {new Date(flight.dateTime).toLocaleTimeString()}
                              </TableCell>
                              <TableCell>
                                {convertDuration(flight.flightDuration)}
                              </TableCell>
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

                {connectingFlightRound.length > 0 && (
                  <>
                    <Card.Title>Connecting Flights</Card.Title>
                    <TableContainer component={Paper} className="mt-3">
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Flight Name</TableCell>
                            <TableCell>Source Airport</TableCell>
                            <TableCell>Destination Airport</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Time</TableCell>
                            <TableCell>Flight Duration</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {connectingFlightRound.map((connectingFlight, index) => (
                            <React.Fragment key={index}>
                              <TableRow>
                                <TableCell>
                                  {connectingFlight.sourceToConnecting.flightName}
                                </TableCell>
                                <TableCell>
                                  {connectingFlight.sourceToConnecting.sourceAirportId}
                                </TableCell>
                                <TableCell>
                                  {connectingFlight.sourceToConnecting.destinationAirportId}
                                </TableCell>
                                <TableCell>
                                  {new Date(
                                    connectingFlight.sourceToConnecting.dateTime
                                  ).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  {new Date(
                                    connectingFlight.sourceToConnecting.dateTime
                                  ).toLocaleTimeString()}
                                </TableCell>
                                <TableCell>
                                  {convertDuration(
                                    connectingFlight.sourceToConnecting.flightDuration
                                  )}
                                </TableCell>
                                
                              </TableRow>
                              <TableRow>
                                <TableCell>
                                  {connectingFlight.connectingToDestination.flightName}
                                </TableCell>
                                <TableCell>
                                  {connectingFlight.connectingToDestination.sourceAirportId}
                                </TableCell>
                                <TableCell>
                                  {connectingFlight.connectingToDestination.destinationAirportId}
                                </TableCell>
                                <TableCell>
                                  {new Date(
                                    connectingFlight.connectingToDestination.dateTime
                                  ).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  {new Date(
                                    connectingFlight.connectingToDestination.dateTime
                                  ).toLocaleTimeString()}
                                </TableCell>
                                <TableCell>
                                  {convertDuration(
                                    connectingFlight.connectingToDestination.flightDuration
                                  )}
                                </TableCell>
                               
                              </TableRow>
                              <TableCell>
                                  <Button
                                    variant="success"
                                    onClick={() =>
                                      handleSelectFlight(
                                        connectingFlight.sourceToConnecting.scheduleId,connectingFlight.connectingToDestination.scheduleId
                                      )
                                    }
                                  >
                                    Select Flight
                                  </Button>
                                </TableCell>
                            </React.Fragment>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </>
                )}
              </Form>
            </Card.Body>
      </>
    )}
  </Card>
</Container>

  );
  
  
};
export default Booking;
