require('dotenv').config();

const express = require('express');
const cors = require('cors');
const app = express();

const { flights, safeGet, safePush } = require('./data');

// Skip Vestaboard in production for now to isolate the issue
// const { updateVestaboardFromData } = require('./vestaboard/autoUpdate');

app.use(cors());
app.use(express.json());

app.get('/api/flights', (req, res) => {
    try {
        console.log('[GET] Accessing flights array:', flights);
        const currentFlights = safeGet();
        console.log('[GET] Retrieved flights:', currentFlights);
        return res.status(200).json(currentFlights);
    } catch (error) {
        console.error('[GET] Error:', error);
        return res.status(500).json({ message: error.message });
    }
});

app.post('/api/flights', async (req, res) => {
    try {
        console.log('[POST] Received body:', req.body);
        const newFlight = req.body;
        
        if (!newFlight.time || !newFlight.callsign || !newFlight.type || !newFlight.destination) {
            return res.status(400).json({ 
                message: 'Missing required fields',
                received: newFlight 
            });
        }

        safePush(newFlight);
        console.log('[POST] Updated flights array:', flights);
        return res.status(200).json(flights);
        
    } catch (error) {
        console.error('[POST] Error:', error);
        return res.status(500).json({ message: error.message });
    }
});

// Remove DELETE endpoint temporarily to simplify debugging

module.exports = app;
