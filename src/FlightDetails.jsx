import React, { Fragment, useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Modal,
  Container,
  TextField,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from './AxiosInstance';

const FlightDetails = () => {
  const [data, setData] = useState([]);
  const [show, setShow] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    open: false,
    flightNameToDelete: '',
  });

  const [flightName, setFlightName] = useState('');
  const [flightCapacity, setFlightCapacity] = useState('');
  const [isActive, setIsActive] = useState(false); // Change to boolean

  const [editId, setEditId] = useState('');
  const [editflightCapacity, setEditflightCapacity] = useState('');
  const [editIsActive, setEditIsActive] = useState(false); // Change to boolean
  const [editFlightName,setEditFlightName] = useState('');
  useEffect(() => {
    getData();
  }, []);

  const getData = () => {
    axiosInstance
      .get('FlightDetails')
      .then((result) => {
        setData(result.data);
      })
      .catch((error) => {
        console.log('An error occurred while fetching data:', error);
      });
  };

  const handleClose = () => {
    setShow(false);
    clear();
  };

  const handleEdit = (flightName) => {
    setShow(true);
    axiosInstance.get(`FlightDetails/${flightName}`).then((result) => {
      setEditflightCapacity(result.data.flightCapacity);
      setEditIsActive(result.data.isActive);
      setEditId(flightName);
    });
  };

  const handleDeleteClick = (flightName) => {
    setDeleteConfirmation({
      open: true,
      flightNameToDelete: flightName,
    });
  };

  const handleDeleteConfirmationClose = () => {
    setDeleteConfirmation({
      open: false,
      flightNameToDelete: '',
    });
  };

  const handleDeleteConfirmed = () => {
    const flightNameToDelete = deleteConfirmation.flightNameToDelete;

    axiosInstance
      .delete(`FlightDetails/${flightNameToDelete}`)
      .then((response) => {
        if (response.status === 200) {
          toast.success('Airport Has Been Deleted Successfully');
          getData();
        }
      })
      .catch((error) => {
        toast.error('An error occurred while deleting the airport:', error);
      });

    handleDeleteConfirmationClose();
  };

  const handleUpdate = () => {
    const url = `FlightDetails/${editId}`;

    const updatedData = {
      flightName : "SanjayAirline1",
      flightCapacity: editflightCapacity,
      isActive: editIsActive,
    };

    axiosInstance
      .put(url, updatedData, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then(() => {
        handleClose();
        getData();
        toast.success('Airport Has been Updated Successfully');
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleSave = () => {
    const url = 'FlightDetails';
    const newData = {
      flightName,
      flightCapacity,
      isActive,
    };

    axiosInstance
      .post(url, newData, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then(() => {
        getData();
        toast.success('Airport Added Successfully');
        handleClose();
      })
      .catch((error) => {
        toast.error('An error occurred while creating a new airport:', error);
        console.log(error);
      });
  };

  const clear = () => {
    setFlightName('');
    setFlightCapacity('');
    setIsActive(false);
    setEditflightCapacity('');
    setEditIsActive(false);
  };

  return (
    <Fragment>
      <ToastContainer />
      <Container>
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <TextField
              fullWidth
              type="text"
              variant="outlined"
              label="AirportName"
              value={flightName}
              onChange={(e) => setFlightName(e.target.value)}
              disabled={true}
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              fullWidth
              variant="outlined"
              type="text"
              label="Flight Capacity"
              value={flightCapacity}
              onChange={(e) => setFlightCapacity(e.target.value)}
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              fullWidth
              variant="outlined"
              label="isActive"
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
          </Grid>
          <Grid item xs={3}>
            <Button variant="contained" color="primary" onClick={handleSave}>
              Save Changes
            </Button>
          </Grid>
        </Grid>
      </Container>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>ID</TableCell>
              <TableCell>Flight Name</TableCell>
              <TableCell>Flight Capacity</TableCell>
              <TableCell>isActive</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
  {data && data.length > 0 ? (
    data.map((item, index) => (
      <TableRow key={index}>
        <TableCell>{index + 1}</TableCell>
        <TableCell>{item.flightId}</TableCell>
        <TableCell>{item.flightName}</TableCell>
        <TableCell>{item.flightCapacity}</TableCell>
        <TableCell>{item.isActive ? 'Active' : 'Inactive'}</TableCell>
        <TableCell>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleEdit(item.flightName)}
          >
            Edit
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleDeleteClick(item.flightName)}
          >
            Delete
          </Button>
        </TableCell>
      </TableRow>
    ))
  ) : (
    <TableRow>
      <TableCell colSpan={5}>Loading....</TableCell>
    </TableRow>
  )}
</TableBody>

        </Table>
      </TableContainer>
      <Modal open={show} onClose={handleClose}>
        <div
          style={{
            position: 'absolute',
            width: 400,
            backgroundColor: 'white',
            padding: 16,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <TextField
            fullWidth
            label="Flight Name"
            variant="outlined"
            value={editId}
            disabled
          />
          <TextField
            fullWidth
            label="Flight Capacity"
            variant="outlined"
            value={editflightCapacity}
            onChange={(e) => setEditflightCapacity(e.target.value)}
          />
          <TextField
            fullWidth
            label="isActive"
            variant="outlined"
            type="checkbox"
            checked={editIsActive}
            onChange={(e) => setEditIsActive(e.target.checked)}
          />
          <Button variant="contained" color="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="contained" color="primary" onClick={handleUpdate}>
            Save Changes
          </Button>
        </div>
      </Modal>
      <Dialog
        open={deleteConfirmation.open}
        onClose={handleDeleteConfirmationClose}
      >
        <DialogTitle>Delete Confirmation</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the airport with Flight Name{' '}
            <strong>{deleteConfirmation.flightNameToDelete}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteConfirmationClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirmed} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  );
};

export default FlightDetails;
