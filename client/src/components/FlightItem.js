import React from 'react';

function FlightItem({ flight, onDelete }) {
  return (
    <div className="history-item">
      <div className="submission-details">
        <span>{flight.time}</span>
        <span>{flight.callsign}</span>
        <span>{flight.type}</span>
        <span>{flight.destination}</span>
      </div>
      <button className="deleteBtn" onClick={onDelete}>
        Delete
      </button>
    </div>
  );
}

export default FlightItem;