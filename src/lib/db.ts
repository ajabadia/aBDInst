import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

// Check moved inside dbConnect

interface MongooseCache {
  conn: mongoose.Connection | null;
  promise: Promise<mongoose.Connection> | null;
}

declare global {
  var mongoose: MongooseCache;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      return mongoose.connection;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e: any) {
    cached.promise = null;

    // Alert Admin on critical DB failure
    // Use dynamic import to avoid circular dependency loop: db -> error-reporting -> email -> admin -> db
    import('./error-reporting').then(({ reportError }) => {
      reportError(e, 'Database Connection', 'critical');
    });

    throw e;
  }

  return cached.conn;
}

export default dbConnect;
