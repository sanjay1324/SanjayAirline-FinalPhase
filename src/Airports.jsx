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
} from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from './AxiosInstance';
import Nav from './Navbar'
const Airports = () => {
  const [data, setData] = useState([]);
  const [show, setShow] = useState(false);

  const [airportId, setAirportId] = useState('');
  const [city, setCity] = useState('');
  const [airportName, setAirportName] = useState('');
  const [state, setState] = useState('');

  const [editId, setEditId] = useState('');
  const [editAirportId, setEditAirportId] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editAirportName, setEditAirportName] = useState('');
  const [editState, setEditState] = useState('');

  useEffect(() => {
    getData();
  }, []);

  const getData = () => {
    axiosInstance
      .get('Airports')
      .then((result) => {
        setData(result.data);
      })
      .catch((error) => {
        console.log('An error occurred while fetching data:', error);
      });
  };

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleEdit = (airportId) => {
    handleShow();
    axiosInstance.get(`Airports/${airportId}`).then((result) => {
      setEditAirportId(result.data.airportId);
      setEditCity(result.data.city);
      setEditAirportName(result.data.airportName);
      setEditState(result.data.state);
      setEditId(airportId);
    });
  };

  const handleDelete = (airportId) => {
    if (window.confirm('Are you sure you want to delete?')) {
      axiosInstance
        .delete(`Airports/${airportId}`)
        .then((response) => {
          if (response.status === 200) {
            toast.success('Airport Has Been Deleted Successfully');
            getData();
          }
        })
        .catch((error) => {
          toast.error('An error occurred while deleting the airport:', error);
        });
    }
  };

  const handleUpdate = () => {
    const url = `Airports/${editId}`;

    const updatedData = {
      airportId: editAirportId,
      city: editCity,
      airportName: editAirportName,
      state: editState,
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
        clear();
        toast.success('Airport Has been Updated Successfully');
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleSave = () => {
    const url = `Airports`;
    const newData = {
      airportId: airportId,
      city: city,
      airportName: airportName,
      state: state,
    };

    axiosInstance
      .post(url, newData, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then(() => {
        getData();
        clear();
        toast.success('Airport Added Successfully');
      })
      .catch((error) => {
        toast.error(error);
      });
  };

  const clear = () => {
    setAirportId('');
    setCity('');
    setAirportName('');
    setState('');

    setEditAirportId('');
    setEditCity('');
    setEditAirportName('');
    setEditState('');
    setEditId('');
  };

  return (
    <div style={{marginTop:100}}> 
    <Fragment>
      <Nav />
      <ToastContainer />
      <Container>
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <TextField
              fullWidth
              type="text"
              variant="outlined"
              label="Airport ID"
              value={airportId}
              onChange={(e) => setAirportId(e.target.value)}
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              fullWidth
              variant="outlined"
              type="text"
              label="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              fullWidth
              variant="outlined"
              type="text"
              label="Airport Name"
              value={airportName}
              onChange={(e) => setAirportName(e.target.value)}
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              fullWidth
              variant="outlined"
              label="State"
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
            />
          </Grid>
          <Grid item xs={3}>
            <Button variant="contained" color="primary" onClick={handleSave}>
              Submit
            </Button>
          </Grid>
        </Grid>
      </Container>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Airport ID</TableCell>
              <TableCell>City</TableCell>
              <TableCell>Airport Name</TableCell>
              <TableCell>State</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data && data.length > 0 ? (
              data.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{item.airportId}</TableCell>
                  <TableCell>{item.city}</TableCell>
                  <TableCell>{item.airportName}</TableCell>
                  <TableCell>{item.state}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleEdit(item.airportId)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleDelete(item.airportId)}
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
            label="Airport ID"
            variant="outlined"
            value={editAirportId}
            onChange={(e) => setEditAirportId(e.target.value)}
          />
          <TextField
            fullWidth
            label="City"
            variant="outlined"
            value={editCity}
            onChange={(e) => setEditCity(e.target.value)}
          />
          <TextField
            fullWidth
            label="Airport Name"
            variant="outlined"
            value={editAirportName}
            onChange={(e) => setEditAirportName(e.target.value)}
          />
          <TextField
            fullWidth
            label="State"
            variant="outlined"
            value={editState}
            onChange={(e) => setEditState(e.target.value)}
          />
          <Button variant="contained" color="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="contained" color="primary" onClick={handleUpdate}>
            Save Changes
          </Button>
        </div>
      </Modal>
    </Fragment>
    </div>
  );
};

export default Airports;
