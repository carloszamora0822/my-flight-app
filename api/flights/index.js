// In-memory storage (note: this resets on cold starts)
let flights = [];

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Accept');

    // Handle OPTIONS request for CORS
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    console.log(`[${req.method}] ${req.url} received`);

    if (req.method === 'GET') {
        try {
            console.log('Current flights:', flights);
            return res.status(200).json(flights || []);
        } catch (error) {
            console.error('GET Error:', error);
            return res.status(500).json({ message: 'Failed to fetch flights' });
        }
    }

    if (req.method === 'POST') {
        try {
            const newFlight = req.body;
            console.log('Received flight:', newFlight);

            if (!newFlight.time || !newFlight.callsign || !newFlight.type || !newFlight.destination) {
                return res.status(400).json({ 
                    message: 'Missing required fields',
                    received: newFlight 
                });
            }

            if (!Array.isArray(flights)) flights = [];
            flights.push(newFlight);
            console.log('Updated flights:', flights);

            return res.status(200).json(flights);
        } catch (error) {
            console.error('POST Error:', error);
            return res.status(500).json({ message: 'Failed to add flight' });
        }
    }

    if (req.method === 'DELETE') {
        try {
            const parts = req.url.split('/');
            const index = parseInt(parts[parts.length - 1]);
            
            if (isNaN(index) || index < 0 || index >= flights.length) {
                return res.status(400).json({ message: 'Invalid index' });
            }

            flights.splice(index, 1);
            return res.status(200).json(flights);
        } catch (error) {
            console.error('DELETE Error:', error);
            return res.status(500).json({ message: 'Failed to delete flight' });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
