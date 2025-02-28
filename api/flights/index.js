import { createVestaMatrix } from '../../vestaboard/vestaConversion';
import { updateVestaboard } from '../../vestaboard/vestaboard';
import fs from 'fs';
import path from 'path';

// Path to flight data file
const flightsFilePath = path.join(process.cwd(), 'data', 'flights.json');

// In-memory cache of flights (will be loaded from file)
let flightsCache = [];

// Flag to track if we're currently updating the Vestaboard
let isUpdatingVestaboard = false;
// Timestamp of the last update
let lastUpdateTime = 0;

/**
 * Load flights from the data file
 * This is called on every request to ensure data is fresh
 */
function loadFlights() {
    try {
        // Create data directory if it doesn't exist
        const dataDir = path.join(process.cwd(), 'data');
        if (!fs.existsSync(dataDir)) {
            console.log('Creating data directory:', dataDir);
            fs.mkdirSync(dataDir, { recursive: true });
        }

        // Check if file exists, if not create empty file
        if (!fs.existsSync(flightsFilePath)) {
            console.log('Flights file not found, creating empty file');
            fs.writeFileSync(flightsFilePath, JSON.stringify([]));
            return [];
        }

        // Read and parse file
        const fileData = fs.readFileSync(flightsFilePath, 'utf8');
        const flights = JSON.parse(fileData);
        console.log(`Loaded ${flights.length} flights from file`);
        return Array.isArray(flights) ? flights : [];
    } catch (error) {
        console.error('Error loading flights from file:', error);
        return []; // Return empty array on error
    }
}

/**
 * Save flights to the data file
 * @param {Array} flights The flights to save
 */
function saveFlights(flights) {
    try {
        // Create data directory if it doesn't exist
        const dataDir = path.join(process.cwd(), 'data');
        if (!fs.existsSync(dataDir)) {
            console.log('Creating data directory:', dataDir);
            fs.mkdirSync(dataDir, { recursive: true });
        }

        // Write flights to file
        fs.writeFileSync(flightsFilePath, JSON.stringify(flights, null, 2));
        console.log(`Saved ${flights.length} flights to file`);
        
        // Update the in-memory cache
        flightsCache = [...flights];
    } catch (error) {
        console.error('Error saving flights to file:', error);
    }
}

/**
 * Function to ensure we don't exceed 5 flights 
 * @param {Array} flights The flights array to cap
 * @returns {Array} The capped flights array
 */
function capFlightsArray(flights) {
    if (flights.length > 5) {
        console.log(`Capping flights array from ${flights.length} to 5 items`);
        return flights.slice(-5); // Keep the 5 newest flights
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

    // Always load flights from file to ensure we have the latest data
    flightsCache = loadFlights();

    // Get all flights
    if (req.method === 'GET') {
        try {
            console.log('GET request received, returning flights:', flightsCache.length);
            return res.status(200).json(flightsCache);
        } catch (error) {
            console.error('Error in GET flights:', error);
            return res.status(500).json({ message: 'Failed to fetch flights' });
        }
    }

    // Add new flight or refresh vestaboard
    if (req.method === 'POST') {
        try {
            // If it's a flight list, use it to update the Vestaboard
            if (req.body.flights && Array.isArray(req.body.flights)) {
                const flights = req.body.flights;
                console.log('Received flights list with length:', flights.length);
                
                // Cap flights to 5 and update Vestaboard with the flights
                await updateVestaboardWithFlights(flights);
                
                return res.status(200).json({
                    success: true,
                    flights: flights
                });
            }
            // If it's a single new flight to add
            else if (req.body.airline && req.body.flightNumber && req.body.status) {
                const newFlight = {
                    time: req.body.time,
                    callsign: `${req.body.airline}${req.body.flightNumber}`,
                    type: req.body.status,
                    destination: req.body.gate
                };
                
                console.log('Adding new flight:', newFlight);
                
                // Add to flights array
                const updatedFlights = [...flightsCache, newFlight];
                
                // Cap to 5 flights
                const capped = capFlightsArray(updatedFlights);
                
                // Save to file
                saveFlights(capped);
                
                // Update Vestaboard with the flights if sendToVesta is true
                if (req.body.sendToVesta) {
                    await updateVestaboardWithFlights(capped);
                }
                
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
            
            // Save updated flights list to file
            saveFlights(updatedFlights);
            
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
