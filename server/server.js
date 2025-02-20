// server/server.js

const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3001;

const { getFlights, addFlight, deleteFlight } = require('./data');
const { convertFlightsToMatrix } = require('./vestaConversion');
const { updateVestaBoard } = require('./vestaboard');

app.use(cors());
app.use(express.json());

// GET /api/flights - Return the flights array.
app.get('/api/flights', (req, res) => {
  res.json(getFlights());
});

// POST /api/flights - Add a new flight and return the updated flights array.
app.post('/api/flights', (req, res) => {
  const newFlight = req.body;
  // Validate that all fields are provided.
  if (!newFlight.time || !newFlight.name || !newFlight.flightType || !newFlight.flightNumber) {
    return res.status(400).json({ error: 'All fields (time, name, flightType, flightNumber) are required' });
  }
  
  try {
    const updatedFlights = addFlight(newFlight);
    res.json(updatedFlights);
    // After updating the flights, update the Vestaboard.
    const matrix = convertFlightsToMatrix(getFlights());
    updateVestaBoard(matrix)
      .then(() => console.log('Vestaboard updated successfully.'))
      .catch(err => console.error('Error updating Vestaboard:', err));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/flights/:index - Delete a flight and return the updated flights array.
app.delete('/api/flights/:index', (req, res) => {
  const index = parseInt(req.params.index, 10);
  try {
    const updatedFlights = deleteFlight(index);
    res.json(updatedFlights);
    // Update the Vestaboard after deletion.
    const matrix = convertFlightsToMatrix(getFlights());
    updateVestaBoard(matrix)
      .then(() => console.log('Vestaboard updated successfully.'))
      .catch(err => console.error('Error updating Vestaboard:', err));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/updateVestaboard - Manually trigger a Vestaboard update.
app.get('/api/updateVestaboard', async (req, res) => {
  try {
    const matrix = convertFlightsToMatrix(getFlights());
    await updateVestaBoard(matrix);
    res.json({ success: true, message: 'Vestaboard updated successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Error updating Vestaboard' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
