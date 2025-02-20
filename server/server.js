const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3001;

const { flights } = require('./data');

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
    res.json(flights);
  } catch (error) {
    res.status(400).json({ error: error.message });
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
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
