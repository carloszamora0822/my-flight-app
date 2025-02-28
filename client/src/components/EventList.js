import React from 'react';

function EventList({ events, deleteEvent }) {
  if (!events || events.length === 0) {
    return (
      <div className="events-empty">
        <p>No events added yet.</p>
      </div>
    );
  }

  return (
    <table className="events-list">
      <thead>
        <tr>
          <th>Date</th>
          <th>Time</th>
          <th>Description</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {events.map((event, index) => (
          <tr key={index}>
            <td>{event.date}</td>
            <td>{event.time}</td>
            <td>{event.description}</td>
            <td>
              <button 
                onClick={() => deleteEvent(index)}
                className="delete-btn"
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default EventList;
