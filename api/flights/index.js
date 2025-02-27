import { createVestaMatrix } from '../../vestaboard/vestaConversion';
import { updateVestaboard } from '../../vestaboard/vestaboard';

let flights = [];
let updateQueue = [];
let isUpdating = false;

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
        setTimeout(() => {
            console.log('Waiting 10 seconds before processing next update');
            processQueue();
        }, 10000); // 10 seconds delay
    }
}

function queueUpdate(matrix) {
    updateQueue.push(matrix);
    console.log('Queued matrix:', matrix);
    console.log('Current queue:', updateQueue);

    if (!isUpdating) {
        processQueue();
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

            // update board
            const matrix = createVestaMatrix(flights);
            queueUpdate(matrix);

            return res.status(200).json({
                success: true,
                flights: flights
            });
        } catch (error) {
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

            flights.splice(index, 1);

            // update board
            const matrix = createVestaMatrix(flights);
            queueUpdate(matrix);

            return res.status(200).json({
                success: true,
                flights: flights
            });
        } catch (error) {
            return res.status(500).json({ message: 'Failed to delete flight' });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
