import { MongoClient } from "mongodb";

// =====================================================
// MongoDB URI
// =====================================================

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error(
    "MONGODB_URI is missing in .env.local",
  );
}

// =====================================================
// Global MongoDB Client Promise
// =====================================================

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise:
    | Promise<MongoClient>
    | undefined;
}

// =====================================================
// MongoDB Client
// =====================================================

const client = new MongoClient(uri, {
  // ---------------------------------------------------
  // Connection Pool
  // ---------------------------------------------------

  maxPoolSize: 10,
  minPoolSize: 1,

  // ---------------------------------------------------
  // Connection Timeouts
  // ---------------------------------------------------

  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 5000,
  socketTimeoutMS: 10000,

  // ---------------------------------------------------
  // Keep connections alive
  // ---------------------------------------------------

  maxIdleTimeMS: 60000,
});

// =====================================================
// Reuse Existing Connection
// =====================================================

const clientPromise =
  global._mongoClientPromise ??
  client.connect();

// =====================================================
// Cache Connection During Development
// =====================================================

if (process.env.NODE_ENV === "development") {
  global._mongoClientPromise =
    clientPromise;
}

// =====================================================
// Export
// =====================================================

export default clientPromise;