// ConfirmModal.js
import React from 'react';
import { Modal, Button, Typography } from '@mui/material';

const ConfirmModal = ({ passengers, onCancel, onConfirm }) => {
  return (
    <Modal open={true} onClose={onCancel}>
      <div>
        <Typography variant="h4">Confirm Your Selection</Typography>
        {passengers.map((passenger, index) => (
          <div key={index}>
            <Typography>{`Passenger ${index + 1}: ${passenger.name}, Seat: ${passenger.seatNo}`}</Typography>
          </div>
        ))}
        <Button onClick={onConfirm}>Confirm</Button>
        <Button onClick={onCancel}>Cancel</Button>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
