import React from 'react';

function FlightItem({ flight, onDelete }) {
  return (
    <div className="flight-item">
      <p>
        <strong>Time:</strong> {flight.time} | <strong>Name:</strong> {flight.callsign} | <strong>Flight Type:</strong> {flight.type} | <strong>Flight Number:</strong> {flight.destination}
      </p>
      <button onClick={onDelete}>Delete</button>
    </div>
  );
}//

export default FlightItem;
