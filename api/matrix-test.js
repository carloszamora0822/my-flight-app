export default function handler(req, res) {
  // Simple hardcoded flight matrix for testing
  const flightMatrix = [
    [0, 0, 0, 22, 0, 2, 20, 0, 6, 12, 9, 7, 8, 20, 0, 2, 15, 1, 18, 4, 0, 0],
    [27, 28, 29, 30, 0, 4, 1, 22, 9, 4, 6, 0, 16, 16, 12, 0, 14, 29, 34, 35, 29, 30],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  ];
  
  // Simple hardcoded event matrix for testing
  const eventMatrix = [
    [0, 0, 0, 22, 0, 5, 22, 5, 14, 20, 0, 2, 15, 1, 18, 4, 0, 0, 0, 0, 0, 0],
    [29, 27, 53, 28, 28, 0, 27, 28, 58, 29, 30, 0, 5, 22, 5, 14, 20, 0, 27, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  ];
  
  // Get type from query parameter
  const type = req.query.type || 'flights';
  
  // Return appropriate matrix
  if (type === 'events') {
    res.status(200).json(eventMatrix);
  } else {
    res.status(200).json(flightMatrix);
  }
}
