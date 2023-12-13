import './App.css'
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AirportsList from './Airports';
import Login from './Login';
import Register from './Register';
import FlightDetails from './FlightDetails';
import FlightSchedule from './FlightSchedule';
import HomePage from './Homepage'
import Seats from './Seats'
import Booking from './Booking';
import Booking3 from './BookingRound'
function App() {
  return (
    <Router>

    <div>
      <div className='App'>
        <Routes>
        <Route path='/' element={<Login/>}/>
        <Route path='/register' element={<Register/>}/>
        <Route path='/Homepage' element={<HomePage/>}/>
        <Route path='/seats' element={<Seats/>}/>
        <Route path='/booking' element={<Booking/>}/>
        <Route path='/booking2' element={<Booking3/>}/>

         <Route path='/Airport' element={<AirportsList/>}/>
         <Route path='/FlightDetails' element={<FlightDetails/>}/>
         <Route path='/FlightSchedule' element={<FlightSchedule/>}/>

        </Routes>
      </div>
    
    </div>
    </Router>
  );
}


export default App
