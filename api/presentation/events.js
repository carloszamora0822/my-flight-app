import { connectToDatabase } from '../../lib/mongodb';

/**
 * API endpoint to fetch event data formatted for presentation slides
 */
export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Accept');

    if (req.method === 'OPTIONS') return res.status(200).end();

    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ 
            success: false, 
            message: 'Method not allowed' 
        });
    }

    try {
        // Connect to database
        const { db } = await connectToDatabase();
        
        // Get all events
        const events = await db.collection('events').find({}).toArray();
        
        // Sort by date and time
        const sortedEvents = [...events].sort((a, b) => {
            // First compare by date
            const dateComparison = a.date.localeCompare(b.date);
            if (dateComparison !== 0) return dateComparison;
            
            // If dates are same, compare by time
            return a.time.localeCompare(b.time);
        });
        
        // Format for presentation
        const formattedData = {
            title: "Upcoming Events",
            subtitle: `Updated: ${new Date().toLocaleString()}`,
            tableHeaders: ["Date", "Time", "Description"],
            tableData: sortedEvents.map(event => {
                // Format time to be more readable (e.g., 1230 -> 12:30)
                const timeStr = event.time || '0000';
                const formattedTime = `${timeStr.substring(0, 2)}:${timeStr.substring(2, 4)}`;
                
                return [
                    event.date || '',
                    formattedTime,
                    event.description || ''
                ];
            }),
            // Add additional metadata your presentation might need
            totalCount: sortedEvents.length,
            updateTimestamp: new Date().toISOString()
        };
        
        // Return the formatted data
        return res.status(200).json(formattedData);
        
    } catch (error) {
        console.error('Error fetching event presentation data:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error fetching event data',
            error: error.message
        });
    }
}
