import React, { useState, useEffect } from 'react';
import FlightForm from './components/FlightForm';
import FlightList from './components/FlightList';
import EventForm from './components/EventForm';
import EventList from './components/EventList';

function App() {
  const [flights, setFlights] = useState([]);
  const [events, setEvents] = useState([]);
  const [lastFlightUpdate, setLastFlightUpdate] = useState(null);
  const [lastEventUpdate, setLastEventUpdate] = useState(null);
  const [isUpdatingFlights, setIsUpdatingFlights] = useState(false);
  const [isUpdatingEvents, setIsUpdatingEvents] = useState(false);

  useEffect(() => {
    fetchFlights();
    fetchEvents();
  }, []);

  // Flight-related functions
  const fetchFlights = async () => {
    try {
      console.log('Fetching flights...');
      const response = await fetch('/api/flights');
      const data = await response.json();
      console.log('Fetched flights:', data);
      setFlights(Array.isArray(data) ? data : []);
      if (data.length > 0) {
        setLastFlightUpdate(new Date());
      }
    } catch (error) {
      console.error('Error fetching flights:', error);
    }
  };

  const addFlight = async (newFlight) => {
    try {
      console.log('Adding flight:', newFlight);
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
        setLastFlightUpdate(new Date());
      }
      return data;
    } catch (error) {
      console.error('Error adding flight:', error);
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
      console.log('Delete flight response:', data);
      
      if (data.success && data.flights) {
        setFlights(data.flights);
        setLastFlightUpdate(new Date());
      } else {
        throw new Error(data.message || 'Failed to delete flight');
      }
    } catch (error) {
      console.error('Error deleting flight:', error);
      alert('Error deleting flight. Please try again.');
    }
  };

  const updateVestaboardWithFlights = async () => {
    try {
      console.log('Updating Vestaboard with flights...');
      setIsUpdatingFlights(true);
      
      const response = await fetch('/api/flights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flights })
      });
      
      const data = await response.json();
      console.log('Update Vestaboard with flights response:', data);
      
      if (data.success) {
        setLastFlightUpdate(new Date());
        alert('Vestaboard updated with flights successfully');
      } else {
        alert('Failed to update Vestaboard with flights: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating Vestaboard with flights:', error);
      alert('Error updating Vestaboard with flights. Please try again.');
    } finally {
      setIsUpdatingFlights(false);
    }
  };

  // Event-related functions
  const fetchEvents = async () => {
    try {
      console.log('Fetching events...');
      const response = await fetch('/api/events');
      const data = await response.json();
      console.log('Fetched events:', data);
      setEvents(Array.isArray(data) ? data : []);
      if (data.length > 0) {
        setLastEventUpdate(new Date());
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const addEvent = async (newEvent) => {
    try {
      console.log('Adding event:', newEvent);
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent)
      });
      const data = await response.json();
      console.log('Add event response:', data);
      
      // Update the events state with the new data
      if (data.success && data.events) {
        setEvents(data.events);
        setLastEventUpdate(new Date());
      }
      return data;
    } catch (error) {
      console.error('Error adding event:', error);
      throw error;
    }
  };

  const deleteEvent = async (index) => {
    try {
      console.log('Deleting event at index:', index);
      const response = await fetch(`/api/events/${index}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      console.log('Delete event response:', data);
      
      if (data.success && data.events) {
        setEvents(data.events);
        setLastEventUpdate(new Date());
      } else {
        throw new Error(data.message || 'Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Error deleting event. Please try again.');
    }
  };

  const updateVestaboardWithEvents = async () => {
    try {
      console.log('Updating Vestaboard with events...');
      setIsUpdatingEvents(true);
      
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events, sendToVesta: true })
      });
      
      const data = await response.json();
      console.log('Update Vestaboard with events response:', data);
      
      if (data.success) {
        setLastEventUpdate(new Date());
        alert('Vestaboard updated with events successfully');
      } else {
        alert('Failed to update Vestaboard with events: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating Vestaboard with events:', error);
      alert('Error updating Vestaboard with events. Please try again.');
    } finally {
      setIsUpdatingEvents(false);
    }
  };

  // Helper functions for formatting
  const formatUpdateTime = (time) => {
    if (!time) return 'Never';
    
    return time.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>VBT Vesta Portal</h1>
      </header>
      
      <div className="dashboard">
        {/* Left side - Flights */}
        <div className="panel flights-panel">
          <h2>Flight Management</h2>
          <div className="status-section">
            <p>Last Vestaboard flight update: {formatUpdateTime(lastFlightUpdate)}</p>
            <p className="note">
              (Limited to 5 flights. Newest entries will replace oldest ones.)
            </p>
            <button 
              onClick={updateVestaboardWithFlights} 
              disabled={isUpdatingFlights || flights.length === 0}
              className="vesta-update-btn"
            >
              {isUpdatingFlights ? 'Updating...' : 'Update Vestaboard with Flights'}
            </button>
          </div>
          <FlightForm addFlight={addFlight} />
          <FlightList 
            flights={flights} 
            deleteFlight={deleteFlight}
          />
        </div>
        
        {/* Right side - Events */}
        <div className="panel events-panel">
          <h2>Event Management</h2>
          <div className="status-section">
            <p>Last Vestaboard event update: {formatUpdateTime(lastEventUpdate)}</p>
            <p className="note">
              (Limited to 5 events. Newest entries will replace oldest ones.)
            </p>
            <button 
              onClick={updateVestaboardWithEvents} 
              disabled={isUpdatingEvents || events.length === 0}
              className="vesta-update-btn"
            >
              {isUpdatingEvents ? 'Updating...' : 'Update Vestaboard with Events'}
            </button>
          </div>
          <EventForm addEvent={addEvent} />
          <EventList 
            events={events} 
            deleteEvent={deleteEvent}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
