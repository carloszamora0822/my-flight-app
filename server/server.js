// server/server.js

const express = require('express');
const cors = require('cors');
const { getFlights, addFlight, deleteFlight } = require('./data');
const app = express();
const port = process.env.PORT || 3001;

// Middleware to enable CORS and parse JSON bodies
app.use(cors());
app.use(express.json());

// GET /api/flights - Retrieve all flight data.
app.get('/api/flights', (req, res) => {
  res.json(getFlights());
});

// POST /api/flights - Add a new flight entry.
app.post('/api/flights', (req, res) => {
  const newFlight = req.body;
  
  // Validate input
  if (!newFlight.time || !newFlight.callsign || !newFlight.type || !newFlight.destination) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  try {
    const updatedFlights = addFlight(newFlight);
    res.json(updatedFlights);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/flights/:index - Delete a flight by its index.
app.delete('/api/flights/:index', (req, res) => {
  const index = parseInt(req.params.index, 10);
  
  if (isNaN(index)) {
    return res.status(400).json({ error: 'Invalid index' });
  }
  
  try {
    const updatedFlights = deleteFlight(index);
    res.json(updatedFlights);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
