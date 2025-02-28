import React, { useState, useEffect } from 'react';
import FlightForm from './components/FlightForm';
import FlightList from './components/FlightList';

function App() {
  const [flights, setFlights] = useState([]);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);

  useEffect(() => {
    fetchFlights();
  }, []);

  const fetchFlights = async () => {
    try {
      const response = await fetch('/api/flights');
      const data = await response.json();
      console.log('Fetched flights:', data);
      setFlights(Array.isArray(data) ? data : []);
      if (data.length > 0) {
        setLastUpdateTime(new Date());
      }
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
      if (data.success && data.flights) {
        setFlights(data.flights);
        setLastUpdateTime(new Date());
      }
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
      
      if (data.success && data.flights) {
        setFlights(data.flights);
        setLastUpdateTime(new Date());
      } else {
        throw new Error(data.message || 'Failed to delete flight');
      }
    } catch (error) {
      console.error('Error deleting flight:', error);
      alert('Error deleting flight. Please try again.');
    }
  };

  // Format the last update time
  const formatLastUpdateTime = () => {
    if (!lastUpdateTime) return 'Never';
    
    return lastUpdateTime.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="App">
      <h1>Flight Schedule</h1>
      <div className="status-section">
        <p>Last Vestaboard update: {formatLastUpdateTime()}</p>
        <p className="note">
          (Limited to 5 flights. Newest entries will replace oldest ones.)
        </p>
      </div>
      <FlightForm addFlight={addFlight} />
      <FlightList 
        flights={flights} 
        deleteFlight={deleteFlight}
      />
    </div>
  );
}

export default App;
