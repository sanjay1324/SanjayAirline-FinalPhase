// Navbar.js

import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Implement your logout logic here
    // For example, navigate to the login page
    navigate('/');
  };

  const handleHistory = () => {
    // Implement your history logic here
    // For example, navigate to the history page
    navigate('/history');
  };

  const handleAboutUs = () => {
    // Implement your about us logic here
    // For example, navigate to the about us page
    navigate('/aboutus');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          SanjayAirline
        </Typography>
        <Button color="inherit" onClick={handleHistory}>
          History
        </Button>
        <Button color="inherit" onClick={handleAboutUs}>
          About Us
        </Button>
        <Button color="inherit" onClick={handleLogout}>
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
