import './App.css'
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AirportsList from './Airports';
import Login from './Login';
import Register from './Register';
import FlightDetails from './FlightDetails';
import FlightSchedule from './FlightSchedule';
import HomePage from './Homepage'
import SingleTripSeatSelection from './SingleTripSeatSelection'
import SingleTripBooking from './SingleTripBooking';
import RoundTrip from './BookingRound'
import RoundTripBooking from './RoundTripBooking'
import ConnectingFlightSeaSelection from './ConnectingFlightSeaSelection'
import History from './assets/TriedNewThings/Seatsupdates'
import RoundTripSeatSelection from './RoundTripSeatSelection'
function App() {
  return (
    <Router>

    <div>
      <div className='App'>
        <Routes>
        <Route path='/' element={<Login/>}/>
        <Route path='/register' element={<Register/>}/>
        <Route path='/homepage' element={<HomePage/>}/>
        <Route path='/seats' element={<SingleTripSeatSelection/>}/>
        <Route path='/booking' element={<SingleTripBooking/>}/>
        <Route path='/round-trip' element={<RoundTrip/>}/>
        <Route path='/round-trip-booking' element={<RoundTripBooking/>}/>
        <Route path='/round-trip-seat-booking' element={<RoundTripSeatSelection/>}/>
        <Route path='/connecting-flight-seat' element={<ConnectingFlightSeaSelection/>}/>
         <Route path='/airport' element={<AirportsList/>}/>
         <Route path='/flight-details' element={<FlightDetails/>}/>
         <Route path='/flight-schedule' element={<FlightSchedule/>}/>
         <Route path='/history' element={<History/>}/>

        </Routes>
      </div>
    
    </div>
    </Router>
  );
}


export default App
