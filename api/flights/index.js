import { createVestaMatrix } from '../../vestaboard/vestaConversion';
import { updateVestaboard } from '../../vestaboard/vestaboard';

// In-memory storage for flights
let flights = [];
// Flag to track if we're currently updating the Vestaboard
let isUpdatingVestaboard = false;
// Timestamp of the last update
let lastUpdateTime = 0;
// Timer for auto-refresh
let autoRefreshTimer = null;

// Schedule an auto-refresh of the Vestaboard after 3 minutes
function scheduleAutoRefresh() {
    // Clear any existing timer
    if (autoRefreshTimer) {
        clearTimeout(autoRefreshTimer);
    }
    
    // Set a new timer for 3 minutes (180000 ms)
    autoRefreshTimer = setTimeout(() => {
        console.log('Auto-refresh: Updating Vestaboard after 3 minutes of inactivity');
        updateVestaboardWithCurrentFlights();
    }, 180000);
    
    console.log('Scheduled auto-refresh for 3 minutes from now');
}

// Simple function to update the Vestaboard with the current flights
async function updateVestaboardWithCurrentFlights() {
    // If already updating, don't do anything
    if (isUpdatingVestaboard) {
        console.log('Already updating Vestaboard, skipping this update request');
        return;
    }

    try {
        // Set flag to prevent concurrent updates
        isUpdatingVestaboard = true;
        console.log('Starting Vestaboard update with current flights:', flights.length);

        // Create matrix with current flights
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
        
        // Schedule auto-refresh after successful update
        scheduleAutoRefresh();
    } catch (error) {
        console.error('Error updating Vestaboard:', error);
    } finally {
        // Reset flag regardless of success or failure
        isUpdatingVestaboard = false;
    }
}

// Initialize auto-refresh when the server starts
scheduleAutoRefresh();

export default async function handler(req, res) {
    // Basic CORS setup
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Accept');

    if (req.method === 'OPTIONS') return res.status(200).end();

    // Manual refresh endpoint
    if (req.method === 'POST' && req.url.endsWith('/refresh')) {
        try {
            console.log('Manual refresh requested');
            
            // Force an immediate update of the Vestaboard
            await updateVestaboardWithCurrentFlights();
            
            return res.status(200).json({
                success: true,
                message: 'Vestaboard refresh initiated'
            });
        } catch (error) {
            console.error('Error during manual refresh:', error);
            return res.status(500).json({ 
                success: false,
                message: 'Failed to refresh Vestaboard' 
            });
        }
    }

    // Get all flights
    if (req.method === 'GET') {
        try {
            console.log('GET request received, returning flights:', flights.length);
            return res.status(200).json(flights || []);
        } catch (error) {
            console.error('Error in GET:', error);
            return res.status(500).json({ message: 'Failed to fetch flights' });
        }
    }

    // Add new flight
    if (req.method === 'POST') {
        try {
            const newFlight = req.body;
            flights.push(newFlight);
            console.log('Added new flight:', newFlight);

            // Update Vestaboard with the current flights
            // This will handle rate limiting internally
            updateVestaboardWithCurrentFlights();

            return res.status(200).json({
                success: true,
                flights: flights
            });
        } catch (error) {
            console.error('Failed to add flight:', error);
            return res.status(500).json({ message: 'Failed to add flight' });
        }
    }

    // Delete flight
    if (req.method === 'DELETE') {
        try {
            const index = parseInt(req.url.split('/').pop());
            
            if (isNaN(index) || index < 0 || index >= flights.length) {
                return res.status(400).json({ 
                    success: false,
                    message: 'Invalid index'
                });
            }

            const deletedFlight = flights[index];
            flights.splice(index, 1);
            console.log('Deleted flight at index', index, ':', deletedFlight);

            // Update Vestaboard with the current flights
            // This will handle rate limiting internally
            updateVestaboardWithCurrentFlights();

            return res.status(200).json({
                success: true,
                flights: flights
            });
        } catch (error) {
            console.error('Failed to delete flight:', error);
            return res.status(500).json({ message: 'Failed to delete flight' });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
