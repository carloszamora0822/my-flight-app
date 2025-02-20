import React, { useState } from 'react';

function FlightForm({ addFlight }) {
  const [time, setTime] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState('PPL');
  const [flightNumber, setFlightNumber] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate time format (military time)
    const timeNum = parseInt(time);
    if (time.length !== 4 || isNaN(timeNum) || timeNum < 0 || timeNum > 2359) {
      alert("Invalid time format. Please use military time (0000-2359)");
      return;
    }

    // Validate that name and flightNumber are provided and not too long
    if (name.length > 6 || flightNumber.length > 6) {
      alert("Name and Flight Number must be 6 characters or less");
      return;
    }

    addFlight({ time, name, type, flightNumber });
    setTime('');
    setName('');
    setType('PPL');
    setFlightNumber('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="time">Time (Military - 4 digits):</label>
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
        <label htmlFor="name">Name (Max 6 chars):</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength="6"
        />
      </div>
      <div className="form-group">
        <label htmlFor="type">Type:</label>
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
        <label htmlFor="flightNumber">Flight Number (Max 6 chars):</label>
        <input
          type="text"
          id="flightNumber"
          value={flightNumber}
          onChange={(e) => setFlightNumber(e.target.value)}
          required
          maxLength="6"
        />
      </div>
      <button type="submit">Submit</button>
    </form>
  );
}

export default FlightForm;
