import { MongoClient, Db } from 'mongodb';

let client: MongoClient;
let db: Db;

export async function connectToMongoDB(): Promise<Db> {
  if (db) {
    return db;
  }

  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    client = new MongoClient(uri);
    await client.connect();
    
    db = client.db('znpos'); // Use 'znpos' as database name
    console.log('Connected to MongoDB successfully');
    
    return db;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

export function getDb(): Db {
  if (!db) {
    throw new Error('Database not initialized. Call connectToMongoDB first.');
  }
  return db;
}

export async function closeConnection(): Promise<void> {
  if (client) {
    await client.close();
    console.log('MongoDB connection closed');
  }
}