import React, { useState } from 'react';

function FlightForm({ addFlight }) {
  const [time, setTime] = useState('');
  const [callsign, setCallsign] = useState('');
  const [type, setType] = useState('PPL');
  const [destination, setDestination] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate time format (military time)
    const timeNum = parseInt(time);
    if (time.length !== 4 || isNaN(timeNum) || timeNum < 0 || timeNum > 2359) {
      alert("Invalid time format. Please use military time (0000-2359)");
      return;
    }

    if (callsign.length > 6 || destination.length > 6) {
      alert("Name and Flight Number must be 6 characters or less");
      return;
    }

    try {
      const response = await addFlight({ time, callsign, type, destination });
      console.log('Flight added successfully:', response);
      
      // Clear form only if addition was successful
      if (response.success) {
        setTime('');
        setCallsign('');
        setType('PPL');
        setDestination('');
      } else {
        alert('Failed to add flight. Please try again.');
      }
    } catch (error) {
      console.error('Error adding flight:', error);
      alert('Error adding flight. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="time">Time (Military):</label>
        <input
          type="text"
          id="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required
          pattern="[0-9]{4}"
          maxLength="4"
        />
      </div>
      <div className="form-group">
        <label htmlFor="callsign">Name:</label>
        <input
          type="text"
          id="callsign"
          value={callsign}
          onChange={(e) => setCallsign(e.target.value)}
          required
          maxLength="6"
        />
      </div>
      <div className="form-group">
        <label htmlFor="type">Flight Type:</label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="PPL">PPL</option>
          <option value="IFR">IFR</option>
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="destination">Flight Number:</label>
        <input
          type="text"
          id="destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          required
          maxLength="6"
        />
      </div>
      <button type="submit">Add to Queue</button>
    </form>
  );
}

export default FlightForm;
