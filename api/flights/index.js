import { createVestaMatrix } from '../../vestaboard/vestaConversion';
import { updateVestaboard } from '../../vestaboard/vestaboard';

// Initialize flights array properly
let flights = [];
let updateQueue = [];
let isUpdating = false;

// Debug function to log the current state
function logState() {
    console.log('Current state:');
    console.log('- Flights:', flights);
    console.log('- Queue length:', updateQueue.length);
    console.log('- Is updating:', isUpdating);
}

async function processQueue() {
    if (isUpdating || updateQueue.length === 0) {
        console.log('Queue is empty or already updating');
        return;
    }

    isUpdating = true;
    const matrix = updateQueue.shift();

    console.log('Processing matrix:', matrix);
    console.log('Remaining queue:', updateQueue);

    try {
        await updateVestaboard(matrix);
        console.log('Vestaboard updated successfully');
    } catch (error) {
        console.error('Failed to update Vestaboard:', error);
    } finally {
        isUpdating = false;
        // Process the next item in the queue immediately if there are more items
        if (updateQueue.length > 0) {
            console.log('Processing next item in queue');
            setTimeout(() => processQueue(), 10000); // 10 seconds delay between updates
        } else {
            console.log('Queue is now empty');
        }
    }
}

function queueUpdate(matrix) {
    updateQueue.push(matrix);
    console.log('Queued matrix for Vestaboard update');
    logState();

    if (!isUpdating) {
        console.log('Starting queue processing');
        processQueue();
    } else {
        console.log('Queue processing already in progress, update added to queue');
    }
}

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
            console.log('Added new flight:', newFlight);

            // Capture a snapshot of the flights array at this moment
            const flightsSnapshot = JSON.parse(JSON.stringify(flights));
            console.log('Creating Vesta matrix with flights:', flightsSnapshot);
            const matrix = createVestaMatrix(flightsSnapshot);
            queueUpdate(matrix);

            return res.status(200).json({
                success: true,
                flights: flights
            });
        } catch (error) {
            console.error('Failed to add flight:', error);
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

            const deletedFlight = flights[index];
            flights.splice(index, 1);
            console.log('Deleted flight at index', index, ':', deletedFlight);

            // update board
            console.log('Creating Vesta matrix after deletion with flights:', flights);
            const matrix = createVestaMatrix(flights);
            queueUpdate(matrix);

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
