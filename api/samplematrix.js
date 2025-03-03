import { createVestaMatrix } from '../vestaboard/vestaConversion';
import { createEventMatrix } from '../vestaboard/eventConversion';

/**
 * API endpoint with sample matrices for Power Automate testing
 * Doesn't require MongoDB connection
 */
export default function handler(req, res) {
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
    // Get type from query parameter - 'flights' or 'events'
    const type = req.query.type || 'flights';
    
    // Validate type
    if (type !== 'flights' && type !== 'events') {
      return res.status(400).json({
        success: false,
        message: "Query parameter 'type' must be either 'flights' or 'events'"
      });
    }
    
    // Sample data
    const sampleFlights = [
      { time: '0800', callsign: 'N12345', type: 'C172', destination: 'KAUS' },
      { time: '0930', callsign: 'N54321', type: 'C182', destination: 'KSAT' },
      { time: '1100', callsign: 'N98765', type: 'PA28', destination: 'KDFW' },
      { time: '1330', callsign: 'N67890', type: 'C152', destination: 'KHOU' },
      { time: '1500', callsign: 'N11223', type: 'BE36', destination: 'KELP' }
    ];
    
    const sampleEvents = [
      { date: '03/02', description: 'Safety Meeting' },
      { date: '03/05', description: 'Maintenance' },
      { date: '03/10', description: 'Pilot Seminar' },
      { date: '03/15', description: 'FAA Inspection' },
      { date: '03/20', description: 'Club Cookout' }
    ];
    
    // Generate matrix
    let matrix;
    if (type === 'flights') {
      matrix = createVestaMatrix(sampleFlights);
    } else {
      matrix = createEventMatrix(sampleEvents);
    }
    
    // Return matrix
    return res.status(200).json({
      success: true,
      matrix: matrix,
      message: `Successfully generated sample ${type} matrix`
    });
    
  } catch (error) {
    console.error('Error generating sample matrix:', error);
    return res.status(500).json({
      success: false,
      message: 'Error generating sample matrix',
      error: error.message
    });
  }
}
