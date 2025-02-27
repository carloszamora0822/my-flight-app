import { createVestaMatrix } from '../../vestaboard/vestaConversion';
import { updateVestaboard } from '../../vestaboard/vestaboard';

// Initialize flights array properly
let flights = [];
let updateQueue = [];
let isUpdating = false;
let queueTimer = null;

// Debug function to log the current state
function logState() {
    console.log('Current state:');
    console.log('- Flights:', JSON.stringify(flights));
    console.log('- Queue length:', updateQueue.length);
    console.log('- Is updating:', isUpdating);
}

/**
 * Process the next item in the queue after waiting for the specified delay
 */
function scheduleNextUpdate() {
    if (queueTimer) {
        clearTimeout(queueTimer);
    }
    
    queueTimer = setTimeout(() => {
        processQueue();
    }, 10000); // 10 second delay
    
    console.log('Scheduled next update in 10 seconds');
}

/**
 * Process the next item in the queue if available
 */
async function processQueue() {
    // Clear any existing timer
    if (queueTimer) {
        clearTimeout(queueTimer);
        queueTimer = null;
    }
    
    // If already updating or queue is empty, do nothing
    if (isUpdating) {
        console.log('Already processing an update, will not start another');
        return;
    }
    
    if (updateQueue.length === 0) {
        console.log('Queue is empty, nothing to process');
        return;
    }
    
    // Set flag to indicate we're updating
    isUpdating = true;
    
    // Get the next matrix from the queue
    const matrix = updateQueue.shift();
    console.log('Processing update, remaining items in queue:', updateQueue.length);
    
    try {
        // Send the update to Vestaboard
        console.log('Sending update to Vestaboard');
        await updateVestaboard(matrix);
        console.log('Vestaboard updated successfully');
    } catch (error) {
        console.error('Failed to update Vestaboard:', error);
    } finally {
        // Reset updating flag
        isUpdating = false;
        
        // If there are more items in the queue, schedule the next update
        if (updateQueue.length > 0) {
            console.log('More updates in queue, scheduling next update');
            scheduleNextUpdate();
        } else {
            console.log('Queue is now empty');
        }
    }
}

/**
 * Add a matrix to the update queue and start processing if not already
 */
function queueUpdate(matrix) {
    // Add the matrix to the queue
    updateQueue.push(matrix);
    console.log(`Added update to queue. Queue now has ${updateQueue.length} items`);
    
    // If we're not currently updating, start processing the queue
    if (!isUpdating) {
        console.log('Starting queue processing immediately');
        processQueue();
    } else {
        console.log('Update added to queue, will be processed after current update');
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
            console.log('GET request received, returning flights:', flights.length);
            return res.status(200).json(flights || []);
        } catch (error) {
            console.error('Error in GET:', error);
            return res.status(500).json({ message: 'Failed to fetch flights' });
        }
    }

    // add new flight
    if (req.method === 'POST') {
        try {
            const newFlight = req.body;
            flights.push(newFlight);
            console.log('Added new flight:', newFlight);

            // Create a matrix with the current flights
            console.log('Creating Vesta matrix with flights:', flights.length);
            const matrix = createVestaMatrix([...flights]); // Create a copy to avoid reference issues
            
            // Queue the update
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

            // Create a matrix with the updated flights
            console.log('Creating Vesta matrix after deletion with flights:', flights.length);
            const matrix = createVestaMatrix([...flights]); // Create a copy to avoid reference issues
            
            // Queue the update
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
