import React, { useState, useEffect } from 'react';
import FlightForm from './components/FlightForm';
import FlightList from './components/FlightList';
import FlightItem from './components/FlightItem';

function App() {
  const [flights, setFlights] = useState([]);

  useEffect(() => {
    fetchFlights();
  }, []);

  const fetchFlights = async () => {
    try {
      const response = await fetch('/api/flights');
      const data = await response.json();
      console.log('Fetched flights:', data);
      setFlights(Array.isArray(data) ? data : data.flights || []);
    } catch (error) {
      console.error('Error fetching flights:', error);
    }
  };

  const addFlight = async (newFlight) => {
    try {
      const response = await fetch('/api/flights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFlight)
      });
      const data = await response.json();
      console.log('Add flight response:', data);
      
      // Update the flights state with the new data
      setFlights(data.flights || []);
      return data;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };

  const deleteFlight = async (index) => {
    try {
      const response = await fetch(`/api/flights/${index}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      setFlights(data);
    } catch (error) {
      console.error('Error deleting flight:', error);
    }
  };

  return (
    <div className="App">
      <h1>Flight Schedule</h1>
      <FlightForm addFlight={addFlight} />
      <div className="flights-list">
        {flights.map((flight, index) => (
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

export default App;
