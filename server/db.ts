import { MongoClient, Db } from 'mongodb';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;
let connectionPromise: Promise<Db | null> | null = null;

export async function getDb(): Promise<Db | null> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return null;
  }

  // Return existing connected Db instance if available
  if (cachedDb) {
    return cachedDb;
  }

  // Reuse ongoing connection attempt to prevent race conditions
  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = (async () => {
    try {
      if (!cachedClient) {
        cachedClient = new MongoClient(uri, {
          connectTimeoutMS: 10000,
          serverSelectionTimeoutMS: 10000,
          maxPoolSize: 10,
        });
      }
      await cachedClient.connect();
      cachedDb = cachedClient.db();
      console.log('Successfully connected to MongoDB Atlas!');
      return cachedDb;
    } catch (error: any) {
      console.error(`MongoDB Connection Error: ${error?.message || error}. Falling back to Local Memory Store.`);
      cachedClient = null;
      cachedDb = null;
      return null;
    } finally {
      connectionPromise = null;
    }
  })();

  return connectionPromise;
}

export function isMongoConnected(): boolean {
  return !!cachedDb;
}

