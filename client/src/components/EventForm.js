import React, { useState } from 'react';

function EventForm({ addEvent }) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [sendToVesta, setSendToVesta] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (description.length > 10) {
      alert("Description must be 10 characters or less");
      return;
    }

    // Show loading indicator or disable submit button here if needed
    try {
      console.log('Submitting event:', { date, time, description, sendToVesta });
      const response = await addEvent({ date, time, description, sendToVesta });
      console.log('Event submission result:', response);
      
      // Clear form only if addition was successful
      if (response && response.success) {
        setDate('');
        setTime('');
        setDescription('');
        setSendToVesta(false);
      } else {
        // Show specific error message from server if available
        const errorMessage = response && response.message 
          ? response.message 
          : 'Failed to add event. Please try again.';
        alert(errorMessage);
      }
    } catch (error) {
      // This should rarely happen now with the improved error handling in addEvent
      console.error('Unexpected error adding event:', error);
      alert('Connection error. Please check your internet connection and try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="event-form">
      <h3>Add New Event</h3>
      <div className="form-group">
        <label htmlFor="date">Date:</label>
        <input
          type="text"
          id="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          placeholder="(MM/DD)"
          maxLength="5"
        />
      </div>
      <div className="form-group">
        <label htmlFor="event-time">Time:</label>
        <input
          type="text"
          id="event-time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required
          placeholder="(Ex. 13:30)"
          maxLength="5"
        />
      </div>
      <div className="form-group">
        <label htmlFor="description">Description:</label>
        <input
          type="text"
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          placeholder="(Max 10 chars)"
          maxLength="10"
        />
      </div>
      <div className="form-group checkbox-group">
        <label htmlFor="send-to-vesta">
          <input
            type="checkbox"
            id="send-to-vesta"
            checked={sendToVesta}
            onChange={(e) => setSendToVesta(e.target.checked)}
          />
          Send to Vestaboard
        </label>
      </div>
      <button type="submit" className="event-submit-btn">Add to Events</button>
    </form>
  );
}

export default EventForm;
