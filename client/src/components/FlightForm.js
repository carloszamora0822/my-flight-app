import React, { useState } from 'react';

function FlightForm({ addFlight }) {
  // Descriptive variable names corresponding to flight object properties
  const [flightTime, setFlightTime] = useState('');
  const [pilotName, setPilotName] = useState('');
  const [flightType, setFlightType] = useState('PPL');
  const [flightNumber, setFlightNumber] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate time format (military time)
    const timeNum = parseInt(flightTime);
    if (flightTime.length !== 4 || isNaN(timeNum) || timeNum < 0 || timeNum > 2359) {
      alert("Invalid time format. Please use military time (0000-2359)");
      return;
    }

    // Validate that pilotName and flightNumber are provided and no longer than 6 characters.
    if (pilotName.trim().length === 0 || flightNumber.trim().length === 0 || pilotName.length > 6 || flightNumber.length > 6) {
      alert("Name and Flight Number must be provided and be 6 characters or less");
      return;
    }

    // Create a flight object using the descriptive keys
    const newFlight = {
      time: flightTime,
      name: pilotName,
      flightType,
      flightNumber
    };

    addFlight(newFlight);

    // Clear the form fields
    setFlightTime('');
    setPilotName('');
    setFlightType('PPL');
    setFlightNumber('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="flightTime">Time (Military - 4 digits):</label>
        <input
          type="text"
          id="flightTime"
          value={flightTime}
          onChange={(e) => setFlightTime(e.target.value)}
          required
          pattern="[0-9]{4}"
          maxLength="4"
        />
      </div>
      <div className="form-group">
        <label htmlFor="pilotName">Name (Max 6 chars):</label>
        <input
          type="text"
          id="pilotName"
          value={pilotName}
          onChange={(e) => setPilotName(e.target.value)}
          required
          maxLength="6"
        />
      </div>
      <div className="form-group">
        <label htmlFor="flightType">Flight Type:</label>
        <select
          id="flightType"
          value={flightType}
          onChange={(e) => setFlightType(e.target.value)}
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
