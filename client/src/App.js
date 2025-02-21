import React, { useState, useEffect } from 'react';
import FlightForm from './components/FlightForm';
import FlightList from './components/FlightList';

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
      console.log('Deleting flight at index:', index);
      const response = await fetch(`/api/flights/${index}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      console.log('Delete response:', data);
      
      if (data.success) {
        setFlights(data.flights || []);
      } else {
        throw new Error(data.message || 'Failed to delete flight');
      }
    } catch (error) {
      console.error('Error deleting flight:', error);
      alert('Error deleting flight. Please try again.');
    }
  };

  return (
    <div className="App">
      <h1>Flight Schedule</h1>
      <FlightForm addFlight={addFlight} />
      <FlightList 
        flights={flights} 
        deleteFlight={deleteFlight}
      />
    </div>
  );
}

export default App;
