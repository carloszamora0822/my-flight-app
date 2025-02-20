// File: server/server.js
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3001;

// Import flight data
const { flights } = require('./data');

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.get('/api/flights', (req, res) => {
  res.json(flights);
});

app.post('/api/flights', (req, res) => {
  const newFlight = req.body;
  
  // Validate input
  if (!newFlight.time || !newFlight.callsign || !newFlight.type || !newFlight.destination) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  flights.push(newFlight);
  
  // Keep only the last 5 flights
  while (flights.length > 5) {
    flights.shift();
  }
  
  res.json(flights);
});

app.delete('/api/flights/:index', (req, res) => {
  const index = parseInt(req.params.index);
  
  if (isNaN(index) || index < 0 || index >= flights.length) {
    return res.status(400).json({ error: 'Invalid index' });
  }
  
  flights.splice(index, 1);
  res.json(flights);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
