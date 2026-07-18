import { MongoClient, Db } from 'mongodb';

let client: MongoClient | null = null;
let db: Db | null = null;
let isConnected = false;
let hasFailed = false;
let lastAttemptTime = 0;
const RETRY_COOLDOWN_MS = 60000; // 1 minute cooldown between reconnection attempts

export async function getDb(): Promise<Db | null> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return null;
  }
  if (db && isConnected) {
    return db;
  }

  const now = Date.now();
  if (hasFailed && (now - lastAttemptTime < RETRY_COOLDOWN_MS)) {
    // Return null immediately without trying to connect and stalling API calls
    return null;
  }

  try {
    lastAttemptTime = now;
    // Avoid re-creating client if it exists but is disconnected
    if (!client) {
      client = new MongoClient(uri, {
        connectTimeoutMS: 2000,
        serverSelectionTimeoutMS: 2000,
      });
    }
    await client.connect();
    db = client.db();
    isConnected = true;
    hasFailed = false;
    console.log('Successfully connected to MongoDB Atlas!');
    return db;
  } catch (error: any) {
    console.warn(`MongoDB Connection Notice: ${error?.message || error}. Falling back to Local Memory Store.`);
    isConnected = false;
    hasFailed = true;
    db = null;
    return null;
  }
}

export function isMongoConnected(): boolean {
  return isConnected;
}
