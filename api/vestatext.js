/**
 * Simple API endpoint that returns text formatted for Vestaboard Read-Write API
 * Uses date-fns-tz for reliable timezone handling
 */
import { format, utcToZonedTime } from 'date-fns-tz';

export default function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Accept');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Get the type from the query
  const type = req.query.type || 'flights';
  
  let text = '';
  if (type === 'flights') {
    // Get the current date in Central Time (Chicago)
    const now = new Date();
    
    // Force timezone to be Central Time
    const tz = 'America/Chicago';
    const centralTimeNow = utcToZonedTime(now, tz);
    
    // Format as MM/DD
    const dateStr = format(centralTimeNow, 'MM/dd', { timeZone: tz });
    
    // Log for debugging
    console.log(`Server date: ${now.toISOString()}`);
    console.log(`Converted to Central time: ${dateStr}`);
    
    text = `CHECKLIST: ${dateStr} FLIGHTS DAVID 881 TAMPA JAMES 901 TAMPA`;
  } else {
    text = 'UPCOMING EVENTS: 03/05 BIRTHDAY PARTY 03/10 MEETING 03/15 CONFERENCE';
  }

  // Return the text formatted for Vestaboard
  res.status(200).json({
    text: text
  });
}
