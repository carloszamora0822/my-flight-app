import React from 'react';
import FlightItem from './FlightItem';

function FlightList({ flights, deleteFlight }) {
  return (
    <div className="recent-submissions">
      <h2>Recent Flights</h2>
      <div className="history-list">
        {flights.length > 0 ? (
          <ul>
            {flights.map((flight, index) => (
              <FlightItem
                key={index}
                flight={flight}
                onDelete={async () => {
                  try {
                    await deleteFlight(index);
                  } catch (error) {
                    console.error('Error deleting flight:', error);
                    alert('Error deleting flight. Please try again.');
                  }
                }}
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
