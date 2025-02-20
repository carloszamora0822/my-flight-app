// client/src/components/FlightList.js
import React from 'react';
import FlightItem from './FlightItem';

function FlightList({ flights, deleteFlight }) {
  return (
    <div className="recent-submissions">
      <h2>Recent Flights</h2>
      {/* Header Row */}
      <div className="flight-header" style={{ fontWeight: 'bold', padding: '8px 0' }}>
        <span style={{ display: 'inline-block', width: '20%' }}>Time</span>
        <span style={{ display: 'inline-block', width: '30%' }}>Name</span>
        <span style={{ display: 'inline-block', width: '25%' }}>Flight Type</span>
        <span style={{ display: 'inline-block', width: '25%' }}>Flight Number</span>
      </div>
      {/* Flight Items */}
      <div className="history-list">
        {flights.length > 0 ? (
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {flights.map((flight, index) => (
              <FlightItem
                key={index}
                flight={flight}
                onDelete={() => deleteFlight(index)}
              />
            ))}
          </ul>
        ) : (
          <p>No flights available</p>
        )}
      </div>
    </div>
  );
}

export default FlightList;
