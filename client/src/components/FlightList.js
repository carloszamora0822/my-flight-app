import React from 'react';
import FlightItem from './FlightItem';

function FlightList({ flights, deleteFlight }) {
  return (
    <div className="recent-submissions">
      <h2>Recent Flights</h2>
      <div className="history-list">
        {flights.slice(-5).map((flight, index) => (
          <FlightItem
            key={index}
            flight={flight}
            onDelete={() => deleteFlight(index)}
          />
        ))}
      </div>
    </div>
  );
}

export default FlightList;
