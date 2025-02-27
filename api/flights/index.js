import { createVestaMatrix } from '../../vestaboard/vestaConversion';
import { updateVestaboard } from '../../vestaboard/vestaboard';

// Initialize state
let flights = [];
let updateQueue = [];
let isProcessing = false;
let queueTimer = null;

// Log the current state for debugging
function logState() {
    console.log('=== CURRENT STATE ===');
    console.log(`Flights: ${flights.length}`);
    console.log(`Queue: ${updateQueue.length} items`);
    console.log(`Processing: ${isProcessing}`);
    console.log('====================');
}

/**
 * Process the queue one item at a time with delay between items
 */
async function processQueue() {
    // If already processing or queue is empty, do nothing
    if (isProcessing || updateQueue.length === 0) {
        console.log(`Queue check: processing=${isProcessing}, queue length=${updateQueue.length}`);
        return;
    }

    console.log(`Starting to process queue with ${updateQueue.length} items`);
    isProcessing = true;

    try {
        // Get the next matrix from the queue but don't remove it yet
        const matrix = updateQueue[0];
        console.log('Processing next item in queue');

        // Send update to Vestaboard
        await updateVestaboard(matrix);
        console.log('Vestaboard update successful');

        // Only remove the item from queue after successful update
        updateQueue.shift();
        console.log(`Item processed. Remaining queue: ${updateQueue.length} items`);
    } catch (error) {
        console.error('Error updating Vestaboard:', error);
        // We don't remove the item from queue on error, will retry
    } finally {
        // Set a timer to process the next item after delay
        console.log('Waiting 10 seconds before processing next item...');
        
        // Clear any existing timer
        if (queueTimer) {
            clearTimeout(queueTimer);
        }
        
        queueTimer = setTimeout(() => {
            isProcessing = false;
            processQueue(); // Process next item after delay
        }, 10000); // 10 second delay
    }
}

/**
 * Add a new update to the queue and start processing if not already
 */
function queueUpdate(matrix) {
    // Add the update to the queue
    updateQueue.push(matrix);
    console.log(`Added update to queue. Queue now has ${updateQueue.length} items`);
    logState();

    // Start processing if not already processing
    if (!isProcessing) {
        processQueue();
    } else {
        console.log('Already processing queue. This update will be processed in order.');
    }
}

export default async function handler(req, res) {
    // CORS setup
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Accept');

    if (req.method === 'OPTIONS') return res.status(200).end();

    // GET - return all flights
    if (req.method === 'GET') {
        try {
            console.log(`GET request received. Returning ${flights.length} flights.`);
            return res.status(200).json(flights || []);
        } catch (error) {
            console.error('Error handling GET request:', error);
            return res.status(500).json({ message: 'Failed to fetch flights' });
        }
    }

    // POST - add new flight
    if (req.method === 'POST') {
        try {
            const newFlight = req.body;
            console.log('Adding new flight:', newFlight);
            
            // Add to flights array
            flights.push(newFlight);
            
            // Create matrix with current flights
            const matrix = createVestaMatrix([...flights]);
            
            // Queue the update
            queueUpdate(matrix);
            
            console.log(`Flight added. Total flights: ${flights.length}`);
            return res.status(200).json({
                success: true,
                flights: flights
            });
        } catch (error) {
            console.error('Error adding flight:', error);
            return res.status(500).json({ message: 'Failed to add flight' });
        }
    }

    // DELETE - remove flight
    if (req.method === 'DELETE') {
        try {
            const index = parseInt(req.url.split('/').pop());
            
            if (isNaN(index) || index < 0 || index >= flights.length) {
                console.error(`Invalid delete index: ${index}`);
                return res.status(400).json({ 
                    success: false,
                    message: 'Invalid index'
                });
            }

            // Remove from flights array
            const deletedFlight = flights[index];
            console.log(`Deleting flight at index ${index}:`, deletedFlight);
            flights.splice(index, 1);
            
            // Create matrix with updated flights
            const matrix = createVestaMatrix([...flights]);
            
            // Queue the update
            queueUpdate(matrix);
            
            console.log(`Flight deleted. Total flights: ${flights.length}`);
            return res.status(200).json({
                success: true,
                flights: flights
            });
        } catch (error) {
            console.error('Error deleting flight:', error);
            return res.status(500).json({ message: 'Failed to delete flight' });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
