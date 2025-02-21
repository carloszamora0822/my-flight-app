const express = require('express');
const cors = require('cors');
const app = express();
const port = 3002;

const testFlights = [];

// More detailed CORS configuration
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Add error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: err.message });
});

app.get('/api/flights', (req, res) => {
    try {
        console.log('GET request received');
        res.json(testFlights);
    } catch (error) {
        console.error('GET error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/flights', (req, res) => {
    try {
        console.log('POST request received:', req.body);
        const flight = req.body;
        testFlights.push(flight);
        res.json(testFlights);
    } catch (error) {
        console.error('POST error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Test server running on port ${port}`);
});
