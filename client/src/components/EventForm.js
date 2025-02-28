import React, { useState } from 'react';

function EventForm({ addEvent }) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (description.length > 10) {
      alert("Description must be 10 characters or less");
      return;
    }

    try {
      console.log('Submitting event:', { date, time, description });
      const response = await addEvent({ date, time, description });
      console.log('Event added successfully:', response);
      
      // Clear form only if addition was successful
      if (response.success) {
        setDate('');
        setTime('');
        setDescription('');
      } else {
        alert('Failed to add event. Please try again.');
      }
    } catch (error) {
      console.error('Error adding event:', error);
      alert('Error adding event. Please try again.');
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
      <button type="submit" className="event-submit-btn">Add to Events</button>
    </form>
  );
}

export default EventForm;
