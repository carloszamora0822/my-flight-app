import { createVestaMatrix } from '../../vestaboard/vestaConversion';
import { updateVestaboard } from '../../vestaboard/vestaboard';

// In-memory cache of flights
let flightsCache = [];

// Flag to track if we're currently updating the Vestaboard
let isUpdatingVestaboard = false;
// Timestamp of the last update
let lastUpdateTime = 0;

// For Vercel, we need to use an approach that doesn't rely on local file storage
// Instead, we'll send the full list with every response and expect it back with every request

/**
 * Function to ensure we don't exceed 5 flights 
 * @param {Array} flights The flights array to cap
 * @returns {Array} The capped flights array
 */
function capFlightsArray(flights) {
    if (flights.length > 5) {
        console.log(`Capping flights array from ${flights.length} to 5 items`);
        return flights.slice(0, 5);
    }
    return flights;
}

/**
 * Update the Vestaboard with the given flights
 * @param {Array} flights The flights to display
 */
async function updateVestaboardWithFlights(flights) {
    // If already updating, don't do anything
    if (isUpdatingVestaboard) {
        console.log('Already updating Vestaboard, skipping this update request');
        return;
    }

    try {
        // Set flag to prevent concurrent updates
        isUpdatingVestaboard = true;
        console.log('Starting Vestaboard update with flights:', flights.length);

        // Create matrix with flights
        const matrix = createVestaMatrix([...flights]);
        
        // Calculate time since last update
        const now = Date.now();
        const timeSinceLastUpdate = now - lastUpdateTime;
        
        // If it's been less than 5 seconds since the last update, wait
        if (timeSinceLastUpdate < 5000) {
            const waitTime = 5000 - timeSinceLastUpdate;
            console.log(`Waiting ${waitTime}ms before updating Vestaboard to avoid rate limiting`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        
        // Update the Vestaboard
        await updateVestaboard(matrix);
        
        // Update last update time
        lastUpdateTime = Date.now();
        console.log('Vestaboard updated successfully at', new Date(lastUpdateTime).toISOString());
        
        // Update cache
        flightsCache = [...flights];
    } catch (error) {
        console.error('Error updating Vestaboard:', error);
    } finally {
        // Reset flag regardless of success or failure
        isUpdatingVestaboard = false;
    }
}

export default async function handler(req, res) {
    // Basic CORS setup
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Accept');

    if (req.method === 'OPTIONS') return res.status(200).end();

    // Get all flights
    if (req.method === 'GET') {
        try {
            console.log('GET request received, returning flights:', flightsCache.length);
            return res.status(200).json(flightsCache);
        } catch (error) {
            console.error('Error in GET:', error);
            return res.status(500).json({ message: 'Failed to fetch flights' });
        }
    }

    // Add new flight
    if (req.method === 'POST') {
        try {
            // If it's a submission with the current flights list
            if (req.body.flights && Array.isArray(req.body.flights)) {
                const flights = req.body.flights;
                console.log('Received flights list with length:', flights.length);
                
                // Cap flights to 5
                const capped = capFlightsArray(flights);
                
                // Update Vestaboard with these flights
                await updateVestaboardWithFlights(capped);
                
                return res.status(200).json({
                    success: true,
                    flights: capped
                });
            }
            // If it's a single new flight to add
            else if (req.body.time && req.body.callsign) {
                const newFlight = req.body;
                console.log('Adding new flight:', newFlight);
                
                // Add to flights array
                const updatedFlights = [...flightsCache, newFlight];
                
                // Cap flights to 5
                const capped = capFlightsArray(updatedFlights);
                
                // Update Vestaboard with these flights
                await updateVestaboardWithFlights(capped);
                
                return res.status(200).json({
                    success: true,
                    flights: capped
                });
            }
            else {
                return res.status(400).json({ 
                    success: false,
                    message: 'Invalid request format' 
                });
            }
        } catch (error) {
            console.error('Failed to add flight:', error);
            return res.status(500).json({ message: 'Failed to add flight' });
        }
    }

    // Delete flight
    if (req.method === 'DELETE') {
        try {
            const index = parseInt(req.url.split('/').pop());
            
            if (isNaN(index) || index < 0 || index >= flightsCache.length) {
                return res.status(400).json({ 
                    success: false,
                    message: 'Invalid index'
                });
            }

            const updatedFlights = [...flightsCache];
            const deletedFlight = updatedFlights[index];
            updatedFlights.splice(index, 1);
            console.log('Deleted flight at index', index, ':', deletedFlight);
            
            // Update Vestaboard with the current flights
            await updateVestaboardWithFlights(updatedFlights);

            return res.status(200).json({
                success: true,
                flights: updatedFlights
            });
        } catch (error) {
            console.error('Failed to delete flight:', error);
            return res.status(500).json({ message: 'Failed to delete flight' });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
