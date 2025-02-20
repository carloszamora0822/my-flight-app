import React from 'react';

function FlightItem({ flight, onDelete }) {
  return (
    <li style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
      <span style={{ width: '20%' }}>{flight.time}</span>
      <span style={{ width: '30%' }}>{flight.name}</span>
      <span style={{ width: '25%' }}>{flight.flightType}</span>
      <span style={{ width: '25%' }}>{flight.flightNumber}</span>
      <button onClick={onDelete}>Delete</button>
    </li>
  );
}

export default FlightItem;
