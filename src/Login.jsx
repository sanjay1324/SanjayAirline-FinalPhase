import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { Button, Box, TextField, Typography, Container, Link, Grid, CircularProgress } from '@mui/material';
import login from './assets/LoginPicture.gif';

import backgroundVideo from './css/image/flight.mp4'; // Import your video file here

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false); // New state for loading
  const navigate = useNavigate();
  sessionStorage.setItem('LoggedIn',false)

  const decodeToken = (encodedToken) => {
    // Decode the token when needed
    const token = atob(encodedToken); // Decode the Base64 encoded token
    return token;
  };

  const handleLogin = async () => {
    if (!username) {
      toast.error('Username is required.');
      return;
    }
    if (!password) {
      toast.error('Password is required.');
      return;
    }

    try {
      setLoading(true); // Set loading to true when starting the request

      const response = await fetch('https://localhost:7285/api/LoginAndRegisterAuthentication/Login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Username: username, Password: password }),
      });

      if (response.ok) {
        const data = await response.json();
        sessionStorage.setItem('userId', data.userId);
        sessionStorage.setItem('username', username);
        sessionStorage.setItem('role', data.role);
        const role = sessionStorage.getItem('role');
        sessionStorage.setItem("LoggedIn", true);
        sessionStorage.setItem("Email",data.email)
        if (role === 'Admin' || role === 'User') {
          const token = decodeToken(data.token);
          sessionStorage.setItem('token', token);
          toast.success(`Welcome ${role}`);
          navigate(role === 'Admin' ? '/Airport' : '/homepage');
        } else {
          toast.error('Invalid username or password. Please try again.');
        }
      } else {
        toast.error('Invalid username or password. Please try again.');
      }
    } catch (error) {
      console.error(error);
      setMessage('An error occurred while trying to login.');
    } finally {
      setLoading(false); // Set loading to false when request is complete
    }
  };

  return (
    <div className='login' style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
      <video autoPlay loop muted style={{
        position: 'absolute',
        width: '120%',
        left: '50%',
        top: '50%',
        height: '100%',
        objectFit: 'cover',
        transform: 'translate(-50%, -50%)',
        zIndex: '-1'
      }}>
        <source src={backgroundVideo} type="video/mp4" />
      </video>
    <div className='login' style={{marginTop:250}}>
      <Container component="main" maxWidth="xs">
        <ToastContainer />
        <Box sx={{ display: 'flex', alignItems: 'center', marginRight: '16px' }}>
          {/* <img src={login} alt="SanjayAirline Logo" style={{ marginLeft: 55, height: '250px', width: '250px' }} /> */}
        </Box>
        <Typography component="h1" variant="h5">
          Login
        </Typography>
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
        >
          <TextField
            variant="outlined"
            margin="normal"
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            variant="outlined"
            margin="normal"
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" fullWidth variant="contained" color="primary">
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Login'
            )}
          </Button>
          <Grid container>
            <Grid item xs>
              <Button><Link href="/password" variant="body3" color='secondary'>
                Forgot password?
              </Link></Button>
            </Grid>
            
          </Grid>

          <Grid item>
              <Button><Link href="/register" variant="body3" color='secondary'>
                {"Don't have an account? Sign Up"}
              </Link></Button>
            </Grid>
          {message && <Typography variant="body2" color="error">{message}</Typography>}
        </form>
      </Container>
    </div>
    </div>
  );
}

export default Login;
