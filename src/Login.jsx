import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { Button, Box,TextField, Typography, Container, Link, Grid } from '@mui/material';
import login from './assets/LoginPicture.gif';
import img from "./assets/B.jpg"
function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const decodeToken = (encodedToken) => {
    // Decode the token when needed
    const token = atob(encodedToken); // Decode the Base64 encoded token
    return token;
  };


  const handleLogin = async () => {

    if (!username ) {
      toast.error('Username are required.');
      return;
    }
    if (!password) {
      toast.error('Password are required.');
      return;
    }
    try {
      const response = await fetch(`https://localhost:7285/api/LoginAndRegisterAuthentication/Login`,
       {
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
        sessionStorage.setItem("LoggedIn",true)
        if ( role == 'Admin') {
          const token = decodeToken(data.token);
          sessionStorage.setItem('token', token);
          toast.success('Welcome Admin');
          navigate('/Airport');
        }else if(role === 'User'){
          const token = decodeToken(data.token);
          sessionStorage.setItem('token', token);
          toast.success('Welcome Admin');
          navigate('/homepage');
        } 
        else {
          toast.error('Invalid username or password. Please try again.');
        }
    } else {
      toast.error('Invalid username or password. Please try again.');
    }
  }catch (error) {
    console.log(error)
    setMessage('An error occurred while trying to login.');
  }
}


return (


  <div>
  <Container component="main" maxWidth="xs">
    <ToastContainer/>
   <Box sx={{ display: 'flex', alignItems: 'center', marginRight: '16px' }}>
          <img src={login} alt="SanjayAirline Logo" style={{ marginLeft:55,height: '250px', width: '250px' }} />
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
        Login
      </Button>
      <Grid container>
        <Grid item xs>
          <Link href="/password" variant="body2">
            Forgot password?
          </Link>
        </Grid>
        <Grid item>
          <Link href="/register" variant="body2">
            {"Don't have an account? Sign Up"}
          </Link>
        </Grid>
      </Grid>
      {message && <Typography variant="body2" color="error">{message}</Typography>}
    </form>
  </Container>
  </div>
);
};

export default Login;
