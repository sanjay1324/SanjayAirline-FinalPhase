import React, { useEffect, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import logo from '../src/assets/Logo.png';

const Navbar = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [sessionTime, setSessionTime] = useState(10 * 60 * 1000); // Initial session time in milliseconds (30 minutes)
  const [remainingTime, setRemainingTime] = useState(sessionTime);
  const [shouldResetTimer, setShouldResetTimer] = useState(true);

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

  useEffect(() => {
    let inactivityTimer;

    const resetTimer = () => {
      if (shouldResetTimer) {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
          sessionStorage.clear();
          navigate('/');
        }, sessionTime);
        setShouldResetTimer(false);
      }
    };

    const handleUserActivity = () => {
      resetTimer();
    };

    document.addEventListener('mousemove', handleUserActivity);
    document.addEventListener('keydown', handleUserActivity);

    resetTimer();

    const timerInterval = setInterval(() => {
      setRemainingTime((prevTime) => Math.max(0, prevTime - 1000));
    }, 1000);

    return () => {
      clearTimeout(inactivityTimer);
      document.removeEventListener('mousemove', handleUserActivity);
      document.removeEventListener('keydown', handleUserActivity);
      clearInterval(timerInterval);
    };
  }, [navigate, remainingTime, shouldResetTimer, sessionTime]);

  const handleLogout = () => {
    sessionStorage.clear();
    Object.keys(Cookies.get()).forEach((cookieName) => {
      Cookies.remove(cookieName);
    });
    navigate('/');
    setShouldResetTimer(true);
  };

  const handleDrawerOpen = () => {
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setShouldResetTimer(false);
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

  const handlePartnerHistory = () => {
    // Implement your history logic here
    // For example, navigate to the history page
    navigate('/admin-history');
  };

  const renderUserRoleSpecificActions = () => {
    if (userRole === 'Admin') {
      return [
        { label: 'Airports', onClick: handleAdminActions },
        { label: 'Flight Details', onClick: handleHistory },
        { label: 'Flight Schedule', onClick: handleAboutUs },
        { label: 'Partner History', onClick: handlePartnerHistory },
      ];
    } else if (userRole === 'User') {
      return [
        { label: 'Search Flights', onClick: () => navigate('/homepage') },
        { label: 'Past Booking', onClick: () => navigate('/history') },
        { label: 'Recent Booking', onClick: () => navigate('/Cancel') },
      ];
    }
    // You can add more roles and actions as needed
    return [];
  };

  const formatTime = (milliseconds) => {
    const minutes = Math.floor(milliseconds / (60 * 1000));
    const seconds = Math.floor((milliseconds % (60 * 1000)) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <>
      <AppBar position="fixed" sx={{ backgroundColor: '#ACBB78', color: 'black' }}>
        <Toolbar>
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

          <Box sx={{ display: 'flex', alignItems: 'center', marginRight: '16px' }}>
            <img src={logo} alt="SanjayAirline Logo" style={{ height: '70px', width: '80px' }} />
          </Box>

          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            SanjayAirline
          </Typography>

          {!isMobileView && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {renderUserRoleSpecificActions().map((action, index) => (
                <Button
                  key={index}
                  color="inherit"
                  onClick={action.onClick}
                  sx={{
                    transition: 'background-color 0.3s',
                    '&:hover': {
                      backgroundColor: '#84cda1',
                    },
                  }}
                >
                  {action.label}
                </Button>
              ))}
            </Box>
          )}

          {userRole === 'User' && (
            <Typography variant="body2" sx={{ marginLeft: 2, color: 'red' }}>
              Session Time: {formatTime(remainingTime)}
            </Typography>
          )}

          {userRole ? (
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          ) : (
            <Button color="inherit" onClick={() => navigate('/')}>
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {isMobileView && (
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={handleDrawerClose}
          ModalProps={{ keepMounted: true }}
        >
          <List sx={{ width: 250 }}>
            {renderUserRoleSpecificActions().map((action, index) => (
              <ListItem button key={index} onClick={action.onClick}>
                <ListItemText primary={action.label} />
              </ListItem>
            ))}

            <ListItem button key="Logout" onClick={handleLogout}>
              <ListItemText primary={userRole ? 'Logout' : 'Login'} />
            </ListItem>
          </List>
        </Drawer>
      )}
    </>
  );
};

export default Navbar;
