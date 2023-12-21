// Navbar.js

import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import logo from '../src/assets/Logo.png'
const Navbar = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Fetch the user role from sessionStorage
    const role = sessionStorage.getItem('role');
    setUserRole(role);
  }, []);

  const handleLogout = () => {
    // Implement your logout logic here
    // For example, navigate to the login page
    
    navigate('/');
  };

  const handleHistory = () => {
    // Implement your history logic here
    // For example, navigate to the history page
    navigate('/flight-details');
  };

  const handleAboutUs = () => {
    // Implement your about us logic here
    // For example, navigate to the about us page
    navigate('/flight-schedule');
  };

  const handleAdminActions = () => {
    // Implement your admin-specific logic here
    // For example, navigate to admin-related pages
    navigate('/airport');
    // You can add more actions for admin as needed
  };

  const renderUserRoleSpecificActions = () => {
    if (userRole === 'Admin') {
      return (
        <>
          <Button color="inherit" onClick={handleAdminActions}>
            Airports
          </Button>
          <Button color="inherit" onClick={handleHistory}>
            Flight Details
          </Button>
          <Button color="inherit" onClick={handleAboutUs}>
            Flight Schedule
          </Button>
        </>
      );
    } else if (userRole === 'User') {
      return (
        <>

          <Button color="inherit" onClick={() => navigate('/homepage')}>
            Search Flights
          </Button>
          <Button color="inherit" onClick={() => navigate('/history')}>
            Past Booking
          </Button>
          <Button color="inherit" onClick={() => navigate('/Cancel')}>
            Recent Booking
          </Button>


        </>
      );
    }
    // You can add more roles and actions as needed
  };

  return (
    <AppBar position="fixed" sx={{ color: 'white' }}>
      <Toolbar>
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', marginRight: '16px' }}>
          <img src={logo} alt="SanjayAirline Logo" style={{ height: '70px', width: '80px' }} />
        </Box>
        
        {/* Typography */}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }} style={{marginRight:450}}>
SanjayAirline        </Typography>
        
        {/* User-specific actions */}
        {renderUserRoleSpecificActions()}
        
        {/* Logout Button */}
        <Button color="inherit" onClick={handleLogout}>
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
