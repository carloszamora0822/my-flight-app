import { createVestaMatrix } from '../../vestaboard/vestaConversion';
import { updateVestaboard } from '../../vestaboard/vestaboard';

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
            console.log('🛫 New flight:', newFlight);

            if (!Array.isArray(flights)) flights = [];
            flights.push(newFlight);

            // Attempt Vestaboard update
            let vestaStatus = null;
            try {
                const matrix = createVestaMatrix(flights);
                await updateVestaboard(matrix);
                vestaStatus = 'success';
            } catch (vestaError) {
                console.error('❌ Vestaboard Error:', vestaError);
                vestaStatus = vestaError.message;
            }

            // Always return the flights array as the main response
            return res.status(200).json({
                success: true,
                flights: flights,
                vestaboard: vestaStatus
            });
        } catch (error) {
            console.error('❌ General Error:', error);
            return res.status(500).json({ 
                message: 'Failed to add flight',
                error: error.message 
            });
        }
    }

    if (req.method === 'DELETE') {
        try {
            // Extract index from URL path instead of query params
            const indexStr = req.url.split('/').pop();
            const index = parseInt(indexStr);
            console.log('🗑️ Deleting flight at index:', index);
            
            if (isNaN(index) || index < 0 || index >= flights.length) {
                console.error('❌ Invalid index:', index);
                return res.status(400).json({ 
                    success: false,
                    message: `Invalid index: ${index}` 
                });
            }

            // Remove the flight
            flights.splice(index, 1);
            console.log('✅ Flight removed, remaining flights:', flights);

            // Update Vestaboard
            let vestaStatus = null;
            try {
                const matrix = createVestaMatrix(flights);
                await updateVestaboard(matrix);
                vestaStatus = 'success';
                console.log('✨ Vestaboard updated after DELETE');
            } catch (vestaError) {
                console.error('❌ Vestaboard update failed:', vestaError);
                vestaStatus = vestaError.message;
            }

            return res.status(200).json({
                success: true,
                flights: flights,
                vestaboard: vestaStatus
            });
        } catch (error) {
            console.error('❌ DELETE Error:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Failed to delete flight' 
            });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
