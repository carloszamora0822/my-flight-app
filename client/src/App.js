import React, { useState, useEffect, useCallback } from 'react';
import FlightForm from './components/FlightForm';
import FlightList from './components/FlightList';

function App() {
  const [flights, setFlights] = useState([]);
  const API_URL = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3001/api';

  const fetchFlights = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/flights`);
      if (!response.ok) {
        throw new Error(`HTTP error 1! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Fetched flights:', data);
      setFlights(data);
    } catch (error) {
      console.error('Error fetching flights:', error);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchFlights();
  }, [fetchFlights]);

  const addFlight = async (newFlight) => {
    try {
      const response = await fetch(`${API_URL}/flights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFlight),
      });
      if (!response.ok) {
        throw new Error(`HTTP error 2! status: ${response.status}`);
      }
      const data = await response.json();
      setFlights(data);
      return data; // Return the data to the FlightForm component
    } catch (error) {
      console.error('Error adding flight:', error);
      throw error; // Throw the error to be caught by FlightForm
    }
  };

  const deleteFlight = async (index) => {
    try {
      const response = await fetch(`${API_URL}/flights/${index}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error 3! status: ${response.status}`);
      }
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
