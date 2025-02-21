import React, { useState, useEffect, useCallback } from 'react';
import FlightForm from './components/FlightForm';
import FlightList from './components/FlightList';

function App() {
  const [flights, setFlights] = useState([]);
  const API_URL = '/api';

  const fetchFlights = useCallback(async () => {
    console.log('Fetching flights...');
    try {
      const url = `${API_URL}/flights`;
      console.log('GET request to:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      console.log('GET response status:', response.status);
      
      const text = await response.text();
      console.log('Raw response:', text);
      
      const data = text ? JSON.parse(text) : [];
      console.log('Parsed data:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch flights');
      }
      
      setFlights(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Fetch error details:', {
        message: error.message,
        stack: error.stack
      });
      setFlights([]);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchFlights();
  }, [fetchFlights]);

  const addFlight = async (newFlight) => {
    console.log('Adding flight:', newFlight);
    try {
      const url = `${API_URL}/flights`;
      console.log('POST request to:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newFlight),
      });
      
      console.log('POST response status:', response.status);
      
      const text = await response.text();
      console.log('Raw response:', text);
      
      const data = text ? JSON.parse(text) : null;
      console.log('Parsed data:', data);
      
      if (!response.ok) {
        throw new Error(data?.message || 'Failed to add flight');
      }
      
      setFlights(Array.isArray(data) ? data : []);
      return data;
    } catch (error) {
      console.error('Add flight error details:', {
        message: error.message,
        stack: error.stack
      });
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
