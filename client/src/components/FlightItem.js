// client/src/components/FlightItem.js
import React from 'react';

function FlightItem({ flight, onDelete }) {
  return (
    <li style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
      <span style={{ width: '20%' }}>{flight.time}</span>
      <span style={{ width: '30%' }}>{flight.callsign}</span>
      <span style={{ width: '25%' }}>{flight.type}</span>
      <span style={{ width: '25%' }}>{flight.destination}</span>
      <button onClick={onDelete}>Delete</button>
    </li>
  );
}

export default FlightItem;
