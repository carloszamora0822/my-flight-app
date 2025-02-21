const express = require('express');
const cors = require('cors');
const app = express();

// In-memory storage
let flights = [];

console.log('API initialized');

app.use(cors());
app.use(express.json());

app.get('/api/flights', (req, res) => {
    console.log('GET /api/flights received');
    try {
        console.log('Current flights:', flights);
        res.json(flights || []);
    } catch (error) {
        console.error('GET Error:', error);
        res.status(500).json({ message: 'Failed to fetch flights', error: error.message });
    }
});

app.post('/api/flights', (req, res) => {
    console.log('POST /api/flights received');
    console.log('Request body:', req.body);
    
    try {
        const newFlight = req.body;
        
        if (!newFlight.time || !newFlight.callsign || !newFlight.type || !newFlight.destination) {
            console.error('Missing fields in flight:', newFlight);
            return res.status(400).json({ 
                message: 'Missing required fields',
                received: newFlight 
            });
        }

        // Initialize flights array if needed
        if (!Array.isArray(flights)) {
            console.log('Initializing flights array');
            flights = [];
        }

        flights.push(newFlight);
        console.log('Flight added successfully');
        console.log('Updated flights:', flights);

        res.status(200).json(flights);
    } catch (error) {
        console.error('POST Error:', error);
        res.status(500).json({ message: 'Failed to add flight', error: error.message });
    }
});

app.delete('/api/flights/:index', (req, res) => {
    console.log('DELETE /api/flights/:index received');
    console.log('Params:', req.params);
    
    try {
        const index = parseInt(req.params.index);
        if (isNaN(index) || index < 0 || index >= flights.length) {
            return res.status(400).json({ message: 'Invalid index' });
        }

        flights.splice(index, 1);
        console.log('Flight deleted successfully');
        console.log('Updated flights:', flights);

        res.json(flights);
    } catch (error) {
        console.error('DELETE Error:', error);
        res.status(500).json({ message: 'Failed to delete flight', error: error.message });
    }
});

// Export the Express app
module.exports = app;
