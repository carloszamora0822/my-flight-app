import React, { useState, useEffect, useCallback } from 'react';
import FlightForm from './components/FlightForm';
import FlightList from './components/FlightList';

function App() {
  const [flights, setFlights] = useState([]);
  const API_URL = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3001/api';

  // Define and memoize fetchFlights so that it doesn't change on every render
  const fetchFlights = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/flights`);
      const data = await response.json();
      setFlights(data);
    } catch (error) {
      console.error('Error fetching flights:', error);
    }
  }, [API_URL]);

  // Call fetchFlights once on component mount
  useEffect(() => {
    fetchFlights();
  }, [fetchFlights]);

  const addFlight = async (newFlight) => {
    try {
      const response = await fetch(`${API_URL}/flights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newFlight),
      });
      const data = await response.json();
      setFlights(data);
    } catch (error) {
      console.error('Error adding flight:', error);
    }
  };

  const deleteFlight = async (index) => {
    try {
      const response = await fetch(`${API_URL}/flights/${index}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      setFlights(data);
    } catch (error) {
      console.error('Error deleting flight:', error);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>Flight Data App</h1>
      </header>
      <main>
        <FlightForm addFlight={addFlight} />
        <FlightList flights={flights} deleteFlight={deleteFlight} />
      </main>
    </div>
  );
}

export default App;
