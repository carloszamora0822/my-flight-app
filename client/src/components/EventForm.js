import React, { useState } from 'react';

function EventForm({ addEvent }) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!date || !time || !description) {
      alert("Please fill in all required fields");
      return;
    }
    
    // Validate time format (military time)
    const timeNum = parseInt(time);
    if (time.length !== 4 || isNaN(timeNum) || timeNum < 0 || timeNum > 2359) {
      alert("Invalid time format. Please use military time (0000-2359)");
      return;
    }
    
    if (description.length > 10) {
      alert("Description must be 10 characters or less");
      return;
    }

    // Show loading indicator or disable submit button here if needed
    try {
      console.log('Submitting event:', { date, time, description });
      // Always send to Vestaboard automatically
      const response = await addEvent({ date, time, description, sendToVesta: true });
      console.log('Event submission result:', response);
      
      // Clear form only if addition was successful
      if (response && response.success) {
        setDate('');
        setTime('');
        setDescription('');
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
    <form onSubmit={handleSubmit} className="form">
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
        <label htmlFor="event-time">Time (Military):</label>
        <input
          type="text"
          id="event-time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required
          pattern="[0-9]{4}"
          maxLength="4"
          placeholder="(Ex. 1230)"
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
      <button type="submit" className="submit-btn">Submit Event</button>
    </form>
  );
}

export default EventForm;
