import { MongoClient } from "mongodb";
import { attachDatabasePool } from "@vercel/functions";

// =====================================================
// MongoDB URI
// =====================================================

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is missing");
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
  minPoolSize: 0,

  // ---------------------------------------------------
  // Connection Timeouts
  // ---------------------------------------------------

  serverSelectionTimeoutMS: 15000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 20000,

  // ---------------------------------------------------
  // Idle Connection Management
  // ---------------------------------------------------

  maxIdleTimeMS: 120000,
});

// =====================================================
// Vercel Connection Pool Management
// =====================================================

attachDatabasePool(client);

// =====================================================
// Reuse Existing Connection
// =====================================================

const clientPromise =
  global._mongoClientPromise ??
  client.connect();

// =====================================================
// Cache Connection
// =====================================================

global._mongoClientPromise = clientPromise;

// =====================================================
// Export
// =====================================================

export default clientPromise;