import { createEventMatrix } from '../../vestaboard/eventConversion';
import { updateVestaboard } from '../../vestaboard/vestaboard';

// In-memory cache of events
let eventsCache = [];

// Flag to track if we're currently updating the Vestaboard
let isUpdatingVestaboard = false;
// Timestamp of the last update
let lastUpdateTime = 0;

/**
 * Function to ensure we don't exceed 5 events 
 * @param {Array} events The events array to cap
 * @returns {Array} The capped events array
 */
function capEventsArray(events) {
    if (events.length > 5) {
        console.log(`Capping events array from ${events.length} to 5 items`);
        return events.slice(0, 5);
    }
    return events;
}

/**
 * Update the Vestaboard with the given events
 * @param {Array} events The events to display
 */
async function updateVestaboardWithEvents(events) {
    // If already updating, don't do anything
    if (isUpdatingVestaboard) {
        console.log('Already updating Vestaboard, skipping this update request');
        return;
    }

    try {
        // Set flag to prevent concurrent updates
        isUpdatingVestaboard = true;
        console.log('Starting Vestaboard update with events:', events.length);

        // Create matrix with events
        const matrix = createEventMatrix([...events]);
        
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
        console.log('Vestaboard updated successfully with events at', new Date(lastUpdateTime).toISOString());
        
        // Update cache
        eventsCache = [...events];
    } catch (error) {
        console.error('Error updating Vestaboard with events:', error);
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

    // Get all events
    if (req.method === 'GET') {
        try {
            console.log('GET request received, returning events:', eventsCache.length);
            return res.status(200).json(eventsCache);
        } catch (error) {
            console.error('Error in GET events:', error);
            return res.status(500).json({ message: 'Failed to fetch events' });
        }
    }

    // Add new event or update Vestaboard with events
    if (req.method === 'POST') {
        try {
            // If it's a submission with the current events list
            if (req.body.events && Array.isArray(req.body.events)) {
                const events = req.body.events;
                console.log('Received events list with length:', events.length);
                
                // Cap events to 5
                const capped = capEventsArray(events);
                
                // Update Vestaboard with these events
                await updateVestaboardWithEvents(capped);
                
                return res.status(200).json({
                    success: true,
                    events: capped
                });
            }
            // If it's a single new event to add
            else if (req.body.date && req.body.time && req.body.description) {
                const newEvent = req.body;
                console.log('Adding new event:', newEvent);
                
                // Add to events array
                const updatedEvents = [...eventsCache, newEvent];
                
                // Cap events to 5
                const capped = capEventsArray(updatedEvents);
                
                // Update Vestaboard with these events if sendToVesta is true
                if (req.body.sendToVesta) {
                    await updateVestaboardWithEvents(capped);
                }
                
                return res.status(200).json({
                    success: true,
                    events: capped
                });
            }
            else {
                return res.status(400).json({ 
                    success: false,
                    message: 'Invalid request format' 
                });
            }
        } catch (error) {
            console.error('Failed to add event:', error);
            return res.status(500).json({ message: 'Failed to add event' });
        }
    }

    // Delete event
    if (req.method === 'DELETE') {
        try {
            const index = parseInt(req.url.split('/').pop());
            
            if (isNaN(index) || index < 0 || index >= eventsCache.length) {
                return res.status(400).json({ 
                    success: false,
                    message: 'Invalid index'
                });
            }

            const updatedEvents = [...eventsCache];
            const deletedEvent = updatedEvents[index];
            updatedEvents.splice(index, 1);
            console.log('Deleted event at index', index, ':', deletedEvent);
            
            return res.status(200).json({
                success: true,
                events: updatedEvents
            });
        } catch (error) {
            console.error('Failed to delete event:', error);
            return res.status(500).json({ message: 'Failed to delete event' });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
