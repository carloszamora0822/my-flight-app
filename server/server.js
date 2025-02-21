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
  try {
    console.log('GET /api/flights - Current flights:', flights);
    res.json(flights || []);
  } catch (error) {
    console.error('HTTP error 1: Error fetching flights:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

app.post('/api/flights', async (req, res) => {
  const newFlight = req.body;
  console.log('POST /api/flights - Received flight:', newFlight);
  
  if (!newFlight.time || !newFlight.callsign || !newFlight.type || !newFlight.destination) {
    console.error('Missing required fields:', newFlight);
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  try {
    flights.push(newFlight);
    while (flights.length > 5) {
      flights.shift();
    }
    console.log('Current flights after adding:', flights);
    
    try {
      await updateVestaboardFromData();
      console.log('Vestaboard updated successfully');
    } catch (vestaError) {
      console.error('Vestaboard update error:', vestaError);
      // Continue with the response even if Vestaboard update fails
    }
    
    res.json(flights);
  } catch (error) {
    console.error('HTTP error 2: Error adding flight:', error);
    console.error('Request body:', req.body);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
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
    console.error('HTTP error 3: Error deleting flight:', error);
    console.error('Request params:', req.params);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
