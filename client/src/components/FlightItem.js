import React from 'react';

function FlightItem({ flight, onDelete }) {
  return (
    <div className="flight-item">
      <p>
        <strong>Time:</strong> {flight.time} | <strong>Callsign:</strong> {flight.callsign} | <strong>Type:</strong> {flight.type} | <strong>Destination:</strong> {flight.destination}
      </p>
      <button onClick={onDelete}>Delete</button>
    </div>
  );
}

export default FlightItem;
