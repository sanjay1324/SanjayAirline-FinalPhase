import React, { useState } from 'react';
import axios from 'axios';

const SeatUpdateForm = () => {
  const [bookingId, setBookingId] = useState('');
  const [seatNumber, setSeatNumber] = useState('');

  const handleUpdateSeats = async () => {
    try {
      const response = await axios.put(`api/BookingMethod2/update-seats/${bookingId}`, {
        SeatNumber: seatNumber,
      });
      console.log('Seats updated:', response.data);
    } catch (error) {
      console.error('Error updating seats:', error.response.data);
    }
  };

  return (
    <div>
      <label>
        Booking ID:
        <input type="text" value={bookingId} onChange={(e) => setBookingId(e.target.value)} />
      </label>
      <label>
        Seat Number:
        <input
          type="text"
          value={seatNumber}
          onChange={(e) => setSeatNumber(e.target.value)}
        />
      </label>
      <button onClick={handleUpdateSeats}>Update Seats</button>
    </div>
  );
};

export default SeatUpdateForm;
