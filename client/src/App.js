import React, { useState, useEffect, useCallback } from 'react';
import FlightForm from './components/FlightForm';
import FlightList from './components/FlightList';

function App() {
  const [flights, setFlights] = useState([]);
  // Use relative path for API calls
  const API_URL = '/api';

  const fetchFlights = useCallback(async () => {
    try {
      const url = `${API_URL}/flights`;
      console.log('Sending GET request to:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      console.log('GET response status:', response.status);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch flights');
      }
      
      console.log('Fetched flights:', data);
      setFlights(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching flights:', error.message);
      setFlights([]);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchFlights();
  }, [fetchFlights]);

  const addFlight = async (newFlight) => {
    try {
      const url = `${API_URL}/flights`;
      console.log('Sending POST request to:', url, newFlight);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newFlight),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add flight');
      }
      
      console.log('POST success:', data);
      setFlights(Array.isArray(data) ? data : []);
      return data;
    } catch (error) {
      console.error('Error adding flight:', error.message);
      throw error;
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
