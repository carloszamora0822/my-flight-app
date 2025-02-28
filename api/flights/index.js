import { createVestaMatrix } from '../../vestaboard/vestaConversion';
import { updateVestaboard } from '../../vestaboard/vestaboard';
import fs from 'fs';
import path from 'path';

// Path to the data file - using an absolute path to ensure it works in all environments
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'flights.json');

// Ensure the data directory exists
if (!fs.existsSync(DATA_DIR)) {
    try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
        console.log('Created data directory:', DATA_DIR);
    } catch (error) {
        console.error('Failed to create data directory:', error);
    }
}

/**
 * Load flights from the JSON file
 * @returns {Array} Array of flight objects
 */
function loadFlights() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const data = fs.readFileSync(DATA_FILE, 'utf8');
            const flights = JSON.parse(data);
            console.log(`Loaded ${flights.length} flights from storage`);
            return Array.isArray(flights) ? flights : [];
        } else {
            console.log('No flight data file found, starting with empty array');
            saveFlights([]);
            return [];
        }
    } catch (error) {
        console.error('Error loading flights from file:', error);
        return [];
    }
}

/**
 * Save flights to the JSON file
 * @param {Array} flights Array of flight objects to save
 */
function saveFlights(flights) {
    try {
        // Ensure directory exists before writing
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
        }
        
        fs.writeFileSync(DATA_FILE, JSON.stringify(flights, null, 2), 'utf8');
        console.log(`Saved ${flights.length} flights to storage`);
        return true;
    } catch (error) {
        console.error('Error saving flights to file:', error);
        return false;
    }
}

// Load flights on module initialization
let flights = loadFlights();

// Flag to track if we're currently updating the Vestaboard
let isUpdatingVestaboard = false;
// Timestamp of the last update
let lastUpdateTime = 0;

// Function to ensure we don't exceed 5 flights
function capFlightsArray() {
    if (flights.length > 5) {
        console.log(`Capping flights array from ${flights.length} to 5 items`);
        flights = flights.slice(0, 5);
        saveFlights(flights);
    }
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

    // Manual refresh endpoint
    if (req.method === 'POST' && req.url.endsWith('/refresh')) {
        try {
            console.log('Manual refresh requested');
            
            // Reload flights from storage to ensure we have the latest data
            flights = loadFlights();
            
            // Force an immediate update of the Vestaboard
            await updateVestaboardWithCurrentFlights();
            
            return res.status(200).json({
                success: true,
                message: 'Vestaboard refresh initiated',
                flights: flights
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
            // Reload flights from storage to ensure we have the latest data
            flights = loadFlights();
            
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
            
            // Reload flights to ensure we have the latest data
            flights = loadFlights();
            
            // Add to flights array
            flights.push(newFlight);
            
            // Cap and save
            capFlightsArray();
            
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
            
            // Reload flights to ensure we have the latest data
            flights = loadFlights();
            
            if (isNaN(index) || index < 0 || index >= flights.length) {
                return res.status(400).json({ 
                    success: false,
                    message: 'Invalid index'
                });
            }

            const deletedFlight = flights[index];
            flights.splice(index, 1);
            console.log('Deleted flight at index', index, ':', deletedFlight);
            
            // Save to storage
            saveFlights(flights);

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
