const { flights, safeGet, safePush } = require('../../server/data');

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

    if (req.method === 'GET') {
        try {
            console.log('[GET] Accessing flights');
            const currentFlights = safeGet();
            console.log('[GET] Retrieved flights:', currentFlights);
            return res.status(200).json(currentFlights);
        } catch (error) {
            console.error('[GET] Error:', error);
            return res.status(500).json({ message: 'Failed to fetch flights' });
        }
    }

    if (req.method === 'POST') {
        try {
            const newFlight = req.body;
            console.log('[POST] Received flight:', newFlight);

            if (!newFlight.time || !newFlight.callsign || !newFlight.type || !newFlight.destination) {
                return res.status(400).json({
                    message: 'Missing required fields',
                    received: newFlight
                });
            }

            safePush(newFlight);
            const updatedFlights = safeGet();
            console.log('[POST] Updated flights:', updatedFlights);
            return res.status(200).json(updatedFlights);
        } catch (error) {
            console.error('[POST] Error:', error);
            return res.status(500).json({ message: 'Failed to add flight' });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
