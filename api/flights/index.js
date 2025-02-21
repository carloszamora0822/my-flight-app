import { createVestaMatrix } from '../../vestaboard/vestaConversion';
import { updateVestaboard } from '../../vestaboard/vestaboard';

let flights = [];

export default async function handler(req, res) {
    // basic CORS setup
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Accept');

    if (req.method === 'OPTIONS') return res.status(200).end();

    // get all flights
    if (req.method === 'GET') {
        try {
            return res.status(200).json(flights || []);
        } catch (error) {
            return res.status(500).json({ message: 'Failed to fetch flights' });
        }
    }

    // add new flight
    if (req.method === 'POST') {
        try {
            const newFlight = req.body;
            flights.push(newFlight);

            // update board
            try {
                const matrix = createVestaMatrix(flights);
                await updateVestaboard(matrix);
            } catch (error) {
                // keep going even if board update fails
            }

            return res.status(200).json({
                success: true,
                flights: flights
            });
        } catch (error) {
            return res.status(500).json({ message: 'Failed to add flight' });
        }
    }

    // delete flight
    if (req.method === 'DELETE') {
        try {
            const index = parseInt(req.url.split('/').pop());
            
            if (isNaN(index) || index < 0 || index >= flights.length) {
                return res.status(400).json({ 
                    success: false,
                    message: 'Invalid index'
                });
            }

            flights.splice(index, 1);

            // update board
            try {
                const matrix = createVestaMatrix(flights);
                await updateVestaboard(matrix);
            } catch (error) {
                // keep going even if board update fails
            }

            return res.status(200).json({
                success: true,
                flights: flights
            });
        } catch (error) {
            return res.status 500).json({ message: 'Failed to delete flight' });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
