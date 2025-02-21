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
            console.log('🛫 Received new flight:', newFlight);

            // Check both possible environment variable names
            const apiKey = process.env.VESTA_API_KEY || process.env.VESTABOARD_API_KEY;
            console.log('🔑 Environment check:', {
                hasVestaKey: !!process.env.VESTA_API_KEY,
                hasVestaboardKey: !!process.env.VESTABOARD_API_KEY,
                finalKey: apiKey ? '✅ Present' : '❌ Missing'
            });

            if (!apiKey) {
                console.error('❌ Vestaboard API key not found');
                flights.push(newFlight);
                return res.status(200).json({
                    flights,
                    warning: 'Flight added but Vestaboard update failed - Missing API key'
                });
            }

            // Add flight to array
            flights.push(newFlight);
            console.log('✅ Flight added to array');

            // Attempt Vestaboard update
            try {
                console.log('🎯 Creating Vestaboard matrix...');
                const matrix = createVestaMatrix(flights);
                console.log('📊 Matrix created:', matrix);

                console.log('📡 Sending to Vestaboard...');
                const vestaResult = await updateVestaboard(matrix);
                console.log('✨ Vestaboard updated successfully:', vestaResult);

                return res.status(200).json({
                    flights,
                    vestaboard: 'updated'
                });
            } catch (vestaError) {
                console.error('❌ Vestaboard Error:', vestaError);
                // Return flights but with warning
                return res.status(200).json({
                    flights,
                    warning: `Flight added but Vestaboard update failed: ${vestaError.message}`
                });
            }
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
            const index = parseInt(req.query.index);
            
            if (isNaN(index) || index < 0 || index >= flights.length) {
                return res.status(400).json({ message: 'Invalid index' });
            }

            flights.splice(index, 1);

            // Update Vestaboard
            try {
                const matrix = createVestaMatrix(flights);
                await updateVestaboard(matrix);
                console.log('Vestaboard updated after DELETE');
            } catch (vestaError) {
                console.error('Vestaboard update failed:', vestaError);
                // Continue with the response even if Vestaboard update fails
            }

            return res.status(200).json(flights);
        } catch (error) {
            console.error('DELETE Error:', error);
            return res.status(500).json({ message: 'Failed to delete flight' });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
