require('dotenv').config();

const express = require('express');
const cors = require('cors');
const app = express();

const { flights, safeGet, safePush } = require('./data');
const { updateVestaboardFromData } = require('./vestaboard/autoUpdate');

// Updated CORS configuration for Vercel
app.use(cors({
    origin: '*', // Be more specific in production
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept'],
}));

app.use(express.json());

// Pre-flight requests
app.options('*', cors());

// Add error handling middleware at the top
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: err.message });
});

app.get('/api/flights', (req, res) => {
    try {
        const currentFlights = safeGet();
        console.log('GET /api/flights - Current flights:', currentFlights);
        res.json(currentFlights || []);
    } catch (error) {
        console.error('GET error:', error);
        res.status(500).json({ error: error.message });
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
    safePush(newFlight);
    while (flights.length > 5) {
      flights.shift();
    }
    console.log('Current flights after adding:', flights);
    
    // Make Vestaboard update non-blocking and optional
    updateVestaboardFromData().catch(err => {
      console.warn('Non-critical Vestaboard update error:', err);
    });
    
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

// Remove app.listen as Vercel uses serverless functions
// Instead, export the app
module.exports = app;
