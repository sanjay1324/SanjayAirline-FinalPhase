import React, { useState } from 'react';


  const BookingForm = () => {
    const [booking, setBooking] = useState({
      userId: sessionStorage.getItem('userId'),
      bookingType: sessionStorage.getItem('bookingType')
    });
  
    const [flightTickets, setFlightTickets] = useState([
      {
        scheduleId: sessionStorage.getItem('scheduleId'), // Ensure scheduleId is set correctly
        name: '',
        age: 0,
        gender: '',
        seatNo: ''
      }
    ]);
  
    const handleInputChange = (index, event) => {
      const { name, value } = event.target;
      const updatedFlightTickets = [...flightTickets];
      updatedFlightTickets[index][name] = value;
      setFlightTickets(updatedFlightTickets);
    };
  
    const addFlightTicket = () => {
      const newTicket = {
        scheduleId: sessionStorage.getItem('scheduleId'), // Set the scheduleId for the new ticket
        name: '',
        age: 0,
        gender: '',
        seatNo: ''
      };
      setFlightTickets([...flightTickets, newTicket]);
    };
  
    const handleSubmit = async (event) => {
      event.preventDefault();
  
      try {
        const response = await fetch('https://localhost:7285/api/BookingMethod2/CreateBooking', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ booking, flightTickets }),
        });
  
        const data = await response.json();
        console.log('Booking response:', data);
      } catch (error) {
        console.error('Error creating booking:', error);
      }
    };
  
    console.log('Schedule ID:', sessionStorage.getItem('scheduleId'));

  return (
    <div>
      <h2>Create Booking</h2>
      <form onSubmit={handleSubmit}>
        <label>
          User ID:
          <input
            type="text"
            name="userId"
            value={booking.userId}
            onChange={(e) => setBooking({ ...booking, userId: e.target.value })}
          />
        </label>
        <br />
        <label>
          Booking Type:
          <input
            type="text"
            name="bookingType"
            value={booking.bookingType}
            onChange={(e) => setBooking({ ...booking, bookingType: e.target.value })}
          />
        </label>
        <br />

        <h3>Flight Tickets</h3>
        {flightTickets.map((ticket, index) => (
          <div key={index}>
            <label>
              Name:
              <input
                type="text"
                name="name"
                value={ticket.name}
                onChange={(e) => handleInputChange(index, e)}
              />
            </label>
            <br />
            <label>
              Age:
              <input
                type="number"
                name="age"
                value={ticket.age}
                onChange={(e) => handleInputChange(index, e)}
              />
            </label>
            <br />
            <label>
              Gender:
              <input
                type="text"
                name="gender"
                value={ticket.gender}
                onChange={(e) => handleInputChange(index, e)}
              />
            </label>
            <br />
            <label>
              Seat No:
              <input
                type="text"
                name="seatNo"
                value={ticket.seatNo}
                onChange={(e) => handleInputChange(index, e)}
              />
            </label>
            <br />
          </div>
        ))}
        <button type="button" onClick={addFlightTicket}>
          Add Flight Ticket
        </button>

        <br />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}


export default BookingForm;
