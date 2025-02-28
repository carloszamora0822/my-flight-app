import { connectToDatabase } from '../../lib/mongodb';

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      // Test MongoDB connection
      console.log('Testing MongoDB connection...');
      const startTime = Date.now();
      
      const { client, db } = await connectToDatabase();
      
      // Get server stats to verify connection
      const stats = await db.command({ serverStatus: 1 });
      
      const connectionTime = Date.now() - startTime;
      
      return res.status(200).json({
        success: true,
        message: 'Successfully connected to MongoDB',
        connectionTimeMs: connectionTime,
        version: stats.version,
        uptime: stats.uptime,
        ok: stats.ok
      });
    } catch (error) {
      console.error('MongoDB connection test failed:', error);
      
      return res.status(500).json({
        success: false, 
        message: 'Failed to connect to MongoDB',
        error: error.message
      });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
