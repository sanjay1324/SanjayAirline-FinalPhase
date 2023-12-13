import React, { useState } from 'react';
import axios from 'axios';
import axiosInstance from '../../AxiosInstance';

const BookingForm = () => {
  const [numberOfTickets, setNumberOfTickets] = useState(1);
  const [bookingData, setBookingData] = useState({
    Booking: { UserId: '', BookingType: '' },
    FlightTicket: { ScheduleId: '', Name: '', Age: '', Gender: '' },
  });

  const handleInputChange = (field, value) => {
    setBookingData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleCreateBooking = async () => {
    try {
      const response = await axiosInstance.post(
        `BookingMethod2/CreateBooking/${numberOfTickets}`,
        bookingData
      );
      console.log('Booking created:', response.data);
    } catch (error) {
      console.error('Error creating booking:', error.response.data);
    }
  };

  return (
    <div>
      <label>
        Number of Tickets:
        <input
          type="number"
          value={numberOfTickets}
          onChange={(e) => setNumberOfTickets(e.target.value)}
        />
      </label>
      {/* Add input fields for other booking details */}
      <button onClick={handleCreateBooking}>Create Booking</button>
    </div>
  );
};

export default BookingForm;
