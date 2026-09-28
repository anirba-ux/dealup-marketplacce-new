import { MongoClient } from "mongodb";

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
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

// =====================================================
// MongoDB Client
// =====================================================

const client = new MongoClient(uri, {
  // ---------------------------------------------------
  // Connection Pool
  // ---------------------------------------------------

  maxPoolSize: 20,
  minPoolSize: 2,
  waitQueueTimeoutMS: 5000,
  maxConnecting: 4,

  // ---------------------------------------------------
  // Connection Establishment
  // ---------------------------------------------------

  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,

  // ---------------------------------------------------
  // Socket
  // ---------------------------------------------------

  socketTimeoutMS: 30000,

  // ---------------------------------------------------
  // Idle Connection Management
  // ---------------------------------------------------

  maxIdleTimeMS: 120000,

  // ---------------------------------------------------
  // Retryable Operations
  // ---------------------------------------------------

  retryReads: true,
  retryWrites: true,
});

// =====================================================
// Reuse Existing MongoDB Connection
// =====================================================

const clientPromise =
  global._mongoClientPromise ??
  client.connect();

// =====================================================
// Cache Connection Globally
// =====================================================

global._mongoClientPromise = clientPromise;

// =====================================================
// Export
// =====================================================

export default clientPromise;