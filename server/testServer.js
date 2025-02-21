const express = require('express');
const cors = require('cors');
const app = express();
const port = 3002; // Different port for testing

// Simple in-memory array
const testFlights = [];

app.use(cors());
app.use(express.json());

app.get('/api/flights', (req, res) => {
    console.log('GET request received');
    res.json(testFlights);
});

app.post('/api/flights', (req, res) => {
    console.log('POST request received:', req.body);
    const flight = req.body;
    testFlights.push(flight);
    res.json(testFlights);
});

app.listen(port, () => {
    console.log(`Test server running on port ${port}`);
});
