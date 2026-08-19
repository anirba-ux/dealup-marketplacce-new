import { ObjectId } from "mongodb";

import clientPromise from "@/lib/db/mongodb";

// =====================================
// OTP Verification Record
// =====================================

export interface PhoneVerification {
  _id?: ObjectId;

  userId: string;

  phone: string;

  otpHash: string;

  expiresAt: Date;

  attempts: number;

  verified: boolean;

  createdAt: Date;

  updatedAt: Date;
}

// =====================================
// Collection
// =====================================

async function getCollection() {
  const client = await clientPromise;

  const db = client.db("dealup");

  return db.collection<PhoneVerification>(
    "phoneVerifications",
  );
}

// =====================================
// Create OTP Record
// =====================================

export async function createPhoneVerification(
  data: Omit<
    PhoneVerification,
    "_id"
  >,
) {
  const collection =
    await getCollection();

  const result =
    await collection.insertOne(data);

  return {
    ...data,
    _id: result.insertedId,
  };
}

// =====================================
// Find Active OTP
// =====================================

export async function findActivePhoneVerification(
  userId: string,
  phone: string,
) {
  const collection =
    await getCollection();

  return collection.findOne({
    userId,

    phone,

    verified: false,

    expiresAt: {
      $gt: new Date(),
    },
  });
}

// =====================================
// Update Attempts
// =====================================

export async function incrementVerificationAttempts(
  verificationId: ObjectId,
) {
  const collection =
    await getCollection();

  return collection.updateOne(
    {
      _id: verificationId,
    },
    {
      $inc: {
        attempts: 1,
      },

      $set: {
        updatedAt: new Date(),
      },
    },
  );
}

// =====================================
// Mark OTP Verified
// =====================================

export async function markPhoneVerificationVerified(
  verificationId: ObjectId,
) {
  const collection =
    await getCollection();

  return collection.updateOne(
    {
      _id: verificationId,
    },
    {
      $set: {
        verified: true,

        updatedAt: new Date(),
      },
    },
  );
}

// =====================================
// Invalidate Existing OTPs
// =====================================

export async function invalidatePhoneVerifications(
  userId: string,
  phone: string,
) {
  const collection =
    await getCollection();

  return collection.updateMany(
    {
      userId,

      phone,

      verified: false,
    },
    {
      $set: {
        verified: true,

        updatedAt: new Date(),
      },
    },
  );
}

// =====================================
// Find Recent OTP Requests
// =====================================

export async function countRecentPhoneVerificationRequests(
  userId: string,
  phone: string,
  since: Date,
) {
  const collection =
    await getCollection();

  return collection.countDocuments({
    userId,

    phone,

    createdAt: {
      $gte: since,
    },
  });
}