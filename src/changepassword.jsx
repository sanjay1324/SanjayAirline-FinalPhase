import React, { useState } from 'react';
import { Grid, TextField, Button, Typography, Snackbar } from '@mui/material';
import MuiAlert from '@mui/material/Alert';

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleChangePassword = async () => {
    // Assuming you have a function to make the API call
    // Replace 'YOUR_API_ENDPOINT' with your actual API endpoint
    const response = await fetch('https://localhost:7285/api/LoginAndRegisterAuthentication/ChangePassword', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: sessionStorage.getItem('username'),
        currentPassword,
        newPassword,
        confirmPassword,
      }),
    });

    if (response.ok) {
      setOpenSnackbar(true);
      // You can handle further actions on success
    } else {
      // Handle error scenarios
      console.error('Password change failed');
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Grid container spacing={3} justifyContent="center" alignItems="center">
      <Grid item xs={12}>
        <Typography variant="h4">Change Password</Typography>
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Current Password"
          variant="outlined"
          fullWidth
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="New Password"
          variant="outlined"
          fullWidth
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Confirm Password"
          variant="outlined"
          fullWidth
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </Grid>
      <Grid item xs={12}>
        <Button variant="contained" color="primary" onClick={handleChangePassword}>
          Change Password
        </Button>
      </Grid>
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="success">
          Password changed successfully!
        </Alert>
      </Snackbar>
    </Grid>
  );
};

export default ChangePassword;
