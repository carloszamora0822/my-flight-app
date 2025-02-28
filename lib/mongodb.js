import { MongoClient } from 'mongodb';

// Connection URL - Replace this with your MongoDB Atlas connection string
// Format: mongodb+srv://<username>:<password>@<cluster-url>/<database>?retryWrites=true&w=majority
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://username:password@cluster.mongodb.net/vbtapp?retryWrites=true&w=majority';
const MONGODB_DB = process.env.MONGODB_DB || 'vbtapp';

// Cache the MongoDB connection to reuse it across serverless function invocations
let cachedClient = null;
let cachedDb = null;

/**
 * Connect to MongoDB and return the database instance
 */
export async function connectToDatabase() {
  // If we have a cached connection, use it
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  // If no cached connection, create a new one
  const client = new MongoClient(MONGODB_URI, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  });

  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(MONGODB_DB);
    
    // Cache the client and db for future use
    cachedClient = client;
    cachedDb = db;
    
    return { client, db };
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

/**
 * Get a collection from the database
 * @param {string} collectionName - The name of the collection
 */
export async function getCollection(collectionName) {
  const { db } = await connectToDatabase();
  return db.collection(collectionName);
}
