require('dotenv').config();

const express = require('express');
const cors = require('cors');
const app = express();

const { flights, safeGet, safePush } = require('./data');
const { watchFlightsData } = require('./utils/autoUpdate');
watchFlightsData();
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
        
        // Trigger Vestaboard update
        const { updateBoard } = require('./utils/autoUpdate');
        await updateBoard();
        
        return res.status(200).json(flights);
        
    } catch (error) {
        console.error('[POST] Error:', error);
        return res.status(500).json({ message: error.message });
    }
});

app.delete('/api/flights/:index', async (req, res) => {
    try {
        const index = parseInt(req.params.index);
        
        if (isNaN(index) || index < 0 || index >= flights.length) {
            return res.status(400).json({ message: 'Invalid index' });
        }

        flights.splice(index, 1);
        
        // Trigger Vestaboard update
        const { updateBoard } = require('./utils/autoUpdate');
        await updateBoard();
        
        return res.status(200).json(flights);
    } catch (error) {
        console.error('[DELETE] Error:', error);
        return res.status(500).json({ message: error.message });
    }
});

module.exports = app;
