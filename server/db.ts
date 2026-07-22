import { MongoClient, Db } from 'mongodb';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;
let connectionPromise: Promise<Db | null> | null = null;
let lastMongoError: string | null = null;

export function getMongoUri(): string | null {
  return process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DATABASE_URL || process.env.MONGODB_URL || null;
}

export async function getDb(): Promise<Db | null> {
  const uri = getMongoUri();
  if (!uri) {
    lastMongoError = 'No MongoDB connection string found in environment variables (checked MONGODB_URI, MONGO_URI, DATABASE_URL, MONGODB_URL).';
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
      lastMongoError = null;
      console.log('Successfully connected to MongoDB Atlas!');
      return cachedDb;
    } catch (error: any) {
      lastMongoError = error?.message || String(error);
      console.error(`MongoDB Connection Error: ${lastMongoError}. Falling back to Local Memory Store.`);
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

export function getMongoStatus() {
  const uri = getMongoUri();
  return {
    mongoUriProvided: !!uri,
    mongodbConnected: !!cachedDb,
    mongoError: lastMongoError,
  };
}


