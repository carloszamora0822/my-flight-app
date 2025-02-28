import { createVestaMatrix } from '../../vestaboard/vestaConversion';
import { createEventMatrix } from '../../vestaboard/eventConversion';
import { updateVestaboard } from '../../vestaboard/vestaboard';

export default async function handler(req, res) {
    // Basic CORS setup
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Accept');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        if (req.method === 'POST') {
            const { type, data } = req.body;
            
            console.log(`Test endpoint called with type: ${type}`);
            console.log('Data:', data);
            
            let matrix;
            
            if (type === 'event') {
                // Test event display
                const event = {
                    date: (data.date || '03/01').substring(0, 5), // Limit to 5 chars
                    time: (data.time || '14:00').substring(0, 5), // Limit to 5 chars
                    description: (data.description || 'TEST EVENT').substring(0, 10) // Limit to 10 chars
                };
                
                console.log('Creating event matrix for:', event);
                matrix = createEventMatrix([event]);
            } else if (type === 'flight') {
                // Test flight display
                const flight = {
                    time: data.time || '1330',
                    callsign: data.callsign || 'UA123',
                    type: data.type || 'ARR',
                    destination: data.destination || 'SFO'
                };
                
                console.log('Creating flight matrix for:', flight);
                matrix = createVestaMatrix([flight]);
            } else if (type === 'raw') {
                // Test raw character codes
                matrix = data.matrix || Array(6).fill().map(() => Array(22).fill(0));
            } else {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Invalid type. Use "event", "flight", or "raw".' 
                });
            }
            
            console.log('Sending matrix to Vestaboard:', JSON.stringify(matrix));
            const result = await updateVestaboard(matrix);
            
            return res.status(200).json({ 
                success: true, 
                message: 'Test sent to Vestaboard',
                matrix: matrix,
                result: result
            });
        }
        
        // GET request returns a test page
        return res.status(200).json({ 
            message: 'Test endpoint is working. Use a POST request to test the Vestaboard.' 
        });
    } catch (error) {
        console.error('Error in test endpoint:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Error testing Vestaboard',
            error: error.message
        });
    }
}
