import React, { useState, useEffect } from 'react';
import FlightForm from './components/FlightForm';
import FlightList from './components/FlightList';

function App() {
  const [flights, setFlights] = useState([]);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchFlights();
  }, []);

  const fetchFlights = async () => {
    try {
      const response = await fetch('/api/flights');
      const data = await response.json();
      console.log('Fetched flights:', data);
      setFlights(Array.isArray(data) ? data : data.flights || []);
      setLastUpdateTime(new Date());
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
      setLastUpdateTime(new Date());
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
        setLastUpdateTime(new Date());
      } else {
        throw new Error(data.message || 'Failed to delete flight');
      }
    } catch (error) {
      console.error('Error deleting flight:', error);
      alert('Error deleting flight. Please try again.');
    }
  };

  const refreshVestaboard = async () => {
    try {
      setIsRefreshing(true);
      // Call a new endpoint to manually refresh the Vestaboard
      const response = await fetch('/api/flights/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setLastUpdateTime(new Date());
        alert('Vestaboard refresh requested successfully');
      } else {
        alert('Failed to refresh Vestaboard: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error refreshing Vestaboard:', error);
      alert('Error refreshing Vestaboard. Please try again.');
    } finally {
      setIsRefreshing(false);
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
      <div className="refresh-section">
        <p>Last Vestaboard update: {formatLastUpdateTime()}</p>
        <button 
          onClick={refreshVestaboard} 
          disabled={isRefreshing}
          className="refresh-button"
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh Vestaboard'}
        </button>
        <p className="auto-refresh-note">
          (Auto-refreshes 3 minutes after last update)
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
