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

  // Keep the pool controlled for Next.js / serverless
  // workloads.
  maxPoolSize: 10,

  // Connections are created on demand.
  minPoolSize: 0,

  // ---------------------------------------------------
  // Connection Establishment
  // ---------------------------------------------------

  // Allow enough time for MongoDB replica-set
  // server selection during temporary network delay.
  serverSelectionTimeoutMS: 30000,

  // Allow more time for an individual TCP/TLS
  // connection to establish.
  connectTimeoutMS: 20000,

  // ---------------------------------------------------
  // Socket
  // ---------------------------------------------------

  // Protect against long/inactive socket problems
  // without being unnecessarily aggressive.
  socketTimeoutMS: 30000,

  // ---------------------------------------------------
  // Idle Connection Management
  // ---------------------------------------------------

  // Keep reusable connections available longer,
  // reducing unnecessary reconnects after short idle periods.
  maxIdleTimeMS: 300000,
});

// =====================================================
// Reuse Existing Connection
// =====================================================

const clientPromise =
  global._mongoClientPromise ??
  client.connect().then((connectedClient) => {
    console.log("[MONGO] Connected successfully");
    return connectedClient;
  });

// =====================================================
// Cache Connection
// =====================================================

global._mongoClientPromise = clientPromise;

// =====================================================
// Export
// =====================================================

export default clientPromise;