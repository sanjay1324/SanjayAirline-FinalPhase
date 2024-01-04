import * as React from 'react';
import { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { useNavigate } from 'react-router-dom';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import backgroundVideo from './css/image/flight.mp4'; // Import your video file here
import { makeStyles } from '@material-ui/core/styles';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';

// function Copyright(props) {
//   return (
//     <Typography variant="body2" color="text.secondary" align="center" {...props}>
//       {'Copyright © '}
//       <Link color="inherit" href="https://mui.com/">
//         Your Website
//       </Link>{' '}
//       {new Date().getFullYear()}
//       {'.'}
//     </Typography>
//   );
// }



const defaultTheme = createTheme();

export default function SignUp() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('User'); // Default role
  const navigate = useNavigate();

  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);



  const isPasswordMatch = password === confirmPassword;
  const isFormValid =
    firstName.trim() !== '' &&
    lastName.trim() !== '' &&
    username.trim() !== '' &&
    email.trim() !== '' &&
    password.trim() !== '' &&
    confirmPassword.trim() !== '' &&
    isPasswordMatch;

  const handleLoginClick = () => {
    // Use the `navigate` function to redirect to the login page
    navigate('/');
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Check if passwords match before sending data to the API
    if (!isPasswordMatch) {
      alert('Passwords do not match');
      return;
    }

    if (!username) {
      alert('Passwords do not match');
      return;
    }
    if (!email) {
      alert('Passwords do not match');
      return;
    }

    // Define the user registration data based on your JSON structure
    const userData = {
      name: `${firstName} ${lastName}`,
      username: username,
      email: email,
      password: password,
      role: "User",
    };

    // Send the user registration data to your API for registration
    fetch('http://192.168.10.54:88/api/LoginAndRegisterAuthentication/Registration', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })
      .then((response) => response.json())
      .then((data) => {
        // Handle the response from the API (registration response)
        console.log('Registration response:', data);

        toast.success("Registration Succesfully!Navigate to Login Page")
        // Redirect or perform other actions as needed
        console.log(email)

        fetch('http://192.168.10.54:88/api/Email/Successful', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        })
          .then(response => response.json())
          .then(data => {
            console.log(data);
            navigate('/');
          })
          .catch(error => {
            console.error('Error:', error);
          });

      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  return (
    <div className='login' style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
      <ToastContainer/>
      <video autoPlay loop muted style={{
        position: 'absolute',
        width: '120%',
        left: '50%',
        top: '50%',
        height: '150%',
        objectFit: 'cover',
        transform: 'translate(-50%, -50%)',
        zIndex: '-1'
      }}>
        <source src={backgroundVideo} type="video/mp4" />
      </video>
      <ThemeProvider theme={defaultTheme}>
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Sign up
            </Typography>
            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="firstName"
                    label="First Name"
                    name="firstName"
                    autoComplete="given-name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    error={Boolean(firstNameError)}
                    helperText={firstNameError}
                    style={{ color: 'black' }} // Add this line to set the text color to black

                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="lastName"
                    label="Last Name"
                    name="lastName"
                    autoComplete="family-name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    error={Boolean(lastNameError)}
                    helperText={lastNameError}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="username"
                    label="Username"
                    name="username"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    error={Boolean(usernameError)}
                    helperText={usernameError}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={Boolean(emailError)}
                    helperText={emailError}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={Boolean(passwordError)}
                    helperText={passwordError}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <Visibility /> : <VisibilityOff />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    name="confirmPassword"
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    error={Boolean(confirmPasswordError)}
                    helperText={confirmPasswordError}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                          >
                            {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  {!isPasswordMatch && (
                    <Typography variant="caption" color="error">
                      Passwords do not match
                    </Typography>
                  )}
                </Grid>

                {/* <Grid item xs={12}>
                <Select
                  fullWidth
                  label="Role"
                  id="role"
                  value={"User"}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <MenuItem value="User">User</MenuItem>

                </Select>
              </Grid> */}
              </Grid>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={!isFormValid}
              >
                Sign Up
              </Button>
              <Grid container justifyContent="flex-end">
                <Grid item>
                  <Button>
                    <Link to="/" variant="body2" color='secondary' onClick={handleLoginClick}>
                      Already have an account? Sign in
                    </Link>
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Box>
          {/* <Copyright sx={{ mt: 5 }} /> */}
        </Container>
      </ThemeProvider>
    </div>
  );
}
