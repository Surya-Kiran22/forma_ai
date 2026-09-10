import mongoose from 'mongoose';
import { env } from './env.js';

let mongoMemoryServer = null;

export async function connectDB() {
  try {
    // Attempt connecting to the configured MONGODB_URI
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`[MongoDB] Connected successfully to ${env.MONGODB_URI}`);
  } catch (error) {
    if (env.NODE_ENV !== 'production') {
      console.warn(`[MongoDB] Primary MongoDB connection failed (${error.message}).`);
      console.warn(`[MongoDB] 💡 Tip: If using MongoDB Atlas, whitelist your IP in Atlas Network Access.`);
      console.warn(`[MongoDB] 💡 Tip: If using local MongoDB, start the service (net start MongoDB or mongod).`);
      console.warn(`[MongoDB] Falling back to MongoMemoryServer (downloading/starting in-memory database)...`);
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        mongoMemoryServer = await MongoMemoryServer.create();
        const mongoUri = mongoMemoryServer.getUri();
        await mongoose.connect(mongoUri);
        console.log(`[MongoDB] MongoMemoryServer started and connected at ${mongoUri}`);
      } catch (memErr) {
        console.error('[MongoDB] Failed to start MongoMemoryServer:', memErr);
        throw memErr;
      }
    } else {
      console.error('[MongoDB] Connection error:', error);
      throw error;
    }
  }
}

export async function disconnectDB() {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
}
