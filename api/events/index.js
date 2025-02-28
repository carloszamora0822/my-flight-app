import { createEventMatrix } from '../../vestaboard/eventConversion';
import { updateVestaboard } from '../../vestaboard/vestaboard';
import { getCollection } from '../../lib/mongodb';

// In-memory cache for the current request
let eventsCache = [];

// Flag to track if we're currently updating the Vestaboard
let isUpdatingVestaboard = false;
// Timestamp of the last update
let lastUpdateTime = 0;

/**
 * Load events from the database
 */
async function loadEvents() {
    try {
        console.log('Loading events from MongoDB...');
        const collection = await getCollection('events');
        const events = await collection.find({}).sort({ _id: -1 }).limit(5).toArray();
        
        console.log(`Loaded ${events.length} events from MongoDB`);
        
        // Transform from MongoDB document to event object
        return events.map(doc => ({
            date: doc.date || '',
            time: doc.time || '',
            description: doc.description || ''
        }));
    } catch (error) {
        console.error('Error loading events from MongoDB:', error);
        return []; // Return empty array on error
    }
}

/**
 * Save events to the database
 * @param {Array} events The events to save
 */
async function saveEvents(events) {
    try {
        console.log(`Saving ${events.length} events to MongoDB...`);
        
        const collection = await getCollection('events');
        
        // Clear existing events and insert new ones
        await collection.deleteMany({});
        
        if (events.length > 0) {
            await collection.insertMany(events.map(event => ({
                date: event.date || '',
                time: event.time || '',
                description: event.description || '',
                createdAt: new Date()
            })));
        }
        
        console.log(`Saved ${events.length} events to MongoDB`);
        
        // Update the in-memory cache
        eventsCache = [...events];
        return events;
    } catch (error) {
        console.error('Error saving events to MongoDB:', error);
        return eventsCache; // Return cached data on error
    }
}

/**
 * Function to ensure we don't exceed 5 events 
 * @param {Array} events The events array to cap
 * @returns {Array} The capped events array
 */
function capEventsArray(events) {
    if (events.length > 5) {
        console.log(`Capping events array from ${events.length} to 5 items`);
        return events.slice(-5); // Keep the 5 newest events
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
        console.log('Starting Vestaboard update with events:', JSON.stringify(events));

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
        
        try {
            // Update the Vestaboard
            const result = await updateVestaboard(matrix);
            console.log('Vestaboard update result:', JSON.stringify(result));
            
            // Update last update time
            lastUpdateTime = Date.now();
            console.log('Vestaboard updated successfully at', new Date(lastUpdateTime).toISOString());
            return true;
        } catch (vestaError) {
            console.error('Error updating Vestaboard:', vestaError);
            return false;
        }
    } catch (error) {
        console.error('Error preparing Vestaboard update:', error);
        return false;
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

    try {
        // Always load events from database to ensure we have the latest data
        eventsCache = await loadEvents();
    } catch (error) {
        console.error('Failed to load events:', error);
        // Continue with empty cache if database access fails
        eventsCache = [];
    }

    // Get all events
    if (req.method === 'GET') {
        try {
            console.log('GET request received, returning events:', eventsCache.length);
            return res.status(200).json(eventsCache);
        } catch (error) {
            console.error('Error in GET events:', error);
            return res.status(500).json({ 
                message: 'Failed to fetch events',
                success: false
            });
        }
    }

    // Add new event
    if (req.method === 'POST') {
        try {
            // Validate request body
            if (!req.body.date || !req.body.time || !req.body.description) {
                return res.status(400).json({ 
                    success: false,
                    message: 'Missing required fields: date, time, description' 
                });
            }
            
            // Enforce character limits
            const newEvent = {
                date: (req.body.date || '').substring(0, 5),         // Limit to 5 characters
                time: (req.body.time || '').substring(0, 5),         // Limit to 5 characters
                description: (req.body.description || '').substring(0, 10)  // Limit to 10 characters
            };
            
            console.log('Adding new event:', newEvent);
            
            // Add to events array
            const updatedEvents = [...eventsCache, newEvent];
            
            // Cap to 5 events
            const capped = capEventsArray(updatedEvents);
            
            // Save to database
            try {
                await saveEvents(capped);
            } catch (dbError) {
                console.error('Database save error:', dbError);
                // Continue with the local changes even if database save fails
            }
            
            // Always update Vestaboard with the events
            try {
                await updateVestaboardWithEvents(capped);
            } catch (vestaError) {
                console.error('Vestaboard update error:', vestaError);
                // Continue even if Vestaboard update fails
            }
            
            return res.status(200).json({
                success: true,
                events: capped
            });
        } catch (error) {
            console.error('Failed to add event:', error);
            return res.status(500).json({ 
                message: 'Failed to add event', 
                success: false,
                error: error.message
            });
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
            
            // Save updated events list to database
            try {
                await saveEvents(updatedEvents);
            } catch (dbError) {
                console.error('Database save error on delete:', dbError);
                // Continue with the local changes even if database save fails
            }
            
            // Always update Vestaboard after deletion
            try {
                await updateVestaboardWithEvents(updatedEvents);
            } catch (vestaError) {
                console.error('Vestaboard update error on delete:', vestaError);
                // Continue even if Vestaboard update fails
            }
            
            return res.status(200).json({
                success: true,
                events: updatedEvents
            });
        } catch (error) {
            console.error('Failed to delete event:', error);
            return res.status(500).json({ 
                message: 'Failed to delete event',
                success: false,
                error: error.message
            });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
