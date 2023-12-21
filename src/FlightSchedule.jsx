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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
} from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from './AxiosInstance';

const FlightSchedule = () => {
    const [flightDetails, setFlightDetails] = useState([]);
    const [airportDetails, setAirportDetails] = useState([]);
    const [data, setData] = useState([]);
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);

    const [flightName, setFlightName] = useState('');
    const [sourceAirportId, setSourceAirportId] = useState('');
    const [destinationAirportId, setDestinationAirportId] = useState('');
    const [flightDuration, setFlightDuration] = useState('');
    const [dateTime, setDateTime] = useState('');

    const [editData, setEditData] = useState({
        scheduleId: null,
        flightName: '',
        sourceAirportId: '',
        destinationAirportId: '',
        flightDuration: '',
        dateTime: '',
    });
    const [deleteConfirmation, setDeleteConfirmation] = useState({
        open: false,
        scheduleIdToDelete: null,
    });

    useEffect(() => {
        fetchFlightDetails();
        fetchAirportDetails();
        fetchFlightSchedules();
    }, []);

    const fetchFlightDetails = () => {
        axiosInstance.get('FlightDetails').then((result) => {
            setFlightDetails(result.data);
        });
    };

    const fetchAirportDetails = () => {
        axiosInstance.get('Airports').then((result) => {
            setAirportDetails(result.data);
        });
    };

    const fetchFlightSchedules = () => {
        setLoading(true);
        axiosInstance.get('FlightSchedules').then((result) => {
            setData(result.data);
            setLoading(false);
        });
    };

    const handleClose = () => {
        setShow(false);
        clear();
    };

    const handleSave = () => {
        const url = 'FlightSchedules/CreateSchedulesFor7Days';
        const newData = {
            flightName,
            sourceAirportId,
            destinationAirportId,
            flightDuration,
            dateTime,
        };

        axiosInstance
            .post(url, newData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            .then(() => {
                fetchFlightSchedules();
                toast.success('Flight Schedule Added Successfully');
                handleClose();
            })
            .catch((error) => {
                toast.error('An error occurred while creating a new flight schedule:', error);
                console.log(error)
            });
    };

    const handleEdit = (scheduleId) => {
        setShow(true);
        axiosInstance.get(`FlightSchedules/${scheduleId}`).then((result) => {
            const { scheduleId, flightName, sourceAirportId, destinationAirportId, flightDuration, dateTime } = result.data;
            setEditData({
                flightName: result.data.flightName,
        sourceAirportId: result.data.sourceAirportId,
        destinationAirportId: result.data.destinationAirportId,
        flightDuration: result.data.flightDuration,
        dateTime: result.data.dateTime,
            });
        });
    };

    const handleDelete = (scheduleId) => {
        setDeleteConfirmation({
            open: true,
            scheduleIdToDelete: scheduleId,
        });
    };

    const handleDeleteConfirmationClose = () => {
        setDeleteConfirmation({
            open: false,
            scheduleIdToDelete: null,
        });
    };

    const handleDeleteConfirmed = () => {
        const scheduleIdToDelete = deleteConfirmation.scheduleIdToDelete;

        axiosInstance
            .delete(`FlightSchedules/${scheduleIdToDelete}`)
            .then(() => {
                fetchFlightSchedules();
                toast.success('Flight Schedule Deleted Successfully');
            })
            .catch((error) => {
                toast.error('An error occurred while deleting the flight schedule:', error);
            });

        handleDeleteConfirmationClose();
    };

    const clear = () => {
        setFlightName('');
        setSourceAirportId('');
        setDestinationAirportId('');
        setFlightDuration('');
        setDateTime('');
    };

    return (
        <Fragment>
            <ToastContainer />
            <Container>
                <Grid container spacing={2}>
                    <Grid item xs={3}>
                        <FormControl fullWidth variant="outlined">
                            <InputLabel>Flight Name</InputLabel>
                            <Select
                                value={flightName}
                                onChange={(e) => setFlightName(e.target.value)}
                                label="Flight Name"
                            >
                                {flightDetails.map((flightDetails) => (
                                    <MenuItem key={flightDetails.flightName} value={flightDetails.flightName}>
                                        {flightDetails.flightName}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={3}>
                        <FormControl fullWidth variant="outlined">
                            <InputLabel>Source Airport</InputLabel>
                            <Select
                                value={sourceAirportId}
                                onChange={(e) => setSourceAirportId(e.target.value)}
                                label="Source Airport"
                            >
                                {airportDetails.map((airport) => (
                                    <MenuItem key={airport.airportId} value={airport.airportId}>
                                        {airport.city}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={3}>
                        <FormControl fullWidth variant="outlined">
                            <InputLabel>Destination Airport</InputLabel>
                            <Select
                                value={destinationAirportId}
                                onChange={(e) => setDestinationAirportId(e.target.value)}
                                label="Destination Airport"
                            >
                                {airportDetails.map((airport) => (
                                    <MenuItem key={airport.airportId} value={airport.airportId}>
                                        {airport.city}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={3}>
                        <TextField
                            fullWidth
                            label="Flight Duration"
                            variant="outlined"
                            value={flightDuration}
                            onChange={(e) => setFlightDuration(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={3}>
                        <TextField
                            fullWidth
                            label="Date and Time"
                            variant="outlined"
                            type="datetime-local"
                            value={dateTime}
                            onChange={(e) => setDateTime(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={3}>
                        <Button variant="contained" color="primary" onClick={handleSave}>
                            Save Changes
                        </Button>
                    </Grid>
                </Grid>
            </Container>
            {loading && <CircularProgress />}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>#</TableCell>
                            <TableCell>Flight Name</TableCell>
                            <TableCell>Source Airport</TableCell>
                            <TableCell>Destination Airport</TableCell>
                            <TableCell>Flight Duration</TableCell>
                            <TableCell>Date and Time</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7}>
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{item.flightName}</TableCell>
                                    <TableCell>{item.sourceAirportId}</TableCell>
                                    <TableCell>{item.destinationAirportId}</TableCell>
                                    <TableCell>{item.flightDuration}</TableCell>
                                    <TableCell>{item.dateTime}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={() => handleEdit(item.scheduleId)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={() => handleDelete(item.scheduleId)}
                                        >
                                            Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={show} onClose={handleClose}>
  <DialogTitle>Edit Flight Schedule</DialogTitle>
  <DialogContent>
    <FormControl fullWidth variant="outlined">
      <InputLabel>Flight Name</InputLabel>
      <Select
        value={editData.flightName}
        onChange={(e) => setEditData({ ...editData, flightName: e.target.value })}
        label="Flight Name"
      >
        {flightDetails.map((flight) => (
          <MenuItem key={flight.flightName} value={flight.flightName}>
            {flight.flightName}
          </MenuItem>
        ))}
      </Select>
    </FormControl>

    <FormControl fullWidth variant="outlined">
      <InputLabel>Source Airport</InputLabel>
      <Select
        value={editData.sourceAirportId}
        onChange={(e) => setEditData({ ...editData, sourceAirportId: e.target.value })}
        label="Source Airport"
      >
        {airportDetails.map((airport) => (
          <MenuItem key={airport.airportId} value={airport.airportId}>
            {airport.airportId}
          </MenuItem>
        ))}
      </Select>
    </FormControl>

    <FormControl fullWidth variant="outlined">
      <InputLabel>Destination Airport</InputLabel>
      <Select
        value={editData.destinationAirportId}
        onChange={(e) => setEditData({ ...editData, destinationAirportId: e.target.value })}
        label="Destination Airport"
      >
        {airportDetails.map((airport) => (
          <MenuItem key={airport.airportId} value={airport.airportId}>
            {airport.airportId}
          </MenuItem>
        ))}
      </Select>
    </FormControl>

    <TextField
      fullWidth
      label="Flight Duration"
      variant="outlined"
      value={editData.flightDuration}
      onChange={(e) => setEditData({ ...editData, flightDuration: e.target.value })}
    />

    <TextField
      fullWidth
      label="Date and Time"
      variant="outlined"
      type="datetime-local"
      value={editData.dateTime}
      onChange={(e) => setEditData({ ...editData, dateTime: e.target.value })}
    />
  </DialogContent>
  <DialogActions>
    <Button onClick={handleClose} color="primary">
      Cancel
    </Button>
    <Button onClick={handleSave} color="primary">
      Save Changes
    </Button>
  </DialogActions>
</Dialog>


            <Dialog
                open={deleteConfirmation.open}
                onClose={handleDeleteConfirmationClose}
            >
                <DialogTitle>Delete Confirmation</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this flight schedule?
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

export default FlightSchedule;
