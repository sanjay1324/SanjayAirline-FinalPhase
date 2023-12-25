import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Drawer, List, ListItem, ListItemText } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import logo from '../src/assets/Logo.png';
import Cookies from 'js-cookie';

const Navbar = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    // Fetch the user role from sessionStorage
    const role = sessionStorage.getItem('role');
    setUserRole(role);

    // Update mobile view state on component mount
    updateMobileView();
    
    // Event listener for window resize
    window.addEventListener('resize', updateMobileView);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('resize', updateMobileView);
    };
  }, []);

  const updateMobileView = () => {
    setIsMobileView(window.innerWidth < 600); // Adjust the threshold as needed
  };

  const handleLogout = () => {
    // Implement your logout logic here
    // For example, navigate to the login page
    sessionStorage.clear();
    Object.keys(Cookies.get()).forEach((cookieName) => {
      Cookies.remove(cookieName);
    });
    navigate('/');
  };

  const handleDrawerOpen = () => {
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
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
    <>
      {/* Appbar */}
      <AppBar position="fixed" sx={{ color: 'white' }}>
        <Toolbar>
          {/* Menu Icon for Mobile */}
          {isMobileView && (
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleDrawerOpen}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', marginRight: '16px' }}>
            <img src={logo} alt="SanjayAirline Logo" style={{ height: '70px', width: '80px' }} />
          </Box>

          {/* Typography */}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            SanjayAirline
          </Typography>

          {/* User-specific actions */}
          {!isMobileView && renderUserRoleSpecificActions()}

          {/* Logout Button */}
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* Drawer for Mobile */}
      {isMobileView && (
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={handleDrawerClose}
          ModalProps={{ keepMounted: true }}
        >
          <List sx={{ width: 250 }}>
            {renderUserRoleSpecificActions()}

            {/* Logout Button in Drawer */}
            <ListItem button key="Logout" onClick={handleLogout}>
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        </Drawer>
      )}
    </>
  );
};

export default Navbar;
