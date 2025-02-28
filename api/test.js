// Simple API endpoint to test if the API routes are working
export default function handler(req, res) {
  res.status(200).json({ 
    success: true, 
    message: 'Test API endpoint is working',
    timestamp: new Date().toISOString(),
    query: req.query
  });
}
