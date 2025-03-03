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
    // Get today's date in Central Standard Time (Chicago)
    const now = new Date();
    // Adjust to Central Time (UTC-6)
    const centralTime = new Date(now.getTime() - (now.getTimezoneOffset() + 360) * 60000);
    const month = (centralTime.getMonth() + 1).toString().padStart(2, '0');
    const day = centralTime.getDate().toString().padStart(2, '0');
    const dateStr = `${month}/${day}`;
    
    text = `CHECKLIST: ${dateStr} FLIGHTS DAVID 881 TAMPA JAMES 901 TAMPA`;
  } else {
    text = 'UPCOMING EVENTS: 03/05 BIRTHDAY PARTY 03/10 MEETING 03/15 CONFERENCE';
  }

  // Return the text formatted for Vestaboard
  res.status(200).json({
    text: text
  });
}
