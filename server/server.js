// server/server.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3001;

const { flights } = require('./data');
const { updateVestaboardFromData } = require('./vestaboard/autoUpdate');

app.use(cors());
app.use(express.json());

app.get('/api/flights', (req, res) => {
  res.json(flights);
});

app.post('/api/flights', (req, res) => {
  const newFlight = req.body;
  if (!newFlight.time || !newFlight.callsign || !newFlight.type || !newFlight.destination) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  try {
    flights.push(newFlight);
    while (flights.length > 5) {
      flights.shift();
    }
    // Log current flights for debugging:
    console.log('Current flights:', flights);
    res.json(flights);
    // Now update Vestaboard in a non-blocking try/catch
    updateVestaboardFromData()
      .then(() => console.log('Vestaboard updated successfully after POST.'))
      .catch(err => console.error('Error updating Vestaboard after POST:', err));
  } catch (error) {
    console.error('Error adding flight:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/api/flights/:index', (req, res) => {
  const index = parseInt(req.params.index, 10);
  if (isNaN(index) || index < 0 || index >= flights.length) {
    return res.status(400).json({ error: 'Invalid index' });
  }
  
  try {
    flights.splice(index, 1);
    res.json(flights);
    updateVestaboardFromData()
      .then(() => console.log('Vestaboard updated successfully after DELETE.'))
      .catch(err => console.error('Error updating Vestaboard after DELETE:', err));
  } catch (error) {
    console.error('Error deleting flight:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
