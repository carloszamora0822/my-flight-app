// server/server.js

const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3001;

const { flights } = require('./data');

app.use(cors());
app.use(express.json());

// GET /api/flights - Return the flights array.
app.get('/api/flights', (req, res) => {
  res.json(flights);
});

// POST /api/flights - Add a new flight entry and return the updated flights array.
app.post('/api/flights', (req, res) => {
  const newFlight = req.body;
  // Validate that all fields are provided.
  if (!newFlight.time || !newFlight.name || !newFlight.flightType || !newFlight.flightNumber) {
    return res.status(400).json({ error: 'All fields (time, name, flightType, flightNumber) are required' });
  }
  
  try {
    flights.push(newFlight);
    // Ensure only the 5 most recent flights are kept.
    while (flights.length > 5) {
      flights.shift();
    }
    res.json(flights);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/flights/:index - Delete a flight entry and return the updated flights array.
app.delete('/api/flights/:index', (req, res) => {
  const index = parseInt(req.params.index, 10);
  if (isNaN(index) || index < 0 || index >= flights.length) {
    return res.status(400).json({ error: 'Invalid index' });
  }
  
  try {
    flights.splice(index, 1);
    res.json(flights);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/updateVestaboard - Convert the current flights to a 6x22 matrix and update the Vestaboard.
app.get('/api/updateVestaboard', async (req, res) => {
  try {
    const { convertFlightsToMatrix } = require('./vestaConversion');
    const { updateVestaBoard } = require('./vestaboard');
    const matrix = convertFlightsToMatrix(flights);
    await updateVestaBoard(matrix);
    res.json({ success: true, message: 'Vestaboard updated successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Error updating Vestaboard' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
