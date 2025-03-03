/**
 * Simple API endpoint that returns text formatted for Vestaboard Read-Write API
 * Uses Central Standard Time (Chicago)
 */
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
    // Get date in Chicago timezone (America/Chicago)
    const chicagoDate = new Date().toLocaleString('en-US', {
      timeZone: 'America/Chicago',
      month: '2-digit',
      day: '2-digit',
      timeZoneName: 'short'
    });
    
    // Parse out just the date part MM/DD
    const dateParts = chicagoDate.split(',')[0].split('/');
    const dateStr = `${dateParts[0]}/${dateParts[1]}`;
    
    text = `CHECKLIST: ${dateStr} FLIGHTS DAVID 881 TAMPA JAMES 901 TAMPA`;
  } else {
    text = 'UPCOMING EVENTS: 03/05 BIRTHDAY PARTY 03/10 MEETING 03/15 CONFERENCE';
  }

  // Log the date for debugging
  console.log(`Using date: ${dateStr}`);

  // Return the text formatted for Vestaboard
  res.status(200).json({
    text: text
  });
}
